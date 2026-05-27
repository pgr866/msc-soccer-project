import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '@/app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginPage {
  private authService = inject(AuthService);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private router = inject(Router);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  constructor() {
    effect(() => {
      if (this.authService.currentUser()) this.router.navigate(["/home"]);
    });
  }

  async login() {
    if (this.loginForm.invalid) {
      this.showErrorMessage('Por favor, completa los campos correctamente.');
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent',
      duration: 2000
    });
    await loading.present();
    const { email, password } = this.loginForm.value;
    try {
      await this.authService.login(email!, password!);
      this.loginForm.reset();
      this.showInfoMessage('Inicio de sesión realizado. Redirigiendo...');
      this.router.navigate(["/home"]);
    } catch (error: any) {
      this.showErrorMessage('Error en la autenticación: ' + error.message);
    } finally {
      loading.dismiss();
    }
  }

  async showErrorMessage(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    toast.present();
  }

  async showInfoMessage(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }
}
