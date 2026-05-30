import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { IonicModule, LoadingController } from '@ionic/angular';
import { AuthService } from '@/app/core/services/auth.service';
import { ToastService } from '@/app/core/services/toast.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, RouterLink]
})
export class LoginPage {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private loadingController = inject(LoadingController);
  private router = inject(Router);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  constructor() {
    effect(() => {
      if (this.authService.currentUser()) this.router.navigate(["/players"]);
    });
  }

  async login() {
    if (this.loginForm.invalid) {
      this.toastService.showToast('Por favor, completa los campos correctamente.', 'error');
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();
    const { email, password } = this.loginForm.value;
    try {
      await this.authService.login(email!, password!);
      this.loginForm.reset();
      this.toastService.showToast('Sesión iniciada correctamente', 'success');
    } catch (error: any) {
      this.toastService.showToast('Error: ' + error.message, 'error');
    } finally {
      await loading.dismiss();
    }
  }
}
