package ual.dwsc.server;

import org.omg.CORBA.ORB;
import org.omg.CORBA.StringHolder;
import ual.dwsc.bufferapp.NewsBufferPOA;

/**
 * Implementacion del Buffer
 */
public class BufferImpl extends NewsBufferPOA {

	private ORB orb;
	private String buffer[];
	private int nNews;
	private int maxNews;

	public BufferImpl() {
		this.nNews = 0;
		this.maxNews = 5; // Limite inicial
		this.buffer = new String[maxNews];
	}

	// Implementacion de put() con control de limite
	@Override
	public boolean put(String news) {
		if (nNews < maxNews) {
			buffer[nNews] = news;
			nNews++;
			System.out.println(buffer[nNews - 1] + "\tElementos: " + nNews);
			return true;
		} else {
			System.out.println("BUFFER LLENO (" + maxNews + ")");
			return false;
		}
	}

	// Implementacion de get() con logica de desplazamiento (FIFO)
	@Override
	public boolean get(StringHolder news) {
		if (nNews > 0) {
			news.value = buffer[0];
			// Desplazamiento de elementos para mantener orden FIFO
			for (int i = 0; i < nNews - 1; i++) {
				buffer[i] = buffer[i + 1];
			}
			nNews--;
			return true;
		} else {
			news.value = "No hay ninguna noticia almacenada en el buffer";
			return false;
		}
	}

	// Implementacion de read()
	@Override
	public boolean read(StringHolder news) {
		if (nNews > 0) {
			news.value = buffer[0];
			return true;
		} else {
			news.value = "No hay ninguna noticia almacenada en el buffer";
			return false;
		}
	}

	@Override
	public int getNewsLength() {
		return nNews;
	}

	@Override
	public int getMaxNews() {
		return maxNews;
	}

	// Implementacion de redimensionamiento dinamico
	@Override
	public void fijarLimiteNoticias(int numero_maximo) {
		String[] newBuffer = new String[numero_maximo];
		int newNElements = 0;

		// Copiamos los elementos existentes hasta el nuevo limite
		for (int i = 0; i < Math.min(numero_maximo, this.nNews); i++) {
			newBuffer[i] = this.buffer[i];
			newNElements++;
		}

		this.buffer = newBuffer;
		this.nNews = newNElements;
		this.maxNews = numero_maximo;

		System.out.println("Nuevo limite establecido: " + numero_maximo + ". Elementos actuales: " + nNews);
	}

	@Override
	public void shutdown() {
		if (orb != null) {
			orb.shutdown(false);
		}
	}

	// Metodo para que el servidor le pase el ORB si es necesario
	public void setORB(ORB orb_val) {
		orb = orb_val;
	}
}