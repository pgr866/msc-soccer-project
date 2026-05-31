import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton } from '@ionic/angular/standalone';
import { GenericHeaderComponent } from '@/app/shared/components/generic-header/generic-header.component';
import { NewsService } from '@/app/core/services/news.service';
import { ToastService } from '@/app/core/services/toast.service';

@Component({
  selector: 'app-create-news',
  templateUrl: './create-news.page.html',
  standalone: true,
  imports: [
    ReactiveFormsModule, IonContent, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton, GenericHeaderComponent
  ]
})
export class CreateNewsPage {
  @Input() playerName!: string;
  private fb = inject(FormBuilder);
  private newsService = inject(NewsService);
  private toastService = inject(ToastService);

  public newsForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(30)]],
    description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(250)]],
    labels: ['', Validators.required],
    limit: [5]
  });

  publish() {
    if (this.newsForm.invalid) {
      this.toastService.showToast('Revisa los campos', 'error');
      return;
    }
    const { title, description, labels } = this.newsForm.value;
    const payload = { title, description, labels, player: this.playerName };
    this.newsService.sendNews(payload).subscribe({
      next: (res: any) => {
        const isError = res.message?.toLowerCase().includes('error');
        this.toastService.showToast(res.message, isError ? 'error' : 'success');
        if (!isError) this.newsForm.reset({ limit: 5 });
      },
      error: (error: any) => this.toastService.showToast('Error al publicar', 'error')
    });
  }

  updateLimit() {
    const limit = this.newsForm.get('limit')?.value;
    this.newsService.setLimit(limit).subscribe({
      next: (res: any) => this.toastService.showToast(res.message, res.message?.toLowerCase().includes('error') ? 'error' : 'success'),
      error: (error: any) => this.toastService.showToast(`Error al limitar`, 'error')
    });
  }
}
