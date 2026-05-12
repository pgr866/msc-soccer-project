package ual.dwsc.xmlib;

import java.io.File;
import java.io.StringWriter;
import java.util.List;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.DOMImplementation;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Text;

import ual.dwsc.core.News;

/**
 * Clase para convertir objetos News a formato XML (Serializacion)
 */
public class XMLCoder {

	/**
	 * Configura el documento y exporta la lista de noticias a un archivo XML y a
	 * una cadena de texto
	 */
	public static String codeXML(List<News> news, String path) throws Exception {
		if (news.isEmpty()) {
			return "ERROR empty list";
		} else {
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			DocumentBuilder builder = factory.newDocumentBuilder();
			DOMImplementation implementation = builder.getDOMImplementation();
			Document document = implementation.createDocument(null, "noticias", null);
			document.setXmlVersion("1.0");

			// Main Node
			Element root = document.getDocumentElement();
			buildXML(news, document, root);

			// Generate XML file
			Source source = new DOMSource(document);
			StreamResult resultFile = new StreamResult(new File(path));

			StringWriter writer = new StringWriter();
			StreamResult stringResult = new StreamResult(writer);

			Transformer transformer = TransformerFactory.newInstance().newTransformer();
			// Indentacion para que no salga todo en una linea
			transformer.setOutputProperty(OutputKeys.INDENT, "yes");

			// Transformamos tanto al archivo como al string de retorno
			transformer.transform(source, resultFile);
			transformer.transform(source, stringResult);

			return writer.toString();
		}
	}

	/**
	 * Construye de forma iterativa la estructura de nodos XML para cada objeto
	 * noticia y sus etiquetas
	 */
	private static void buildXML(List<News> news, Document document, Element root) {
		for (int i = 0; i < news.size(); i++) {
			// Elementos del registro
			Element newsNode = document.createElement("noticia");
			Element dateNode = document.createElement("fecha");
			Element titleNode = document.createElement("titulo");
			Element descriptionNode = document.createElement("descripcion");
			Element interestNode = document.createElement("interes");
			Element labelsNode = document.createElement("etiquetas");

			News currentNews = news.get(i);

			// Valores de texto
			Text nodeDateValue = document.createTextNode(currentNews.getFecha());
			Text nodeTitleValue = document.createTextNode(currentNews.getTitulo());
			Text nodeDescriptionValue = document.createTextNode(currentNews.getDescripcion());
			Text nodeInterestValue = document.createTextNode(currentNews.getInteres().toString());

			// Append de los valores a sus nodos
			dateNode.appendChild(nodeDateValue);
			titleNode.appendChild(nodeTitleValue);
			descriptionNode.appendChild(nodeDescriptionValue);
			interestNode.appendChild(nodeInterestValue);

			// Tratamiento de las etiquetas (lista interna)
			List<String> labelsNews = currentNews.getEtiquetas();
			for (String label : labelsNews) {
				Element labelNode = document.createElement("etiqueta");
				Text nodeLabelValue = document.createTextNode(label);
				labelNode.appendChild(nodeLabelValue);
				labelsNode.appendChild(labelNode);
			}

			// Armamos la estructura de la noticia
			root.appendChild(newsNode);
			newsNode.appendChild(dateNode);
			newsNode.appendChild(titleNode);
			newsNode.appendChild(descriptionNode);
			newsNode.appendChild(interestNode);
			newsNode.appendChild(labelsNode);
		}
	}
}