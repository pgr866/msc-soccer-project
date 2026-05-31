import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonSearchbar, IonList, IonItem, IonCheckbox, IonAvatar, IonLabel, IonButton, NavController } from '@ionic/angular/standalone';
import { PlayerService } from '@/app/core/services/player.service';
import { DeviceService } from '@/app/core/services/device.service';
import { ToastService } from '@/app/core/services/toast.service';
import { AlertService } from '@/app/core/services/alert.service';
import { GenericHeaderComponent } from '@/app/shared/components/generic-header/generic-header.component';
import { Player } from '@/app/core/models/player.model';

@Component({
  selector: 'app-import-players',
  templateUrl: './import-players.page.html',
  imports: [IonContent, IonSearchbar, IonList, IonItem, IonCheckbox, IonAvatar, IonLabel, IonButton, CommonModule, GenericHeaderComponent]
})
export class ImportPlayersPage {
  public playerService = inject(PlayerService);
  private deviceService = inject(DeviceService);
  private toastService = inject(ToastService);
  private alertService = inject(AlertService);
  private navCtrl = inject(NavController);

  public searchQuery: string = '';
  public displayLimit: number = 20;
  public searchImportResults: Player[] = [];
  public selectedIds: number[] = [];

  search() {
    if (this.searchQuery.length < 3) return;
    this.displayLimit = 20;
    this.playerService.searchExternalPlayers(this.searchQuery).subscribe({
      next: (results: Player[]) => {
        this.searchImportResults = results;
      },
      error: () => this.toastService.showToast('Error en la búsqueda', 'error')
    });
  }

  toggleSelectedId(id: number, isSelected: boolean) {
    if (isSelected) {
      this.selectedIds = [...this.selectedIds, id];
    } else {
      this.selectedIds = this.selectedIds.filter(i => i !== id);
    }
  }

  async importSelected() {
    const confirmed = await this.alertService.showConfirmation('Importar jugadores', `¿Estás seguro de que quieres importar ${this.selectedIds.length} jugador(es) a la base de datos?`);
    if (!confirmed) return;
    try {
      const { lat, lng } = await this.deviceService.getCurrentPosition();
      this.playerService.importPlayers(this.selectedIds, lat, lng).subscribe({
        next: () => {
          this.toastService.showToast('Jugadores importados', 'success');
          this.searchImportResults = [];
          this.selectedIds = [];
          this.navCtrl.back();
        },
        error: () => this.toastService.showToast('Error al importar', 'error')
      });
    } catch {
      this.toastService.showToast('Error de GPS', 'error');
    }
  }
}
