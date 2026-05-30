import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { Player } from '@/app/core/models/player.model';
import { BackendConfigService } from './backend-config.service';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private http = inject(HttpClient);
  private config = inject(BackendConfigService);
  private apiBase = computed(() => this.config.getBaseApi('player'));

  private _players = signal<Player[]>([]);
  public players = this._players.asReadonly();

  getPlayers(query?: string, dateStart?: string, dateEnd?: string) {
    let params = new HttpParams();
    if (query) params = params.set('query', query);
    if (dateStart) params = params.set('dateStart', dateStart);
    if (dateEnd) params = params.set('dateEnd', dateEnd);
    this.http.get<Player[]>(`${this.apiBase()}/players`, { params })
      .subscribe((response) => this._players.set(response || []));
  }
}
