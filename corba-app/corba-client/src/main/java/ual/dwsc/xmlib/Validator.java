package ual.dwsc.xmlib;

import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import javax.xml.XMLConstants;
import javax.xml.transform.Source;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import org.xml.sax.ErrorHandler;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;

/**
 * Clase para validar documentos XML contra un esquema XSD
 */
public class Validator {

	/**
	 * Valida un archivo XML fisico contra un archivo XSD
	 */
	public static boolean validate(String xmlPath, String xsdPath) {
		if (xmlPath == null || xmlPath.isEmpty() || xsdPath == null || xsdPath.isEmpty()) {
			return false;
		}
		try {
			Source xmlSource = new StreamSource(new File(xmlPath));
			Source schemaSource = new StreamSource(new File(xsdPath));
			return validate(xmlSource, schemaSource);
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	/**
	 * Valida un String que contiene XML contra un archivo XSD
	 */
	public static boolean validateXMLFromString(String xmlContent, String xsdPath) {
		if (xmlContent == null || xmlContent.isEmpty() || xsdPath == null || xsdPath.isEmpty()) {
			return false;
		}
		try {
			Source xmlSource = new StreamSource(new StringReader(xmlContent));
			Source schemaSource = new StreamSource(new File(xsdPath));
			return validate(xmlSource, schemaSource);
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	/**
	 * Metodo privado que realiza la validacion real
	 */
	private static boolean validate(Source xmlSource, Source schemaSource) throws SAXException, IOException {
		SchemaFactory schemaFactory = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
		Schema schema = schemaFactory.newSchema(schemaSource);
		javax.xml.validation.Validator validator = schema.newValidator();

		final List<SAXParseException> exceptions = new ArrayList<>();

		validator.setErrorHandler(new ErrorHandler() {
			@Override
			public void warning(SAXParseException exception) throws SAXException {
				System.out.println(exception);
				exceptions.add(exception);
			}

			@Override
			public void fatalError(SAXParseException exception) throws SAXException {
				System.out.println(exception);
				exceptions.add(exception);
			}

			@Override
			public void error(SAXParseException exception) throws SAXException {
				System.out.println(exception);
				exceptions.add(exception);
			}
		});

		validator.validate(xmlSource);

		if (exceptions.isEmpty()) {
			System.out.println("La validacion del archivo XML es correcta");
			return true;
		} else {
			System.out.println("La validacion del archivo XML es incorrecta");
			return false;
		}
	}
}