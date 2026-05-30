import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonItem, IonList, IonLabel, IonSearchbar,
  IonDatetime, IonModal, IonButton, IonAvatar,
  IonFab, IonFabButton, IonFabList, IonIcon
} from '@ionic/angular/standalone';
import { PlayerService } from '@/app/core/services/player.service';
import { ToastService } from '@/app/core/services/toast.service';
import { GenericHeaderComponent } from '@/app/shared/components/generic-header/generic-header.component';
import { addIcons } from 'ionicons';
import { add, close, cloudUpload, personAdd } from 'ionicons/icons';

@Component({
  selector: 'app-players',
  templateUrl: './players.page.html',
  imports: [
    IonContent, IonItem, IonList, IonLabel, IonSearchbar,
    IonDatetime, IonModal, IonButton, IonAvatar,
    IonFab, IonFabButton, IonFabList, IonIcon, // Solo estos
    CommonModule, RouterLink, GenericHeaderComponent
  ]
})
export class PlayersPage implements OnInit {
  public playerService = inject(PlayerService);
  private toastService = inject(ToastService);

  public searchQuery: string = '';
  public startDate: string | undefined = undefined;
  public endDate: string | undefined = undefined;

  constructor() {
    addIcons({ add, close, cloudUpload, personAdd });
  }

  ngOnInit() {
    this.loadPlayers();
  }

  handleDateChange(value: string | string[] | null | undefined, type: 'start' | 'end') {
    const dateValue = Array.isArray(value) ? value[0] : value;
    if (type === 'start') this.startDate = dateValue || undefined;
    else this.endDate = dateValue || undefined;
    this.loadPlayers();
  }

  private formatDate(dateStr: string | undefined): string | undefined {
    return dateStr ? dateStr.split('T')[0] : undefined;
  }

  loadPlayers() {
    this.playerService.getPlayers(
      this.searchQuery,
      this.formatDate(this.startDate),
      this.formatDate(this.endDate)
    ).subscribe({
      next: () => {
      },
      error: () => {
        this.toastService.showToast('Error al cargar la lista de jugadores', 'error');
      }
    });
  }
}
