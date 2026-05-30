import { Injectable, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class AlertService {
    private alertCtrl = inject(AlertController);

    async showConfirmation(header: string, message: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            const alert = await this.alertCtrl.create({
                header,
                message,
                buttons: [
                    { text: 'Cancelar', role: 'cancel', handler: () => resolve(false) },
                    { text: 'Eliminar', role: 'destructive', handler: () => resolve(true) }
                ]
            });
            await alert.present();
        });
    }
}
