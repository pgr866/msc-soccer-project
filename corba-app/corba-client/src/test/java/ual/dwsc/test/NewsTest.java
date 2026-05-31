package ual.dwsc.test;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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
		assertEquals("Nombre del Jugador", news.getJugador());
		assertTrue(news.getEtiquetas().contains("#tag"));
	}

	@Test
	public void testConstructorCompleto() {
		List<String> tags = Arrays.asList("#java", "#corba");
		news = new News("01/01/2026", "Titulo Test", "Descripcion de mas de veinte caracteres", "Nombre del Jugador", tags);

		assertEquals("01/01/2026", news.getFecha());
		assertEquals("Titulo Test", news.getTitulo());
		assertEquals("Nombre del Jugador", news.getJugador());
		assertEquals(2, news.getEtiquetas().size());
	}

	@Test
	public void testConstructorServletYEtiquetas() {
		// Probamos el constructor que recibe String de etiquetas con espacios extra
		news = new News("Titulo", "Descripcion...", "Nombre del Jugador", "  #tag1   #tag2  #tag3  ");

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

		news.setJugador("Nuevo Jugador");
		assertEquals("Nuevo Jugador", news.getJugador());

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
		assertTrue(ts.contains("jugador=Nombre del Jugador"));
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
}