package ual.dwsc.core;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Entidad que representa una noticia con validaciones de longitud y formato
 */
public class News {
	private String titulo; // 5 a 30 caracteres sin contar espacios
	private String descripcion; // 20 a 250 caracteres sin contar espacios
	private String fecha; // Formato dd/mm/aaaa
	private Interest interes; // alto, medio, bajo
	private List<String> etiquetas; // Secuencia de 1 a 6 etiquetas (#tag)

	/** Constructor por defecto: inicializa fecha actual y valores vacios */
	public News() {
		this.fecha = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
		this.titulo = "Noticia";
		this.descripcion = "Descripcion de la Noticia";
		this.interes = Interest.medio;
		this.etiquetas = new ArrayList<>(Arrays.asList("#tag"));
	}

	/** Constructor completo para inicializacion con todos los campos */
	public News(String fecha, String titulo, String descripcion, Interest interes, List<String> etiquetas) {
		this.fecha = fecha;
		this.titulo = titulo;
		this.descripcion = descripcion;
		this.interes = interes;
		this.etiquetas = etiquetas;
	}

	/**
	 * Constructor para el Servlet: procesa etiquetas desde una cadena separada por
	 * espacios
	 */
	public News(String titulo, String descripcion, Interest interes, String etiquetas) {
		this.fecha = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
		this.titulo = titulo;
		this.descripcion = descripcion;
		this.interes = interes;
		this.etiquetas = new ArrayList<>(Arrays.asList(etiquetas.trim().split("\\s+")));
	}

	/** Obtiene la fecha de creacion de la noticia */
	public String getFecha() {
		return fecha;
	}

	/** Establece la fecha de la noticia */
	public void setFecha(String fecha) {
		this.fecha = fecha;
	}

	/** Obtiene el titulo de la noticia */
	public String getTitulo() {
		return titulo;
	}

	/** Establece el titulo de la noticia */
	public void setTitulo(String titulo) {
		this.titulo = titulo;
	}

	/** Obtiene la descripcion detallada */
	public String getDescripcion() {
		return descripcion;
	}

	/** Establece la descripcion de la noticia */
	public void setDescripcion(String descripcion) {
		this.descripcion = descripcion;
	}

	/** Obtiene el nivel de interes (prioridad) */
	public Interest getInteres() {
		return interes;
	}

	/** Establece el nivel de interes */
	public void setInteres(Interest interes) {
		this.interes = interes;
	}

	/** Obtiene la lista de etiquetas como coleccion */
	public List<String> getEtiquetas() {
		return etiquetas;
	}

	/** Devuelve las etiquetas en formato de texto plano separadas por espacios */
	public String getEtiquetasString() {
		return String.join(" ", this.etiquetas);
	}

	/** Establece la lista de etiquetas desde una coleccion */
	public void setEtiquetas(List<String> etiquetas) {
		this.etiquetas = etiquetas;
	}

	/** Convierte una cadena de texto en una lista de etiquetas para el objeto */
	public void setEtiquetasString(String etiquetas) {
		this.etiquetas = new ArrayList<>(Arrays.asList(etiquetas.trim().split("\\s+")));
	}

	/** Genera una representacion textual de la noticia para depuracion */
	@Override
	public String toString() {
		return "News [" + "fecha=" + fecha + ", titulo=" + titulo + ", descripcion=" + descripcion + ", interes="
				+ interes + ", etiquetas=" + etiquetas + "]";
	}
}