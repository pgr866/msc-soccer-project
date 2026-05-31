import { Component, inject, Input, OnInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonItem, IonLabel, IonInput, IonButton,
  IonIcon, IonModal, IonDatetime, IonGrid, IonRow, IonCol, IonCard, NavController
} from '@ionic/angular/standalone';
import { GoogleMap } from '@capacitor/google-maps';
import { GenericHeaderComponent } from '@/app/shared/components/generic-header/generic-header.component';
import { DeviceService } from '@/app/core/services/device.service';
import { ToastService } from '@/app/core/services/toast.service';
import { addIcons } from 'ionicons';
import { camera, locate, calendar, save } from 'ionicons/icons';
import { PlayerService } from '@/app/core/services/player.service';
import { AlertService } from '@/app/core/services/alert.service';
import { PlayerDetail } from '@/app/core/models/comment.model';

@Component({
  selector: 'app-edit-player',
  templateUrl: './edit-player.page.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, ReactiveFormsModule, IonContent, IonItem, IonLabel,
    IonInput, IonButton, IonIcon, IonModal, IonDatetime,
    IonGrid, IonRow, IonCol, IonCard, GenericHeaderComponent
  ]
})
export class EditPlayerPage implements OnInit {
  @Input() playerId!: string;
  private fb = inject(FormBuilder);
  private playerService = inject(PlayerService);
  private alertService = inject(AlertService);
  private navCtrl = inject(NavController);
  private deviceService = inject(DeviceService);
  private toastService = inject(ToastService);
  public playerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    firstName: ['', Validators.maxLength(100)],
    lastName: ['', Validators.maxLength(100)],
    age: [null, Validators.min(0)],
    birthdate: [''],
    nationality: ['', Validators.maxLength(100)],
    height: [null],
    weight: [null],
    number: [null, [Validators.min(0), Validators.max(99)]],
    team: ['', Validators.maxLength(150)],
    league: ['', Validators.maxLength(150)],
    position: ['', Validators.maxLength(50)],
    photoUrl: ['', Validators.maxLength(255)],
    latitude: [0, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: [0, [Validators.required, Validators.min(-180), Validators.max(180)]]
  });

  @ViewChild('dateModal') dateModal!: IonModal;
  @ViewChild('datetime') datetime!: IonDatetime;
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;
  newMap!: GoogleMap;
  private markerId: string | null = null;

  constructor() { addIcons({ camera, locate, calendar, save }); }

  async ngOnInit() {
    this.playerService.getPlayerDetail(this.playerId).subscribe((playerDetail: PlayerDetail) => {
      if (playerDetail) {
        this.playerForm.patchValue(playerDetail.player);
        setTimeout(async () => {
          await this.createMap(playerDetail.player.latitude, playerDetail.player.longitude);
        }, 500);
      }
    });
  }

  async createMap(lat: number, lng: number) {
    if (!this.mapRef || !this.mapRef.nativeElement) return;
    this.newMap = await GoogleMap.create({
      id: 'edit-map',
      element: this.mapRef.nativeElement,
      apiKey: 'AIzaSyAox2bEMtyviZG9-naimV5hrGFV3iCCdJU',
      config: { center: { lat, lng }, zoom: 10 }
    });
    await this.addOrUpdateMarker(lat, lng);
    await this.newMap.setOnMarkerDragStartListener(() => {
    });
    await this.newMap.setOnMarkerDragEndListener(async (event: any) => {
      this.playerForm.patchValue({
        latitude: event.latitude,
        longitude: event.longitude
      });
    });
  }

  async addOrUpdateMarker(lat: number, lng: number) {
    if (!this.newMap) return;
    if (this.markerId) {
      await this.newMap.removeMarkers([this.markerId]);
      this.markerId = null;
    }
    this.markerId = await this.newMap.addMarker({
      coordinate: { lat, lng },
      draggable: true,
    });
  }

  async resetLocation() {
    const pos = await this.deviceService.getCurrentPosition();
    this.playerForm.patchValue({ latitude: pos.lat, longitude: pos.lng });
    if (this.newMap) {
      await this.newMap.setCamera({ coordinate: { lat: pos.lat, lng: pos.lng }, animate: true });
      await this.addOrUpdateMarker(pos.lat, pos.lng);
    }
  }

  async takePhoto() {
    try {
      const url = await this.deviceService.takeAndUploadPhoto();
      this.playerForm.patchValue({ photoUrl: url });
    } catch (e) {
      this.toastService.showToast('Error al subir la imagen', 'error');
    }
  }

  confirmDate() {
    const value = this.datetime.value;
    this.playerForm.patchValue({ birthdate: value });
    this.dateModal.dismiss();
  }

  resetDate() {
    this.playerForm.patchValue({ birthdate: '' });
    this.dateModal.dismiss();
  }

  async updatePlayer() {
    if (this.playerForm.invalid) return;
    const confirmed = await this.alertService.showConfirmation('Editar jugador', `¿Estás seguro de que quieres editar a ${this.playerForm.value.name}?`);
    if (!confirmed) return;
    this.playerService.updatePlayer(this.playerId, this.playerForm.value).subscribe({
      next: () => {
        this.toastService.showToast('Jugador actualizado correctamente', 'success');
        this.navCtrl.back();
      },
      error: () => this.toastService.showToast('Error al actualizar', 'error')
    });
  }
}
