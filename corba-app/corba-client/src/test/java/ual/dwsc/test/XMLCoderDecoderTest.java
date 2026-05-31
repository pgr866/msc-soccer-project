package ual.dwsc.test;

import static org.junit.jupiter.api.Assertions.*;
import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import java.nio.file.Path;
import ual.dwsc.core.News;
import ual.dwsc.xmlib.XMLCoder;
import ual.dwsc.xmlib.XMLDecoder;

public class XMLCoderDecoderTest {

	private List<News> newsList;
	private String tempPath;

	@TempDir
	Path tempFolder;

	@BeforeEach
	public void setUp() throws Exception {
		newsList = new ArrayList<>();
		News n1 = new News("23/03/2026", "Titulo de prueba", "Descripcion de prueba larga", "Nombre del Jugador",
				Arrays.asList("#UAL", "#Informatica"));
		newsList.add(n1);

		// Creamos un archivo temporal para las pruebas del Coder
		File tempFile = tempFolder.resolve("noticias_test.xml").toFile();
		tempPath = tempFile.getAbsolutePath();
	}

	// --- TESTS PARA XMLCoder ---

	@Test
	public void testCoder_Success() throws Exception {
		String result = XMLCoder.codeXML(newsList, tempPath);

		assertNotNull(result);
		assertTrue(result.contains("<titulo>Titulo de prueba</titulo>"));
		assertTrue(result.contains("<etiqueta>#UAL</etiqueta>"));

		// Verificar que el archivo fí­sico se creó
		File f = new File(tempPath);
		assertTrue(f.exists(), "El archivo XML debería existir");
	}

	@Test
	public void testCoder_EmptyList() {
		List<News> emptyList = new ArrayList<>();
		assertThrows(Exception.class, () -> {
			XMLCoder.codeXML(emptyList, tempPath);
		});
	}

	@Test
	public void testCoder_InvalidPath() {
		assertThrows(Exception.class, () -> {
			XMLCoder.codeXML(newsList, "/ruta/imposible.xml");
		});
	}

	// --- TESTS PARA XMLDecoder ---

	@Test
	public void testDecoder_Success() {
		String xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "<noticias><noticia>"
				+ "<fecha>23/03/2026</fecha><titulo>Test</titulo>"
				+ "<descripcion>Descripcion larga de prueba</descripcion>" + "<jugador>Nombre del Jugador</jugador>"
				+ "<etiquetas><etiqueta>#Tag</etiqueta></etiquetas>" + "</noticia></noticias>";

		List<News> result = XMLDecoder.decodeXML(xml);

		assertEquals(1, result.size());
		assertEquals("Test", result.get(0).getTitulo());
		assertEquals("Nombre del Jugador", result.get(0).getJugador());
	}

	@Test
	public void testDecoder_MalformedXML() {
		// XML sin cerrar tags
		String malformed = "<noticias><noticia><titulo>Error";
		List<News> result = XMLDecoder.decodeXML(malformed);

		assertTrue(result.isEmpty(), "Debe devolver una lista vací­a si falla");
	}

	@Test
	public void testDecoder_MissingElements() {
		// Falta el elemento <fecha>, que es requerido por el if del Decoder
		String missingElement = "<noticias><noticia>" + "<titulo>Test</titulo><descripcion>Desc</descripcion>"
				+ "<jugador>Nombre del Jugador</jugador><etiquetas></etiquetas>" + "</noticia></noticias>";

		List<News> result = XMLDecoder.decodeXML(missingElement);
		assertTrue(result.isEmpty(), "Debe fallar si faltan nodos requeridos");
	}

	@Test
	public void testDecoder_NodeTypeCoverage() {
		// XML con un comentario dentro de <noticias>
		// El comentario es un Node, pero NO es un ELEMENT_NODE
		// Esto obliga al 'if (newsNode.getNodeType() == Node.ELEMENT_NODE)' a evaluar
		// false
		String xmlWithComment = "<?xml version='1.0' encoding='UTF-8'?>" + "<noticias>" + "<noticia>"
				+ "<fecha>23/03/2026</fecha><titulo>Test</titulo>"
				+ "<descripcion>Descripcion larga de prueba</descripcion>"
				+ "<jugador>Nombre del Jugador</jugador><etiquetas></etiquetas>" + "</noticia></noticias>";

		List<News> result = XMLDecoder.decodeXML(xmlWithComment);
		assertFalse(result.isEmpty());
	}

	@Test
	public void testDecoder_MissingFieldsBranches() {
		// 1. Probar que falta TITULO (lanza Exception "titulo es un campo requerido")
		String noTitle = "<noticias><noticia><fecha>23/03/2026</fecha>"
				+ "<descripcion>Desc</descripcion><jugador>Nombre del Jugador</jugador>"
				+ "<etiquetas></etiquetas></noticia></noticias>";
		assertTrue(XMLDecoder.decodeXML(noTitle).isEmpty());

		// 2. Probar que falta DESCRIPCION (lanza Exception "descripcion es un campo
		// requerido")
		String noDesc = "<noticias><noticia><fecha>23/03/2026</fecha>"
				+ "<titulo>Titulo</titulo><jugador>Nombre del Jugador</jugador>" + "<etiquetas></etiquetas></noticia></noticias>";
		assertTrue(XMLDecoder.decodeXML(noDesc).isEmpty());

		// 3. Probar que falta JUGADOR (lanza Exception "jugador es un campo requerido")
		String noPlayer = "<noticias><noticia><fecha>23/03/2026</fecha>"
				+ "<titulo>Titulo</titulo><descripcion>Descripcion larga</descripcion>"
				+ "<etiquetas></etiquetas></noticia></noticias>";
		assertTrue(XMLDecoder.decodeXML(noPlayer).isEmpty());

		// 4. Probar que falta ETIQUETAS (lanza Exception "etiquetas es un campo
		// requerido")
		String noLabels = "<noticias><noticia><fecha>23/03/2026</fecha>"
				+ "<titulo>Titulo</titulo><descripcion>Descripcion larga</descripcion>"
				+ "<jugador>Nombre del Jugador</jugador></noticia></noticias>";
		assertTrue(XMLDecoder.decodeXML(noLabels).isEmpty());
	}

	// --- TEST DE INTEGRACIÓN (CODER + DECODER) ---

	@Test
	public void testIntegracion_CoderToDecoder() throws Exception {
		// 1. Codificar
		String xmlGenerated = XMLCoder.codeXML(newsList, tempPath);

		// 2. Decodificar lo generado
		List<News> decodedList = XMLDecoder.decodeXML(xmlGenerated);

		// 3. Comparar resultados
		assertEquals(newsList.size(), decodedList.size());
		assertEquals(newsList.get(0).getTitulo(), decodedList.get(0).getTitulo());
		assertEquals(newsList.get(0).getJugador(), decodedList.get(0).getJugador());
		assertEquals(newsList.get(0).getEtiquetas().get(0), decodedList.get(0).getEtiquetas().get(0));
	}
}