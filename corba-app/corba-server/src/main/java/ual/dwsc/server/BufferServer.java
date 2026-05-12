package ual.dwsc.server;

import org.omg.CORBA.ORB;
import org.omg.CosNaming.NameComponent;
import org.omg.CosNaming.NamingContext;
import org.omg.CosNaming.NamingContextHelper;
import org.omg.PortableServer.POA;
import org.omg.PortableServer.POAHelper;
import ual.dwsc.bufferapp.NewsBuffer;
import ual.dwsc.bufferapp.NewsBufferHelper;

/**
 * Clase servidor que inicializa el ORB y registra la implementacion del Buffer
 * de noticias en el servicio de nombres
 */
public class BufferServer {

	public static void main(String args[]) {
		try {
			// Crea e inicializa el ORB con los argumentos de linea de comandos
			ORB orb = ORB.init(args, null);

			// Obtiene y activa el RootPOA para poder obtener la referencia del objeto
			POA rootpoa = POAHelper.narrow(orb.resolve_initial_references("RootPOA"));
			rootpoa.the_POAManager().activate();

			// Crea el objeto servant (la implementacion real del buffer)
			BufferImpl bufferImpl = new BufferImpl();
			bufferImpl.setORB(orb);

			// Conecta el servant al ORB
			org.omg.CORBA.Object ref = rootpoa.servant_to_reference(bufferImpl);
			NewsBuffer href = NewsBufferHelper.narrow(ref);

			// Obtiene la referencia al servicio de nombres (Naming Service)
			org.omg.CORBA.Object objRef = orb.resolve_initial_references("NameService");
			NamingContext ncRef = NamingContextHelper.narrow(objRef);

			// Registra el objeto en el servicio de nombres bajo el identificador "Buffer"
			NameComponent nc = new NameComponent("Buffer", "");
			NameComponent path[] = { nc };

			ncRef.rebind(path, href);

			System.out.println("---------------------------------------------------");
			System.out.println("Servidor NewsBuffer preparado y esperando peticiones...");
			System.out.println("Registrado en NameService como: 'Buffer'");
			System.out.println("---------------------------------------------------");

			// Mantiene el servidor activo indefinidamente
			java.lang.Object sync = new java.lang.Object();
			synchronized (sync) {
				sync.wait();
			}
		} catch (Exception e) {
			System.err.println("ERROR: " + e);
			e.printStackTrace(System.out);
		}
	}
}