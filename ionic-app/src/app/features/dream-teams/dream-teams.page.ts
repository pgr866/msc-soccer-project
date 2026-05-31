import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonCard, IonList, IonItem, IonLabel, IonAccordionGroup, IonAccordion, IonNote, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sparklesOutline } from 'ionicons/icons';
import { DreamTeamService } from '@/app/core/services/dream-team.service';
import { RouterLink } from '@angular/router';
import { GenericHeaderComponent } from '@/app/shared/components/generic-header/generic-header.component';
import { ToastService } from '@/app/core/services/toast.service';

@Component({
  selector: 'app-dream-teams',
  templateUrl: './dream-teams.page.html',
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonCard, IonList, IonItem, IonLabel, IonAccordionGroup, IonAccordion, IonNote, IonIcon, RouterLink, GenericHeaderComponent]
})
export class DreamTeamsPage implements OnInit {
  private toastService = inject(ToastService);
  private dreamTeamService = inject(DreamTeamService);
  public teams = this.dreamTeamService.dreamTeams;

  constructor() {
    addIcons({ sparklesOutline });
  }

  ngOnInit() {
    this.dreamTeamService.getDreamTeams().subscribe();
  }

  generate() {
    this.dreamTeamService.generateDreamTeam().subscribe({
      next: () => {
        this.toastService.showToast('Equipazo generado correctamente', 'success');
      },
      error: () => {
        this.toastService.showToast('Error al generar el equipazo', 'error');
      }
    });
  }
}
