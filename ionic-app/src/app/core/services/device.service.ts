import { inject, Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';

@Injectable({ providedIn: 'root' })
export class DeviceService {
    private storage = inject(Storage);

    async getCurrentPosition() {
        const position = await Geolocation.getCurrentPosition();
        return {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
    }

    async takeAndUploadPhoto() {
        const image = await Camera.getPhoto({
            quality: 100,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Prompt
        });
        if (!image.dataUrl) throw new Error('No image data available');
        const path = `players/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const storageRef = ref(this.storage, path);
        await uploadString(storageRef, image.dataUrl, 'data_url');
        return await getDownloadURL(storageRef);
    }
}
