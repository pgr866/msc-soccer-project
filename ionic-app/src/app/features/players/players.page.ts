import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonLabel, IonImg, IonItem, IonList, IonToggle, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { AuthService } from '@/app/core/services/auth.service';
import { BackendConfigService } from '@/app/core/services/backend-config.service';
import { PlayerService } from '@/app/core/services/player.service';
import { camera, location, add, logOutOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-players',
  templateUrl: './players.page.html',
  styleUrls: ['./players.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonLabel, IonImg, IonItem, IonList, IonToggle, IonCard, IonCardContent, CommonModule, FormsModule]
})
export class PlayersPage implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  public configService = inject(BackendConfigService);
  public playerService = inject(PlayerService);

  constructor() {
    addIcons({ add, logOutOutline, camera, location });
  }

  private init() {
    this.playerService.getPlayers();
  }

  private initializePlayer() {
    (this.playerService as any)._player.set({
      id: 0, 
      name: 'Player1',
      age: 0,
      photo_url: '',
      latitude: 0,
      longitude: 0
    });
  }

  ngOnInit() {
    this.init();
    this.initializePlayer();
  }

  onToggleChange() {
    this.configService.toggleBackend();
    this.init();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  async takePhoto() {
    try {
      await this.playerService.takePhoto();
    } catch (error) {
      console.error('Error al tomar foto:', error);
    }
  }

  async obtainLocation() {
    try {
      await this.playerService.getCurrentPosition();
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
    }
  }
}
