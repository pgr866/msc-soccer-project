package ual.dwsc.test;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.omg.CORBA.StringHolder;
import ual.dwsc.server.BufferImpl;

public class BufferImplTest {

	private BufferImpl buffer;

	@BeforeEach
	public void setUp() {
		buffer = new BufferImpl(); // Inicializa con maxNews = 5
	}

	@AfterEach
	public void tearDown() {
		buffer = null; // Destruye referencia al buffer
	}

	@Test
	public void testPut() {
		assertTrue(buffer.put("Noticia 1"));
		assertTrue(buffer.put("Noticia 2"));
		assertTrue(buffer.put("Noticia 3"));
		assertTrue(buffer.put("Noticia 4"));
		assertTrue(buffer.put("Noticia 5"));
		// Caso de fallo: Buffer lleno
		assertFalse(buffer.put("Noticia 6"));
	}

	@Test
	public void testGet() {
		buffer.put("Noticia 1");
		buffer.put("Noticia 2");
		StringHolder news = new StringHolder();

		assertTrue(buffer.get(news));
		assertEquals("Noticia 1", news.value);
		assertTrue(buffer.get(news));
		assertEquals("Noticia 2", news.value);
		// Caso de fallo: Buffer vací­o
		assertFalse(buffer.get(news));
		assertEquals("No hay ninguna noticia almacenada en el buffer", news.value);
	}

	@Test
	public void testRead() {
		buffer.put("Noticia 1");
		buffer.put("Noticia 2");
		StringHolder news = new StringHolder();

		assertTrue(buffer.read(news));
		assertEquals("Noticia 1", news.value);
		// Verificamos que no se ha borrado
		assertTrue(buffer.read(news));
		assertEquals("Noticia 1", news.value);
	}

	@Test
	public void testFijarLimiteNoticias() {
		buffer.put("Noticia 1");
		buffer.put("Noticia 2");
		buffer.put("Noticia 3");
		assertEquals(3, buffer.getNewsLength());

		// Reducimos el lí­mite a 2 (esto provoca recorte)
		buffer.fijarLimiteNoticias(2);
		assertEquals(2, buffer.getNewsLength());

		// Intentamos añadir una más hasta el nuevo lí­mite
		assertFalse(buffer.put("Noticia 4"));
		buffer.fijarLimiteNoticias(4);
		assertTrue(buffer.put("Noticia 4"));
	}

	@Test
	public void testGetMaxNews() {
		assertEquals(5, buffer.getMaxNews());
		buffer.fijarLimiteNoticias(10);
		assertEquals(10, buffer.getMaxNews());
	}
}