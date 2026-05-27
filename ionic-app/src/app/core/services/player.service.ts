import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Player } from '@/app/core/models/player.model';
import { BackendConfigService } from './backend-config.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private http = inject(HttpClient);
  private config = inject(BackendConfigService);
  private apiBase = computed(() => this.config.getBaseApi('player'));

  private storage = inject(Storage);

  private _players = signal<Player[]>([]);
  public players = this._players.asReadonly();
  public totalResults = computed(() => this._players().length);

  private _player = signal<Player | null>(null);
  public player = this._player.asReadonly();

  getPlayers() {
    this.http.get<Player[]>(`${this.apiBase()}/players`)
      .subscribe((response: Player[]) => {
        if (response && response.length > 0) {
          this._players.set(response);
        } else {
          this._players.set([]);
        }
      });
  }

  async getCurrentPosition() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this._player.update((curr: Player | null) => {
        if (!curr) return null; 
        return { ...curr, latitude: position.coords.latitude, longitude: position.coords.longitude } as Player;
      });
    } catch (error) {
      console.error('Error getting current position:', error);
      throw error;
    }
  }

  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 100,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });
      if (!image.dataUrl) throw new Error('No image data available');
      const path = `players/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const storageRef = ref(this.storage, path);
      await uploadString(storageRef, image.dataUrl, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);
      this._player.update((curr: Player | null) => {
        if (!curr) return null;
        return { ...curr, photo_url: downloadUrl } as Player;
      });
    } catch (error) {
      console.error('Error processing photo:', error);
      throw error;
    }
  }
}
