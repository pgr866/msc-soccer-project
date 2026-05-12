package ual.dwsc.test;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ual.dwsc.core.Interest;
import ual.dwsc.core.News;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class NewsTest {

	private News news;
	private String hoy;

	@BeforeEach
	public void setUp() {
		hoy = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
	}

	@Test
	public void testConstructorDefecto() {
		news = new News();
		assertEquals(hoy, news.getFecha());
		assertEquals("Noticia", news.getTitulo());
		assertEquals("Descripcion de la Noticia", news.getDescripcion());
		assertEquals(Interest.medio, news.getInteres());
		assertTrue(news.getEtiquetas().contains("#tag"));
	}

	@Test
	public void testConstructorCompleto() {
		List<String> tags = Arrays.asList("#java", "#corba");
		news = new News("01/01/2026", "Titulo Test", "Descripcion de mas de veinte caracteres", Interest.alto, tags);

		assertEquals("01/01/2026", news.getFecha());
		assertEquals("Titulo Test", news.getTitulo());
		assertEquals(Interest.alto, news.getInteres());
		assertEquals(2, news.getEtiquetas().size());
	}

	@Test
	public void testConstructorServletYEtiquetas() {
		// Probamos el constructor que recibe String de etiquetas con espacios extra
		news = new News("Titulo", "Descripcion...", Interest.bajo, "  #tag1   #tag2  #tag3  ");

		assertEquals(hoy, news.getFecha());
		assertEquals(3, news.getEtiquetas().size());
		assertEquals("#tag1 #tag2 #tag3", news.getEtiquetasString());
	}

	@Test
	public void testSettersAndGetters() {
		news = new News();

		news.setFecha("12/12/2025");
		assertEquals("12/12/2025", news.getFecha());

		news.setTitulo("Nuevo Titulo");
		assertEquals("Nuevo Titulo", news.getTitulo());

		news.setDescripcion("Nueva Descripcion Larga");
		assertEquals("Nueva Descripcion Larga", news.getDescripcion());

		news.setInteres(Interest.alto);
		assertEquals(Interest.alto, news.getInteres());

		List<String> listaTags = new ArrayList<>();
		listaTags.add("#fútbol");
		news.setEtiquetas(listaTags);
		assertEquals(1, news.getEtiquetas().size());
	}

	@Test
	public void testSetEtiquetasString() {
		news = new News();
		// Caso normal
		news.setEtiquetasString("#deportes #cine");
		assertEquals(2, news.getEtiquetas().size());

		// Caso con múltiples espacios (el regex \\s+ debe controlarlo)
		news.setEtiquetasString("#uno    #dos");
		assertEquals(2, news.getEtiquetas().size());
		assertEquals("#uno", news.getEtiquetas().get(0));
	}

	@Test
	public void testToString() {
		news = new News();
		String ts = news.toString();
		// Verificamos que contenga los campos clave
		assertTrue(ts.contains("News ["));
		assertTrue(ts.contains("fecha=" + hoy));
		assertTrue(ts.contains("interes=medio"));
	}

	@Test
	public void testCasosBorde() {
		news = new News();
		// Lista vací­a en setEtiquetas
		news.setEtiquetas(new ArrayList<>());
		assertEquals("", news.getEtiquetasString());

		// Etiquetas con una sola palabra sin espacios
		news.setEtiquetasString("solotag");
		assertEquals(1, news.getEtiquetas().size());
		assertEquals("solotag", news.getEtiquetasString());
	}

	@Test
	public void testInterestMethods() {
		// Prueba el toString() personalizado
		assertEquals("alto", Interest.alto.toString());

		// Prueba fromString con conversión a minúsculas
		assertEquals(Interest.alto, Interest.fromString("ALTO"));
		assertEquals(Interest.medio, Interest.fromString("Medio"));
		assertEquals(Interest.bajo, Interest.fromString("bajo"));
	}
}