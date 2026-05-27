package ual.dwsc.core;

/**
 * Enumeracion que define los niveles de prioridad de una noticia
 */
public enum Interest {
	alto, medio, bajo;

	/** Devuelve el nombre de la prioridad como cadena de texto */
	@Override
	public String toString() {
		return name();
	}

	/** Convierte una cadena de texto al tipo Interest correspondiente */
	public static Interest fromString(String text) {
		return Interest.valueOf(text.toLowerCase());
	}
}