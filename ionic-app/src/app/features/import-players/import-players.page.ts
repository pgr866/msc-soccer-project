import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonSearchbar, IonList, IonItem, IonCheckbox, IonAvatar, IonLabel, IonButton } from '@ionic/angular/standalone';
import { PlayerService } from '@/app/core/services/player.service';
import { DeviceService } from '@/app/core/services/device.service';
import { ToastService } from '@/app/core/services/toast.service';
import { AlertService } from '@/app/core/services/alert.service';
import { GenericHeaderComponent } from '@/app/shared/components/generic-header/generic-header.component';
import { Router } from '@angular/router';

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
  private router = inject(Router);

  public searchQuery = '';
  public displayLimit = 20;

  search() {
    if (this.searchQuery.length < 3) return;
    this.displayLimit = 20;
    this.playerService.searchExternalPlayers(this.searchQuery).subscribe({
      error: () => this.toastService.showToast('Error en la búsqueda', 'error')
    });
  }

  async importSelected() {
    const count = this.playerService.selectedIds().length;
    const confirmed = await this.alertService.showConfirmation('Importar jugadores', `¿Estás seguro de que quieres importar ${count} jugador(es) a la base de datos?`);
    if (!confirmed) return;
    try {
      const { lat, lng } = await this.deviceService.getCurrentPosition();
      this.playerService.importPlayers(lat, lng).subscribe({
        next: () => {
          this.toastService.showToast('Jugadores importados', 'success');
          this.playerService.clearImportState();
          this.router.navigate(['/players']);
        },
        error: () => this.toastService.showToast('Error al importar', 'error')
      });
    } catch {
      this.toastService.showToast('Error de GPS', 'error');
    }
  }
}
