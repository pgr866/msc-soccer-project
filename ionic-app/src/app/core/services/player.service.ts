import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Player } from '@/app/core/models/player.model';
import { PlayerDetail } from '../models/comment.model';
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

    return this.http.get<Player[]>(`${this.apiBase()}/players`, { params }).pipe(
      tap((response: Player[]) => this._players.set(response || []))
    );
  }

  getPlayerDetail(id: string) {
    return this.http.get<PlayerDetail>(`${this.apiBase()}/players/${id}`);
  }

  deletePlayer(id: string) {
    return this.http.delete(`${this.apiBase()}/players/${id}`).pipe(
      tap((): void => {
        this._players.update((currentPlayers: Player[]): Player[] =>
          currentPlayers.filter((player: Player): boolean => player.id !== id)
        );
      })
    );
  }
}
