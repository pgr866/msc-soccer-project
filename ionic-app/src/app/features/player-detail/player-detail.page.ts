import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IonContent, IonButton, IonTextarea, IonList, IonItem, IonLabel,
  IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, create, newspaper, send, star, starOutline } from 'ionicons/icons';
import { PlayerService } from '@/app/core/services/player.service';
import { AuthService } from '@/app/core/services/auth.service';
import { GenericHeaderComponent } from '@/app/shared/components/generic-header/generic-header.component';
import { PlayerDetail } from '@/app/core/models/comment.model';
import { CommentService } from '@/app/core/services/comment.service';
import { DeviceService } from '@/app/core/services/device.service';
import { ToastService } from '@/app/core/services/toast.service';

@Component({
  selector: 'app-player-detail',
  templateUrl: './player-detail.page.html',
  imports: [
    IonContent, IonButton, IonTextarea, IonList, IonItem, IonLabel,
    IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, IonIcon, IonSpinner,
    CommonModule, FormsModule, RouterLink, GenericHeaderComponent
  ],
})
export class PlayerDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private playerService = inject(PlayerService);
  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private deviceService = inject(DeviceService);
  private toastService = inject(ToastService);

  public user = toSignal(this.authService.user$);
  public data = signal<PlayerDetail | null>(null);
  public newCommentText = '';
  public newCommentRating = 4;

  constructor() {
    addIcons({ trash, create, newspaper, send, star, starOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadData(id);
  }

  loadData(id: string) {
    this.playerService.getPlayerDetail(id).subscribe((res) => {
      this.data.set(res);
    });
  }

  deletePlayer(id: string) {
    this.playerService.deletePlayer(id).subscribe({
      next: () => {
        this.toastService.showToast('Jugador eliminado correctamente', 'success');
        this.router.navigate(['/players']);
      },
      error: () => {
        this.toastService.showToast('Error al eliminar el jugador', 'error');
      }
    });
  }

  async postComment() {
    const player = this.data()?.player;
    if (!player || !this.newCommentText.trim()) {
      await this.toastService.showToast('El comentario no puede estar vacío', 'error');
      return;
    }
    try {
      const coords = await this.deviceService.getCurrentPosition();
      this.commentService.addComment(player.id, {
        text: this.newCommentText,
        rating: this.newCommentRating,
        latitude: coords.lat,
        longitude: coords.lng
      }).subscribe({
        next: () => {
          this.newCommentText = '';
          this.loadData(player.id);
          this.toastService.showToast('Comentario publicado con éxito', 'success');
        },
        error: () => this.toastService.showToast('Error al publicar comentario', 'error')
      });
    } catch (error) {
      this.toastService.showToast('Error de ubicación: activa el GPS', 'error');
    }
  }

  deleteComment(commentId: string) {
    const playerId = this.data()?.player.id;
    if (playerId) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          this.toastService.showToast('Comentario eliminado', 'success');
          this.loadData(playerId);
        },
        error: () => {
          this.toastService.showToast('Error al eliminar el comentario', 'error');
        }
      });
    }
  }
}
