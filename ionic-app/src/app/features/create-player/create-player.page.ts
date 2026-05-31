import { Component, inject, OnInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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

@Component({
  selector: 'app-create-player',
  templateUrl: './create-player.page.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule, ReactiveFormsModule, IonContent, IonItem, IonLabel,
    IonInput, IonButton, IonIcon, IonModal, IonDatetime,
    IonGrid, IonRow, IonCol, IonCard, GenericHeaderComponent
  ]
})
export class CreatePlayerPage implements OnInit {
  private fb = inject(FormBuilder);
  private playerService = inject(PlayerService);
  private alertService = inject(AlertService);
  private navCtrl = inject(NavController);
  private deviceService = inject(DeviceService);
  private toastService = inject(ToastService);
  public playerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    firstName: [''],
    lastName: [''],
    age: [null],
    birthdate: [''],
    nationality: [''],
    height: [null],
    weight: [null],
    number: [null, [Validators.min(1), Validators.max(99)]],
    team: [''],
    league: [''],
    position: [''],
    photoUrl: [''],
    latitude: [0, Validators.required],
    longitude: [0, Validators.required]
  });

  @ViewChild('dateModal') dateModal!: IonModal;
  @ViewChild('datetime') datetime!: IonDatetime;
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;
  newMap!: GoogleMap;
  private markerId: string | null = null;

  constructor() { addIcons({ camera, locate, calendar, save }); }

  ngOnInit() {
    this.resetLocation();
    setTimeout(async () => {
      await this.createMap();
    }, 500);
  }

  async createMap() {
    if (!this.mapRef || !this.mapRef.nativeElement) return;
    const { latitude, longitude } = this.playerForm.value;
    this.newMap = await GoogleMap.create({
      id: 'my-map',
      element: this.mapRef.nativeElement,
      apiKey: 'AIzaSyAox2bEMtyviZG9-naimV5hrGFV3iCCdJU',
      config: { center: { lat: latitude, lng: longitude }, zoom: 10 }
    });
    await this.addOrUpdateMarker(latitude, longitude);
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

  async createPlayer() {
    if (this.playerForm.invalid) return;
    const confirmed = await this.alertService.showConfirmation('Crear jugador', `¿Estás seguro de que quieres registrar a ${this.playerForm.value.name}?`);
    if (!confirmed) return;
    this.playerService.createPlayer(this.playerForm.value).subscribe({
      next: () => {
        this.playerForm.reset({
          name: '',
          firstName: '',
          lastName: '',
          age: null,
          birthdate: '',
          nationality: '',
          height: null,
          weight: null,
          number: null,
          team: '',
          league: '',
          position: '',
          photoUrl: '',
          latitude: 0,
          longitude: 0
        });
        this.resetLocation();
        this.toastService.showToast('Jugador creado correctamente', 'success');
        this.navCtrl.back();
      },
      error: () => this.toastService.showToast('Error al crear el jugador', 'error')
    });
  }
}
