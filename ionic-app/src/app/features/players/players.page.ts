import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonContent, IonItem, IonList, IonLabel, IonSearchbar,
  IonDatetime, IonModal, IonButton, IonButtons, IonAvatar, IonHeader,
  IonFab, IonFabButton, IonFabList, IonIcon, IonToolbar,
} from '@ionic/angular/standalone';
import { PlayerService } from '@/app/core/services/player.service';
import { ToastService } from '@/app/core/services/toast.service';
import { GenericHeaderComponent } from '@/app/shared/components/generic-header/generic-header.component';
import { addIcons } from 'ionicons';
import { add, close, cloudUpload, personAdd } from 'ionicons/icons';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
  selector: 'app-players',
  templateUrl: './players.page.html',
  imports: [
    IonContent, IonItem, IonList, IonLabel, IonSearchbar,
    IonDatetime, IonModal, IonButton, IonButtons, IonAvatar,
    IonFab, IonFabButton, IonFabList, IonIcon, IonHeader, IonToolbar,
    CommonModule, RouterLink, GenericHeaderComponent
  ]
})
export class PlayersPage implements OnInit {
  public playerService = inject(PlayerService);
  public authService = inject(AuthService);
  private toastService = inject(ToastService);

  @ViewChild('startDateModal') startDateModal!: IonModal;
  @ViewChild('startDatetime') startDatetime!: IonDatetime;
  @ViewChild('endDateModal') endDateModal!: IonModal;
  @ViewChild('endDatetime') endDatetime!: IonDatetime;

  constructor() {
    addIcons({ add, close, cloudUpload, personAdd });
  }

  ngOnInit() {
    this.loadPlayers();
  }

  loadPlayers() {
    this.playerService.getPlayers().subscribe({
      error: () => {
        this.toastService.showToast('Error al cargar la lista de jugadores', 'error');
      }
    });
  }

  updateSearch(value: string | null | undefined) {
    this.playerService.searchQuery.set(value || '');
    this.loadPlayers();
  }

  handleDateChange(value: string | string[] | null | undefined, type: 'start' | 'end') {
    const dateValue = Array.isArray(value) ? value[0] : value;
    const dateFormatted = dateValue ? dateValue.split('T')[0] : undefined;
    if (type === 'start') {
      this.playerService.startDate.set(dateFormatted);
    } else {
      this.playerService.endDate.set(dateFormatted);
    }
    this.loadPlayers();
  }

  resetDate(type: 'start' | 'end') {
    if (type === 'start') {
      this.playerService.startDate.set(undefined);
      this.startDateModal.dismiss();
    } else {
      this.playerService.endDate.set(undefined);
      this.endDateModal.dismiss();
    }
    this.loadPlayers();
  }

  confirmStartDate() {
    this.handleDateChange(this.startDatetime.value, 'start');
    this.startDateModal.dismiss();
  }

  confirmEndDate() {
    this.handleDateChange(this.endDatetime.value, 'end');
    this.endDateModal.dismiss();
  }
}
