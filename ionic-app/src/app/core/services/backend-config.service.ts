import { Injectable, signal, computed } from '@angular/core';
import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class BackendConfigService {
  private _isSpringMode = signal<boolean>(localStorage.getItem('isSpringMode') === 'true');
  public isSpringMode = this._isSpringMode.asReadonly();

  public getBaseApi(service: 'player' | 'comment' | 'dream-team'): string {
    const isSpring = this._isSpringMode();
    const baseUrl = isSpring ? environment.springApiUrl : environment.nodeApiUrl;
    const prefix = isSpring ? `/${service}-service` : '';
    return `${baseUrl}${prefix}/api`;
  }

  toggleBackend() {
    this._isSpringMode.update((v: boolean) => {
      const newValue = !v;
      localStorage.setItem('isSpringMode', String(newValue));
      return newValue;
    });
  }
}