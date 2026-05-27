import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules, withComponentInputBinding } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from '@/app/app.routes';
import { AppComponent } from '@/app/app.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { provideStorage, getStorage, connectStorageEmulator } from '@angular/fire/storage';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@/app/core/interceptors/auth.interceptor';
import { environment as env } from '@/environments/environment';
import { defineCustomElements as defineIonicElements } from '@ionic/core/loader';
import { defineCustomElements as definePwaElements } from '@ionic/pwa-elements/loader';

defineIonicElements();
definePwaElements(window);

const environment = env as typeof env & {
  authEmulator?: { host: string; port: number };
  firestoreEmulator?: { host: string; port: number };
  storageEmulator?: { host: string; port: number };
};

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => {
      const auth = getAuth();
      if (!environment.production && environment.authEmulator) {
        const { host, port } = environment.authEmulator;
        connectAuthEmulator(auth, `http://${host}:${port}`, { disableWarnings: true });
      }
      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (!environment.production && environment.firestoreEmulator) {
        const { host, port } = environment.firestoreEmulator;
        connectFirestoreEmulator(firestore, host, port);
      }
      return firestore;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (!environment.production && environment.storageEmulator) {
        const { host, port } = environment.storageEmulator;
        connectStorageEmulator(storage, host, port);
      }
      return storage;
    }),
  ],
});
