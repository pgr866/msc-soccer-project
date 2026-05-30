import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { IonicModule, LoadingController } from '@ionic/angular';
import { AuthService } from '@/app/core/services/auth.service';
import { ToastService } from '@/app/core/services/toast.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, RouterLink]
})
export class SignupPage {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
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
    if (this.signupForm.invalid) {
      this.toastService.showToast('Por favor, revisa que los datos sean correctos y las contraseñas coincidan.', 'error');
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Creando cuenta...',
      spinner: 'crescent'
    });
    await loading.present();
    const { email, password, repeat_password } = this.signupForm.value;
    try {
      await this.authService.signup(email!, password!, repeat_password!);
      this.toastService.showToast('Cuenta creada con éxito.', 'success');
    } catch (error: any) {
      this.toastService.showToast('Error: ' + error.message, 'error');
    } finally {
      await loading.dismiss();
    }
  }
}
