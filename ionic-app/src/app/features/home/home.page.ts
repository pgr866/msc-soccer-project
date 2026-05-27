import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, NavController } from '@ionic/angular/standalone';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [ FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, RouterLink ],
})
export class HomePage {

  private navCtrl = inject(NavController);
  private router = inject(Router);

  constructor() { }

  goToLogin() {
    this.navCtrl.navigateForward('/login');
  }

  async processAndNavigate() {
    // await this.myService.saveData();
    this.router.navigate(['/login']);
  }

  goToLoginWithoutAnimation() {
    this.navCtrl.navigateRoot('/login');
  }
}
