import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonList, IonLabel } from '@ionic/angular/standalone';
import { PlayerService } from '@/app/core/services/player.service';
import { GenericHeaderComponent } from '@/app/shared/components/generic-header/generic-header.component';

@Component({
  selector: 'app-players',
  templateUrl: './players.page.html',
  standalone: true,
  imports: [IonContent, IonItem, IonList, IonLabel, CommonModule, FormsModule, GenericHeaderComponent]
})
export class PlayersPage implements OnInit {
  public playerService = inject(PlayerService);

  ngOnInit() {
    this.playerService.getPlayers();
    this.ensureDefaultPlayer();
  }

  private ensureDefaultPlayer() {
    if (!this.playerService.player()) {
      (this.playerService as any)._player.set({
        id: 0, name: 'Player1', age: 0, photo_url: '', latitude: 0, longitude: 0
      });
    }
  }
}
