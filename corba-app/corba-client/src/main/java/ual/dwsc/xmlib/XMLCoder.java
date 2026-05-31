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
		if (news == null || news.isEmpty()) {
			throw new Exception("Lista de noticias vacía");
		}

		try {
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			DocumentBuilder builder = factory.newDocumentBuilder();
			Document document = builder.newDocument();
			document.setXmlVersion("1.0");

			// Main Node
			Element root = document.createElement("noticias");
			document.appendChild(root);
			buildXML(news, document, root);

			// Generate XML file
			Transformer transformer = TransformerFactory.newInstance().newTransformer();
			// Indentacion para que no salga todo en una linea
			transformer.setOutputProperty(OutputKeys.INDENT, "yes");

			File file = new File(path);
			if (file.getParentFile() != null && !file.getParentFile().exists()) {
				throw new Exception("Ruta inválida o directorio no encontrado");
			}

			// Transformamos tanto al archivo como al string de retorno
			transformer.transform(new DOMSource(document), new StreamResult(file));

			StringWriter writer = new StringWriter();
			transformer.transform(new DOMSource(document), new StreamResult(writer));
			
			return writer.toString();

		} catch (Exception e) {
			throw new Exception("Error al procesar el XML", e);
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
			Element playerNode = document.createElement("jugador");
			Element labelsNode = document.createElement("etiquetas");

			News currentNews = news.get(i);

			// Valores de texto
			Text nodeDateValue = document.createTextNode(currentNews.getFecha());
			Text nodeTitleValue = document.createTextNode(currentNews.getTitulo());
			Text nodeDescriptionValue = document.createTextNode(currentNews.getDescripcion());
			Text nodePlayerValue = document.createTextNode(currentNews.getJugador());

			// Append de los valores a sus nodos
			dateNode.appendChild(nodeDateValue);
			titleNode.appendChild(nodeTitleValue);
			descriptionNode.appendChild(nodeDescriptionValue);
			playerNode.appendChild(nodePlayerValue);

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
			newsNode.appendChild(playerNode);
			newsNode.appendChild(labelsNode);
		}
	}
}