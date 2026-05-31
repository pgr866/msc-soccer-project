import { Component, inject, OnInit } from '@angular/core';
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonIcon, IonLabel, IonButton, IonText } from '@ionic/angular/standalone';
import { cloudDownloadOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { GenericHeaderComponent } from '@/app/shared/components/generic-header/generic-header.component';
import { NewsService } from '@/app/core/services/news.service';
import { ToastService } from '@/app/core/services/toast.service';
import { AlertService } from '@/app/core/services/alert.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  standalone: true,
  imports: [
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonIcon, IonLabel, IonButton, IonText, GenericHeaderComponent
  ]
})
export class NewsPage implements OnInit {
  private newsService = inject(NewsService);
  private toastService = inject(ToastService);
  private alertService = inject(AlertService);

  public currentNews: any = null;

  constructor() {
    addIcons({ cloudDownloadOutline });
  }

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.newsService.readNews().subscribe({
      next: (res: any) => {
        this.currentNews = res.news || null;
      },
      error: () => this.toastService.showToast('Error al leer noticias', 'error')
    });
  }

  async consumeNews() {
    const confirmed = await this.alertService.showConfirmation('Confirmar consumo', '¿Deseas consumir esta noticia? Esta acción la eliminará del buffer.');
    if (confirmed) {
      this.newsService.receiveNews().subscribe({
        next: (res: any) => {
          const type = res.message?.toLowerCase().includes('error') ? 'error' : 'success';
          this.toastService.showToast(res.message, type);
          this.loadNews();
        },
        error: (err: any) => this.toastService.showToast('Error al consumir noticia', 'error')
      });
    }
  }
}
