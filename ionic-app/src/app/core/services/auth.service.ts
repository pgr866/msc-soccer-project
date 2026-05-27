import { Injectable, inject } from '@angular/core';
import { Auth, user, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, Observable } from 'rxjs';
import { User } from '@/app/core/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private db = inject(Firestore);
  public user$: Observable<User | null> = user(this.auth).pipe(
    switchMap((authUser: FirebaseUser | null) => this.fetchUserProfile(authUser))
  );
  public currentUser = toSignal<User | null>(this.user$, { initialValue: null });

  private async fetchUserProfile(authUser: FirebaseUser | null): Promise<User | null> {
    if (!authUser) return null;
    const snap = await getDoc(doc(this.db, 'users', authUser.uid));
    if (!snap.exists()) return null;
    return { ...snap.data(), uid: authUser.uid, email: authUser.email } as User;
  }

  async signup(email: string, password: string, repeat_password: string) {
    if (password !== repeat_password) {
      throw new Error('Las contraseñas no coinciden.');
    }
    try {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    await setDoc(doc(this.db, 'users', userCredential.user.uid), { role: 'USER' });
    return userCredential;
    } catch (error: any) {
      let customMessage = 'Error al registrarse';
      switch (error.code) {
        case 'auth/email-already-in-use':
          customMessage = 'El correo ya está en uso.';
          break;
        case 'auth/invalid-email':
          customMessage = 'El formato del correo no es válido.';
          break;
        case 'auth/weak-password':
          customMessage = 'La contraseña es demasiado débil.';
          break;
        default:
          customMessage = 'Error al registrarse: ' + error.message;
      }
      throw new Error(customMessage);
    }
  }

  async login(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      let customMessage = 'Ha ocurrido un error inesperado';
      switch (error.code) {
        case 'auth/invalid-credential':
          customMessage = 'El usuario no existe o la contraseña es incorrecta.';
          break;
        case 'auth/too-many-requests':
          customMessage = 'Demasiados intentos fallidos. Inténtalo más tarde.';
          break;
        case 'auth/user-disabled':
          customMessage = 'Esta cuenta ha sido deshabilitada.';
          break;
        default:
          customMessage = 'Error al iniciar sesión: ' + error.message;
      }
      throw new Error(customMessage);
    }
  }

  async getToken(): Promise<string | null> {
    return await this.auth.currentUser?.getIdToken() || null;
  }

  async logout() {
    return signOut(this.auth);
  }
}
