package ual.dwsc.test;

import static org.junit.jupiter.api.Assertions.*;
import java.io.File;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ual.dwsc.xmlib.Validator;

public class ValidatorTest {

	// Ajusta estas rutas según la estructura de tu proyecto
	private static String xsdPath;
	private static String xmlPath;

	@BeforeEach
	public void setup() {
		// Buscamos los archivos en la ruta tí­pica de un proyecto Maven/Gradle Web
		xsdPath = "src/main/webapp/noticias.xsd";
		xmlPath = "src/main/webapp/noticias_valid.xml";
	}

	// --- TESTS DE VALIDACIÓN POR STRING ---

	@Test
	public void testValidateXMLFromString_Success() {
		String validXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "<noticias><noticia>"
				+ "<fecha>23/03/2026</fecha>" + "<titulo>Titulo Valido</titulo>"
				+ "<descripcion>Esta es una descripcion lo suficientemente larga para el XSD</descripcion>"
				+ "<interes>alto</interes>" + "<etiquetas><etiqueta>#Test</etiqueta></etiquetas>"
				+ "</noticia></noticias>";

		assertTrue(Validator.validateXMLFromString(validXML, xsdPath), "El XML deberí­a ser válido");
	}

	@Test
	public void testValidateXMLFromString_ValidationError() {
		// Título demasiado corto (el XSD pide {5,30})
		String invalidXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "<noticias><noticia>"
				+ "<fecha>23/03/2026</fecha>" + "<titulo>A</titulo>"
				+ "<descripcion>Descripción válida y larga para pasar el filtro del XSD</descripcion>"
				+ "<interes>alto</interes>" + "<etiquetas><etiqueta>#Test</etiqueta></etiquetas>"
				+ "</noticia></noticias>";

		assertFalse(Validator.validateXMLFromString(invalidXML, xsdPath), "Deberí­a fallar por longitud de tí­tulo");
	}

	@Test
	public void testValidateXMLFromString_MalformedXML() {
		String malformedXML = "<noticias><noticia> Sin cerrar tags";
		assertFalse(Validator.validateXMLFromString(malformedXML, xsdPath), "Debería fallar por XML mal formado");
	}

	// --- TESTS DE VALIDACIÓN POR ARCHIVO ---

	@Test
	public void testValidate_Success() {
		// Verifica si el archivo existe antes de testear (evita falsos negativos por
		// entorno)
		File f = new File(xmlPath);
		if (f.exists()) {
			assertTrue(Validator.validate(xmlPath, xsdPath), "El archivo XML físico deberí­a ser válido");
		}
	}

	@Test
	public void testValidate_FileNotFound() {
		assertFalse(Validator.validate("ruta/inexistente.xml", xsdPath),
				"Deberí­a retornar false si el archivo no existe");
	}

	// --- TESTS DE VALORES NULOS O VACÍOS (Cobertura de ramas if) ---

	@Test
	public void testNullInputs() {
		assertFalse(Validator.validate(null, xsdPath));
		assertFalse(Validator.validate(xmlPath, null));
		assertFalse(Validator.validate("", xsdPath));

		assertFalse(Validator.validateXMLFromString(null, xsdPath));
		assertFalse(Validator.validateXMLFromString("<xml/>", ""));
	}

	// --- TEST DE ERROR SEMÁNTICO (Enumerados) ---

	@Test
	public void testInvalidEnumeration() {
		// Interés "super-alto" no existe en el XSD
		String invalidEnumXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "<noticias><noticia>"
				+ "<fecha>23/03/2026</fecha>" + "<titulo>Titulo Valido</titulo>"
				+ "<descripcion>Descripcion de mas de veinte caracteres para validar</descripcion>"
				+ "<interes>super-alto</interes>" + "<etiquetas><etiqueta>#Java</etiqueta></etiquetas>"
				+ "</noticia></noticias>";

		assertFalse(Validator.validateXMLFromString(invalidEnumXML, xsdPath),
				"Deberí­a fallar porque 'super-alto' no está permitido");
	}

	@Test
	public void testValidatePathBranches() {
		// Probamos cada una de las 4 condiciones del IF de rutas de archivo
		assertFalse(Validator.validate(null, xsdPath), "xmlPath null");
		assertFalse(Validator.validate("", xsdPath), "xmlPath vací­o");
		assertFalse(Validator.validate(xmlPath, null), "xsdPath null");
		assertFalse(Validator.validate(xmlPath, ""), "xsdPath vací­o");
	}

	@Test
	public void testValidateStringBranches() {
		// Probamos cada una de las 4 condiciones del IF de validación por String
		assertFalse(Validator.validateXMLFromString(null, xsdPath), "xmlContent null");
		assertFalse(Validator.validateXMLFromString("", xsdPath), "xmlContent vací­o");
		assertFalse(Validator.validateXMLFromString("<xml/>", null), "xsdPath null");
		assertFalse(Validator.validateXMLFromString("<xml/>", ""), "xsdPath vací­o");
	}
}