import { Component, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { peopleOutline, calendarOutline, pricetagsOutline } from 'ionicons/icons';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public authService = inject(AuthService);

  constructor() {
    addIcons({ peopleOutline, calendarOutline, pricetagsOutline });
  }
}
