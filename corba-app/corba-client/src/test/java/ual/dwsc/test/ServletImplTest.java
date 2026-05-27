package ual.dwsc.test;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import java.io.PrintWriter;
import java.io.StringWriter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import ual.dwsc.servlet.ServletImpl;

public class ServletImplTest {

	private ual.dwsc.bufferapp.NewsBuffer mockBuffer;

	@org.junit.jupiter.api.BeforeEach
    public void setup() throws Exception {
        mockBuffer = Mockito.mock(ual.dwsc.bufferapp.NewsBuffer.class);
        java.lang.reflect.Field field = ual.dwsc.servlet.ServletImpl.class.getDeclaredField("bufferImpl");
        field.setAccessible(true);
        field.set(null, mockBuffer);
        Mockito.when(mockBuffer.put(Mockito.anyString())).thenReturn(true);
        Mockito.when(mockBuffer.getNewsLength()).thenReturn(1);
        Mockito.when(mockBuffer.getMaxNews()).thenReturn(10);
        Mockito.doNothing().when(mockBuffer).fijarLimiteNoticias(Mockito.anyInt());
        String xmlValido = "<?xml version='1.0' encoding='UTF-8'?>" +
                           "<noticias><noticia>" +
                           "<fecha>09/05/2026</fecha>" +
                           "<titulo>Titulo Valido Largo</titulo>" +
                           "<descripcion>Esta descripcion es suficientemente larga para pasar el validador</descripcion>" +
                           "<interes>alto</interes>" +
                           "<etiquetas><etiqueta>#test</etiqueta></etiquetas>" +
                           "</noticia></noticias>";
        Mockito.doAnswer(invocation -> {
            org.omg.CORBA.StringHolder holder = invocation.getArgument(0);
            holder.value = xmlValido;
            return true;
        }).when(mockBuffer).read(Mockito.any(org.omg.CORBA.StringHolder.class));
        Mockito.doAnswer(invocation -> {
            org.omg.CORBA.StringHolder holder = invocation.getArgument(0);
            holder.value = xmlValido;
            return true;
        }).when(mockBuffer).get(Mockito.any(org.omg.CORBA.StringHolder.class));
    }

	@Test
	public void testSendSuccess() throws Exception {
		// Mocks de la comunicación y configuración
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
		javax.servlet.ServletConfig config = Mockito.mock(javax.servlet.ServletConfig.class);
		javax.servlet.ServletContext context = Mockito.mock(javax.servlet.ServletContext.class);

		StringWriter stringWriter = new StringWriter();
		PrintWriter writer = new PrintWriter(stringWriter);
		Mockito.when(response.getWriter()).thenReturn(writer);
		Mockito.when(config.getServletContext()).thenReturn(context);

		// Rutas para que el Validador funcione
		Mockito.when(context.getRealPath("/noticias.xsd")).thenReturn("src/main/webapp/noticias.xsd");
		Mockito.when(context.getRealPath("/noticias.xml")).thenReturn("src/main/webapp/noticias.xml");

		// Inicialización del Servlet con la configuración
		ServletImpl servlet = new ServletImpl();
		servlet.init(config);

		// Usamos textos que garanticen Éxito en el XSD
		Mockito.when(request.getParameter("action")).thenReturn("Enviar");
		Mockito.when(request.getParameter("title")).thenReturn("Titulo Valido Largo");
		Mockito.when(request.getParameter("description"))
				.thenReturn("Esta descripcion es suficientemente larga para validar el envio correctamente");
		Mockito.when(request.getParameter("interest")).thenReturn("alto");
		Mockito.when(request.getParameter("labels")).thenReturn("#label1 #label2");

		servlet.doPost(request, response);
		String result = stringWriter.toString().trim();
		assertTrue(result.contains("La noticia se ha insertado correctamente"), "Fallo en Enviar: " + result);

		// Limpiamos buffer y cambiamos acción
		stringWriter.getBuffer().setLength(0);
		Mockito.when(request.getParameter("action")).thenReturn("Recibir");

		servlet.doPost(request, response);
		result = stringWriter.toString().trim();

		// Verificación final
		assertTrue(result.contains("La noticia se ha recibido correctamente"), "Fallo en Recibir: " + result);
	}

	@Test
	public void testSendFailureEmptyFields() throws Exception {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
		StringWriter stringWriter = new StringWriter();
		PrintWriter writer = new PrintWriter(stringWriter);

		Mockito.when(response.getWriter()).thenReturn(writer);
		Mockito.when(request.getParameter("action")).thenReturn("Enviar");
		Mockito.when(request.getParameter("title")).thenReturn("");
		Mockito.when(request.getParameter("description")).thenReturn("");
		Mockito.when(request.getParameter("interest")).thenReturn("alto");
		Mockito.when(request.getParameter("labels")).thenReturn("");

		ServletImpl servlet = new ServletImpl();
		servlet.doPost(request, response);
		writer.flush();

		String result = stringWriter.toString().trim();
		assertTrue(result.contains("Introduce todos los parametros (titulo, interes, descripcion y etiquetas)"));
	}

	@Test
	public void testSendFailureXMLSchema() throws Exception {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
		javax.servlet.ServletConfig config = Mockito.mock(javax.servlet.ServletConfig.class);
		javax.servlet.ServletContext context = Mockito.mock(javax.servlet.ServletContext.class);

		// Inyectamos el Mock del buffer por Reflexión
		ual.dwsc.bufferapp.NewsBuffer mockBuffer = Mockito.mock(ual.dwsc.bufferapp.NewsBuffer.class);
		java.lang.reflect.Field field = ServletImpl.class.getDeclaredField("bufferImpl");
		field.setAccessible(true);
		field.set(null, mockBuffer);

		StringWriter stringWriter = new StringWriter();
		PrintWriter writer = new PrintWriter(stringWriter);

		Mockito.when(response.getWriter()).thenReturn(writer);
		Mockito.when(config.getServletContext()).thenReturn(context);
		Mockito.when(context.getRealPath("/noticias.xml")).thenReturn("src/main/webapp/noticias.xml");
		Mockito.when(context.getRealPath("/noticias.xsd")).thenReturn("src/main/webapp/noticias.xsd");
		Mockito.when(request.getParameter("action")).thenReturn("Enviar");
		Mockito.when(request.getParameter("title")).thenReturn("012"); // Provoca el fallo XSD
		Mockito.when(request.getParameter("description")).thenReturn("0123456789 0123456789 0123456789 0123456789");
		Mockito.when(request.getParameter("interest")).thenReturn("alto");
		Mockito.when(request.getParameter("labels")).thenReturn("#label1");

		ServletImpl servlet = new ServletImpl();
		servlet.init(config);

		try {
			servlet.doPost(request, response);
		} catch (Exception e) {
		}

		writer.flush();
		String result = stringWriter.toString().trim();

		assertTrue(result.contains("Error en la validacion semantica del documento XML generado"));
	}

	@Test
	public void testGetFailure() throws Exception {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
		StringWriter stringWriter = new StringWriter();
		PrintWriter writer = new PrintWriter(stringWriter);

		Mockito.when(mockBuffer.get(Mockito.any(org.omg.CORBA.StringHolder.class))).thenReturn(false);
		Mockito.when(response.getWriter()).thenReturn(writer);
		Mockito.when(request.getParameter("action")).thenReturn("Recibir");

		ServletImpl servlet = new ServletImpl();
		servlet.doPost(request, response);
		writer.flush();

		String result = stringWriter.toString().trim();
		assertTrue(result.contains("No hay noticias para recibir") || result.contains("null"));
	}

	@Test
	public void testReadSuccess() throws Exception {
		// Mocks de la comunicación
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
		javax.servlet.ServletConfig config = Mockito.mock(javax.servlet.ServletConfig.class);
		javax.servlet.ServletContext context = Mockito.mock(javax.servlet.ServletContext.class);

		StringWriter stringWriter = new StringWriter();
		PrintWriter writer = new PrintWriter(stringWriter);
		Mockito.when(response.getWriter()).thenReturn(writer);
		Mockito.when(config.getServletContext()).thenReturn(context);

		// Rutas para que el Validador no explote
		Mockito.when(context.getRealPath("/noticias.xsd")).thenReturn("src/main/webapp/noticias.xsd");
		Mockito.when(context.getRealPath("/noticias.xml")).thenReturn("src/main/webapp/noticias.xml");

		// Usamos misma instancia de Servlet para toda la prueba
		ServletImpl servlet = new ServletImpl();
		servlet.init(config);

		// Si no hay nada en el buffer, el 'Leer' siempre dirá 'Buffer vacio'
		Mockito.when(request.getParameter("action")).thenReturn("Enviar");
		Mockito.when(request.getParameter("title")).thenReturn("Titulo Valido");
		Mockito.when(request.getParameter("description"))
				.thenReturn("Esta descripcion tiene mas de veinte caracteres para validar");
		Mockito.when(request.getParameter("interest")).thenReturn("alto");
		Mockito.when(request.getParameter("labels")).thenReturn("#test");
		servlet.doPost(request, response);

		// Limpiamos el capturador de texto para ver solo la respuesta de 'Leer'
		stringWriter.getBuffer().setLength(0);
		Mockito.when(request.getParameter("action")).thenReturn("Leer");
		servlet.doPost(request, response);
		String result = stringWriter.toString();

		// Verificación final
		assertTrue(result.contains("La noticia se ha leido correctamente"), "Fallo en Leer. El HTML dice: " + result);
	}

	@Test
	public void testLimitEmptyFailure() throws Exception {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
		StringWriter stringWriter = new StringWriter();
		PrintWriter writer = new PrintWriter(stringWriter);

		Mockito.when(response.getWriter()).thenReturn(writer);
		Mockito.when(request.getParameter("action")).thenReturn("Limitar");
		Mockito.when(request.getParameter("limit")).thenReturn("");

		ServletImpl servlet = new ServletImpl();
		servlet.doPost(request, response);
		writer.flush();

		String result = stringWriter.toString().trim();
		assertTrue(result.contains("El campo limite es requerido"));
	}

	@Test
	public void testLimitFailure() throws Exception {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
		StringWriter stringWriter = new StringWriter();
		PrintWriter writer = new PrintWriter(stringWriter);

		Mockito.when(response.getWriter()).thenReturn(writer);
		Mockito.when(request.getParameter("action")).thenReturn("Limitar");
		Mockito.when(request.getParameter("limit")).thenReturn("0");

		ServletImpl servlet = new ServletImpl();
		servlet.doPost(request, response);
		writer.flush();

		String result = stringWriter.toString().trim();
		assertTrue(result.contains("El campo limite debe ser mayor que cero"));
	}

	@Test
	public void testLimitSuccess() throws Exception {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
		StringWriter stringWriter = new StringWriter();
		PrintWriter writer = new PrintWriter(stringWriter);

		Mockito.when(response.getWriter()).thenReturn(writer);
		Mockito.when(request.getParameter("action")).thenReturn("Limitar");
		Mockito.when(request.getParameter("limit")).thenReturn("7");

		ServletImpl servlet = new ServletImpl();
		servlet.doPost(request, response);
		writer.flush();

		String result = stringWriter.toString().trim();
		assertTrue(result.contains("El nuevo limite del buffer es 7"));
	}

	@Test
	public void testInvalidAction() throws Exception {
		HttpServletRequest request = Mockito.mock(HttpServletRequest.class);
		HttpServletResponse response = Mockito.mock(HttpServletResponse.class);
		StringWriter stringWriter = new StringWriter();
		PrintWriter writer = new PrintWriter(stringWriter);

		Mockito.when(response.getWriter()).thenReturn(writer);
		Mockito.when(request.getParameter("action")).thenReturn("InvalidAction");

		ServletImpl servlet = new ServletImpl();
		servlet.doPost(request, response);
		writer.flush();

		String result = stringWriter.toString().trim();
		assertTrue(result.contains("Accion 'InvalidAction' no reconocida"));
	}
}