package ual.dwsc.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.omg.CORBA.ORB;
import org.omg.CORBA.StringHolder;
import org.omg.CosNaming.NamingContextExt;
import org.omg.CosNaming.NamingContextExtHelper;
import ual.dwsc.bufferapp.NewsBuffer;
import ual.dwsc.bufferapp.NewsBufferHelper;
import ual.dwsc.core.News;
import ual.dwsc.core.Interest;
import ual.dwsc.xmlib.Validator;
import ual.dwsc.xmlib.XMLCoder;
import ual.dwsc.xmlib.XMLDecoder;

/**
 * Servlet que actua como cliente CORBA para la gestion de un buffer de noticias
 * XML. Implementa la interfaz web del sistema corba-client
 */
public class ServletImpl extends HttpServlet {

	private static final long serialVersionUID = 1L;
	static NewsBuffer bufferImpl;

	/**
	 * Establece la conexion con el servidor CORBA. Inicializa el ORB y localiza el
	 * objeto 'Buffer' en el Servicio de Nombres
	 */
	protected void getreference() throws Exception {
		if (bufferImpl != null) return;
		String orbHost = System.getenv("ORB_HOST");
		String orbPort = System.getenv("ORB_PORT");
		String args[] = { "-ORBInitialHost", orbHost, "-ORBInitialPort", orbPort };
		ORB orb = ORB.init(args, null);
		org.omg.CORBA.Object objRef = orb.resolve_initial_references("NameService");
		NamingContextExt ncRef = NamingContextExtHelper.narrow(objRef);
		bufferImpl = NewsBufferHelper.narrow(ncRef.resolve_str("Buffer"));
	}

	/**
	 * Gestiona las peticiones POST del formulario. Identifica la accion pulsada
	 * (Enviar, Recibir, Leer o Limitar) y deriva el flujo
	 */
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse response) throws IOException, ServletException {
		String action = req.getParameter("action");
		response.setContentType("text/html");
		PrintWriter out = response.getWriter();

		if (action.compareTo("Enviar") == 0) {
			String title = req.getParameter("title");
			String description = req.getParameter("description");
			String interestStr = req.getParameter("interest");
			String labels = req.getParameter("labels");

			Interest interest = Interest.valueOf(interestStr);
			News news = new News(title, description, interest, labels);
			this.send(out, news);

		} else if (action.compareTo("Recibir") == 0) {
			this.get(out);
		} else if (action.compareTo("Leer") == 0) {
			this.read(out);
		} else if (action.compareTo("Limitar") == 0) {
			String limitString = req.getParameter("limit");
			this.limit(out, limitString);
		} else {
			printHTML(out, this.alertHTML("Accion '" + action + "' no reconocida", false), null);
		}
	}

	/**
	 * Actua como Productor. Convierte la noticia a XML, la valida contra el XSD y
	 * la inserta en el buffer CORBA
	 */
	protected void send(PrintWriter out, News news) throws IOException {
		try {
			getreference();
			if (news.getTitulo().isEmpty() || news.getDescripcion().isEmpty() || news.getEtiquetasString().isEmpty()) {
				throw new Exception("Introduce todos los parametros (titulo, interes, descripcion y etiquetas)");
			}

			List<News> listNews = new ArrayList<>();
			listNews.add(news);

			ServletContext path = getServletContext();
			String newsXML = XMLCoder.codeXML(listNews, path.getRealPath("/noticias.xml"));
			// Validacion semantica
			boolean validation = Validator.validateXMLFromString(newsXML, path.getRealPath("/noticias.xsd"));
			if (!validation) {
				throw new Exception("Error en la validacion semantica del documento XML generado");
			}

			if (!bufferImpl.put(newsXML)) {
				int maxNews = bufferImpl.getMaxNews();
				throw new Exception("Se ha alcanzado el limite de noticias almacenadas en el buffer (" + maxNews + ")");
			}

			int nNews = bufferImpl.getNewsLength();
			int maxNews = bufferImpl.getMaxNews();
			printHTML(out,
					this.alertHTML("La noticia se ha insertado correctamente (" + nNews + "/" + maxNews + ")", true),
					null);

		} catch (Exception e) {
			printHTML(out, this.alertHTML(e.getMessage(), false), news);
		}
	}

	/**
	 * Consulta la noticia mas antigua sin eliminarla del buffer. Recupera el XML
	 * del servidor CORBA y lo reconstruye en un objeto News
	 */
	protected void read(PrintWriter out) {
		try {
			getreference();
			StringHolder aux = new StringHolder();
			boolean status = bufferImpl.read(aux);

			if (status) {
				ServletContext path = getServletContext();
				boolean validation = Validator.validateXMLFromString(aux.value, path.getRealPath("/noticias.xsd"));
				if (!validation)
					throw new Exception("Error en la validacion semantica del documento XML leido");

				List<News> listNews = XMLDecoder.decodeXML(aux.value);
				int nNews = bufferImpl.getNewsLength();
				int maxNews = bufferImpl.getMaxNews();
				String msg = "La noticia se ha leido correctamente. Noticias restantes: " + nNews + "/" + maxNews;
				printHTML(out, this.newsHTML(listNews.get(0)) + this.alertHTML(msg, true), null);
			} else {
				printHTML(out, this.alertHTML("Buffer vacio", false), null);
			}
		} catch (Exception e) {
			printHTML(out, this.alertHTML(e.getMessage(), false), null);
		}
	}

	/**
	 * Actua como Consumidor. Recupera la noticia del buffer y la elimina del
	 * servidor CORBA
	 */
	protected void get(PrintWriter out) {
		try {
			getreference();
			StringHolder aux = new StringHolder();
			boolean status = bufferImpl.get(aux);

			if (status) {
				ServletContext path = getServletContext();
				boolean validation = Validator.validateXMLFromString(aux.value, path.getRealPath("/noticias.xsd"));
				if (!validation)
					throw new Exception("Error en la validacion semantica del documento XML recibido");

				List<News> listNews = XMLDecoder.decodeXML(aux.value);
				int nNews = bufferImpl.getNewsLength();
				int maxNews = bufferImpl.getMaxNews();
				String msg = "La noticia se ha recibido correctamente. Noticias restantes: " + nNews + "/" + maxNews;
				printHTML(out, this.newsHTML(listNews.get(0)) + this.alertHTML(msg, true), null);
			} else {
				printHTML(out, this.alertHTML("No hay noticias para recibir", false), null);
			}
		} catch (Exception e) {
			printHTML(out, this.alertHTML(e.getMessage(), false), null);
		}
	}

	/**
	 * Modifica dinamicamente el tamaño maximo del buffer en el servidor
	 */
	protected void limit(PrintWriter out, String limitString) {
		try {
			getreference();
			if (limitString == null || limitString.isEmpty())
				throw new Exception("El campo limite es requerido");
			int limit = Integer.valueOf(limitString);
			if (limit <= 0)
				throw new Exception("El campo limite debe ser mayor que cero");

			bufferImpl.fijarLimiteNoticias(limit);
			int nNews = bufferImpl.getNewsLength();
			printHTML(out,
					this.alertHTML("El nuevo limite del buffer es " + limit + ". Numero de noticias: " + nNews, true),
					null);
		} catch (Exception e) {
			printHTML(out, this.alertHTML(e.getMessage(), false), null);
		}
	}

	/**
	 * Gestiona las peticiones GET (carga inicial de la pagina). Sirve para mostrar
	 * el formulario vacio al usuario al acceder a la URL
	 */
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse response) throws IOException, ServletException {
		response.setContentType("text/html");
		PrintWriter out = response.getWriter();
		this.printHTML(out, "", null);
	}

	// --- METODOS DE GENERACION HTML ---

	/**
	 * Ensambla la estructura completa del documento HTML
	 */
	private void printHTML(PrintWriter out, String html, News news) {
		out.println("<html>");
		out.println(this.headerHTML());
		out.println("<body>");
		out.println(this.newsFormHTML(news));
		out.println(this.limitFormHTML());
		if (html != null && !html.isEmpty())
			out.println(html);
		out.println("</body>");
		out.println(this.stylesHTML());
		out.println("</html>");
	}

	/** Genera la seccion <head> y el titulo de la pestaña */
	private String headerHTML() {
		return "<head><meta http-equiv='Content-Type' content='text/html; charset=iso-8859-1'>"
				+ "<title>corba-client Noticias</title></head>";
	}

	/**
	 * Genera el formulario principal para crear noticias con placeholders de
	 * restriccion
	 */
	private String newsFormHTML(News news) {
		StringBuilder sb = new StringBuilder();
		sb.append("<form action='/' method='post'>");
		sb.append("<h2>Añadir nueva noticia</h2>");
		sb.append("<div class='row'>");

		// Campo Titulo
		sb.append("<div class='label-input half'><label for='title'>Tí­tulo (Descripción Corta):</label>");
		sb.append("<input type='text' name='title' placeholder='5-30 caracteres' value='")
				.append(news != null ? news.getTitulo() : "").append("'></div>");

		// Campo Interes
		sb.append("<div class='label-input half'><label for='interest'>Interés:</label><select name='interest'>");
		for (Interest i : Interest.values()) {
			String selected = (news != null && news.getInteres() == i) ? " selected" : "";
			sb.append("<option value='").append(i.name()).append("'").append(selected).append(">").append(i.name())
					.append("</option>");
		}
		sb.append("</select></div>");
		sb.append("</div>");

		// Descripción (Descripcion larga)
		sb.append("<div class='label-input'><label for='description'>Descripción (Larga):</label>");
		sb.append("<textarea name='description' placeholder='20-250 caracteres'>")
				.append(news != null ? news.getDescripcion() : "").append("</textarea></div>");

		// Etiquetas
		sb.append("<div class='label-input'><label for='labels'>Etiquetas:</label>");
		sb.append("<input type='text' name='labels' placeholder='#tag1 #tag2 (Máx 6)' value='")
				.append(news != null ? news.getEtiquetasString() : "").append("'></div>");

		// Botones
		sb.append("<div class='buttons'><input value='Enviar' type='submit' name='action'>");
		sb.append("<input value='Recibir' type='submit' name='action'>");
		sb.append("<input value='Leer' type='submit' name='action'></div>");
		sb.append("</form>");

		return sb.toString();
	}

	/** Genera el formulario secundario para cambiar el limite del buffer */
	private String limitFormHTML() {
		return "<form action='/' method='post'>"
				+ "<h2>Establecer limite de noticias</h2>"
				+ "<div class='label-input'><label for='limit'>Limite:</label>"
				+ "<input type='number' name='limit' placeholder='5'></div>"
				+ "<div class='buttons'><input value='Limitar' type='submit' name='action'></div>" + "</form>";
	}

	/** Genera la representacion visual de una noticia recuperada del buffer */
	private String newsHTML(News news) {
		return "<div class='news'><h3>" + news.getTitulo() + "</h3>" + "<p><i>" + news.getFecha() + " - Interes: "
				+ news.getInteres() + "</i></p>" + "<p>" + news.getDescripcion() + "</p>" + "<p class='news-labels'>"
				+ news.getEtiquetasString() + "</p></div>";
	}

	/** Genera un mensaje visual flotante que desaparece a los 5 segundos */
	private String alertHTML(String message, boolean success) {
		String color = success ? "#22c55e" : "#ef4444";
		StringBuilder sb = new StringBuilder();
		sb.append("<div id='notification' class='alert-floating' style='background-color:").append(color).append(";'>")
				.append(message).append("</div>");
		sb.append("<script>").append("setTimeout(function() {")
				.append("  var el = document.getElementById('notification');").append("  if(el) {")
				.append("    el.style.opacity = '0';").append("    el.style.transform = 'translateY(20px)';")
				.append("    setTimeout(function() { el.remove(); }, 500);").append("  }").append("}, 5000);")
				.append("</script>");
		return sb.toString();
	}

	/** Define los estilos CSS con el toast en la esquina inferior derecha */
	private String stylesHTML() {
		return "<style>"
				+ "body { font-family: system-ui; display: flex; flex-direction: column; align-items: center; background: #fcfcfc; padding: 20px; }"
				+ "form, .news { background: white; padding: 24px; width: 100%; max-width: 800px; border-radius: 12px; box-shadow: 0 0 10px rgba(0,0,0,0.1); box-sizing: border-box; }"
				+ ".row { display: flex !important; flex-direction: row !important; gap: 20px; width: 100%; margin-bottom: 10px; }"
				+ ".half { flex: 1; margin-bottom: 0 !important; }"
				+ ".label-input { display: flex; flex-direction: column; margin-bottom: 10px; }"
				+ "h2, h3, p { margin-top: 0; margin-bottom: 10px; }"
				+ "input, textarea, select { padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 100%; box-sizing: border-box; font-family: inherit; }"
				+ "textarea { height: 36px; min-height: 36px; resize: vertical; }"
				+ ".buttons { display: flex; gap: 12px; margin-top: 10px; }"
				+ ".alert-floating { position: fixed; bottom: 20px; right: 20px; z-index: 9999; padding: 16px 24px; color: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); transition: all 0.5s ease; min-width: 250px; text-align: center; font-weight: 500; }"
				+ ".news-labels { color: #666; font-size: 0.9em; margin-bottom: 0; font-weight: bold; }" + "</style>";
	}
}