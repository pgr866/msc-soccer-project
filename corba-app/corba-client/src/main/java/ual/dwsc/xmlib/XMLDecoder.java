package ual.dwsc.xmlib;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXParseException;
import ual.dwsc.core.Interest;
import ual.dwsc.core.News;

/**
 * Procesa una cadena de texto XML para validar y transformar sus etiquetas en
 * una lista de objetos de tipo noticia
 */
public class XMLDecoder {

	public static List<News> decodeXML(String xml) {
		try {
			DocumentBuilder db = DocumentBuilderFactory.newInstance().newDocumentBuilder();
			InputSource is = new InputSource();
			is.setCharacterStream(new StringReader(xml));

			Document doc = db.parse(is);
			doc.getDocumentElement().normalize();

			NodeList newsNodes = doc.getElementsByTagName("noticia");
			List<News> result = new ArrayList<News>();

			for (int i = 0; i < newsNodes.getLength(); i++) {
				Node newsNode = newsNodes.item(i);
				if (newsNode.getNodeType() == Node.ELEMENT_NODE) {
					Element newsElement = (Element) newsNode;

					// Validaciones
					if (newsElement.getElementsByTagName("fecha").getLength() != 1)
						throw new Exception("fecha es un campo requerido");
					if (newsElement.getElementsByTagName("titulo").getLength() != 1)
						throw new Exception("titulo es un campo requerido");
					if (newsElement.getElementsByTagName("descripcion").getLength() != 1)
						throw new Exception("descripcion es un campo requerido");
					if (newsElement.getElementsByTagName("interes").getLength() != 1)
						throw new Exception("interes es un campo requerido");
					if (newsElement.getElementsByTagName("etiquetas").getLength() != 1)
						throw new Exception("etiquetas es un campo requerido");

					// Extraccion de datos simples
					String date = newsElement.getElementsByTagName("fecha").item(0).getTextContent();
					String title = newsElement.getElementsByTagName("titulo").item(0).getTextContent();
					String description = newsElement.getElementsByTagName("descripcion").item(0).getTextContent();

					// Usamos el metodo fromString del enumerado Interest
					Interest interest = Interest
							.fromString(newsElement.getElementsByTagName("interes").item(0).getTextContent());

					// Extraccion de la lista de etiquetas
					NodeList labelNodes = newsElement.getElementsByTagName("etiqueta");
					ArrayList<String> labels = new ArrayList<>();
					for (int j = 0; j < labelNodes.getLength(); j++) {
						labels.add(labelNodes.item(j).getTextContent());
					}

					// Crear objeto News usando el constructor completo de News
					News news = new News(date, title, description, interest, labels);
					result.add(news);
				}
			}
			return result;

		} catch (SAXParseException e) {
			System.out.println("\nERROR!!!!: Tag mal formado");
		} catch (Exception e) {
			System.out.println("\nERROR!!!!: " + e.getMessage());
		}

		return new ArrayList<News>();
	}
}