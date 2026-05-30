import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class ToastService {
    private toastCtrl = inject(ToastController);

    async showToast(message: string, type: 'success' | 'error' = 'success') {
        const toast = await this.toastCtrl.create({
            message,
            duration: 2000,
            position: 'bottom',
            color: type === 'success' ? 'success' : 'danger',
            buttons: [{ text: 'OK', role: 'cancel' }]
        });
        await toast.present();
    }
}
