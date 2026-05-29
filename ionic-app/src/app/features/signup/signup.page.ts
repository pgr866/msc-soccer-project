import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '@/app/core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, RouterLink]
})
export class SignupPage {
  private authService = inject(AuthService);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private router = inject(Router);

  signupForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    repeat_password: new FormControl('', [Validators.required])
  }, { validators: this.passwordMatchValidator });

  constructor() {
    effect(() => {
      if (this.authService.currentUser()) this.router.navigate(["/players"]);
    });
  }

  passwordMatchValidator(control: AbstractControl) {
    return control.get('password')?.value === control.get('repeat_password')?.value 
      ? null : { mismatch: true };
  }

  async signup() {
    if (this.signupForm.invalid) return;
    const loading = await this.loadingController.create({
      message: 'Creando cuenta...',
      spinner: 'crescent'
    });
    await loading.present();
    const { email, password, repeat_password } = this.signupForm.value;
    try {
      await this.authService.signup(email!, password!, repeat_password!);
      this.showInfoMessage('Cuenta creada con éxito.');
      this.router.navigate(["/players"]);
    } catch (error: any) {
      this.showErrorMessage(error.message);
    } finally {
      loading.dismiss();
    }
  }

  async showErrorMessage(message: string) {
    const toast = await this.toastController.create({
      message, duration: 3000, color: 'danger'
    });
    toast.present();
  }

  async showInfoMessage(message: string) {
    const toast = await this.toastController.create({
      message, duration: 2000, color: 'success'
    });
    toast.present();
  }
}
