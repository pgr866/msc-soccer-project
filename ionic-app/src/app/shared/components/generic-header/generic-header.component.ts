import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { logOutOutline, logInOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/services/auth.service';
import { BackendConfigService } from '@/app/core/services/backend-config.service';
import { IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonLabel, IonItem, IonToggle, IonBackButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-generic-header',
  templateUrl: './generic-header.component.html',
  styleUrls: ['./generic-header.component.scss'],
  imports: [IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonLabel, IonItem, IonToggle, IonBackButton, CommonModule, FormsModule, RouterLink],
})
export class GenericHeaderComponent implements OnInit {
  @Input() title: string = '';
  @Input() backRoute?: string;
  @Input() favIcon: boolean = false;

  private router = inject(Router);
  public authService = inject(AuthService);
  public configService = inject(BackendConfigService);

  constructor() {
    addIcons({ logOutOutline, logInOutline });
  }

  ngOnInit() { }

  onToggleChange() {
    this.configService.toggleBackend();
    setTimeout(() => {
      window.location.href = '/players';
    }, 500);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/players']);
  }
}
