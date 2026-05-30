import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonButton, IonTextarea, IonList, IonItem, IonLabel,
  IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonIcon, IonSpinner, IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, create, newspaper, send, star, starOutline } from 'ionicons/icons';
import { PlayerService } from '@/app/core/services/player.service';
import { AuthService } from '@/app/core/services/auth.service';
import { GenericHeaderComponent } from '@/app/shared/components/generic-header/generic-header.component';
import { CommentService } from '@/app/core/services/comment.service';
import { DeviceService } from '@/app/core/services/device.service';
import { ToastService } from '@/app/core/services/toast.service';
import { AlertService } from '@/app/core/services/alert.service';

@Component({
  selector: 'app-player-detail',
  templateUrl: './player-detail.page.html',
  imports: [
    IonContent, IonButton, IonTextarea, IonList, IonItem, IonLabel,
    IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonIcon, IonSpinner, IonNote,
    CommonModule, FormsModule, RouterLink, GenericHeaderComponent
  ],
})
export class PlayerDetailPage implements OnInit {
  private router = inject(Router);
  private playerService = inject(PlayerService);
  private commentService = inject(CommentService);
  public authService = inject(AuthService);
  private deviceService = inject(DeviceService);
  private toastService = inject(ToastService);
  private alertService = inject(AlertService);

  @Input() playerId?: string;

  public playerDetail = this.playerService.player;

  public newCommentText = '';
  public newCommentRating = 4;

  constructor() {
    addIcons({ trash, create, newspaper, send, star, starOutline });
  }

  ngOnInit() {
    console.log('ID recibido:', this.playerId);
    if (this.playerId) this.playerService.loadPlayer(this.playerId);
  }

  async deletePlayer() {
    if (!this.playerId) return;
    const confirmed = await this.alertService.showConfirmation('¿Eliminar jugador?', `¿Estás seguro de que quieres eliminar a "${this.playerDetail()?.player.name}"?`);
    if (confirmed) {
      this.playerService.deletePlayer(this.playerId).subscribe({
        next: () => {
          this.toastService.showToast('Jugador eliminado correctamente', 'success');
          this.router.navigate(['/players']);
        },
        error: () => this.toastService.showToast('Error al eliminar el jugador', 'error')
      });
    }
  }

  async postComment() {
    if (!this.playerId) return;
    if (!this.newCommentText.trim()) {
      await this.toastService.showToast('El comentario no puede estar vacío', 'error');
      return;
    }
    try {
      const coords = await this.deviceService.getCurrentPosition();
      this.commentService.addComment(this.playerId, {
        text: this.newCommentText,
        rating: this.newCommentRating,
        latitude: coords.lat,
        longitude: coords.lng
      }).subscribe({
        next: () => {
          this.newCommentText = '';
          this.playerService.loadPlayer(this.playerId!);
          this.toastService.showToast('Comentario publicado con éxito', 'success');
        },
        error: () => this.toastService.showToast('Error al publicar comentario', 'error')
      });
    } catch (error) {
      this.toastService.showToast('Error de ubicación: activa el GPS', 'error');
    }
  }

  async deleteComment(commentId: string) {
    if (!this.playerId) return;
    const confirmed = await this.alertService.showConfirmation('¿Eliminar comentario?', '¿Estás seguro de que quieres eliminar este comentario?');
    if (confirmed) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          this.toastService.showToast('Comentario eliminado', 'success');
          this.playerService.loadPlayer(this.playerId!);
        },
        error: () => {
          this.toastService.showToast('Error al eliminar el comentario', 'error');
        }
      });
    }
  }
}
