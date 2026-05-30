import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { tap, switchMap } from 'rxjs';
import { Player } from '@/app/core/models/player.model';
import { PlayerDetail } from '@/app/core/models/comment.model';
import { BackendConfigService } from './backend-config.service';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private http = inject(HttpClient);
  private config = inject(BackendConfigService);
  private apiBase = computed(() => this.config.getBaseApi('player'));

  public searchQuery = signal<string>('');
  public startDate = signal<string | undefined>(undefined);
  public endDate = signal<string | undefined>(undefined);
  private _players = signal<Player[]>([]);
  public players = this._players.asReadonly();

  private _player = signal<PlayerDetail | null>(null);
  public player = this._player.asReadonly();

  private _searchImportResults = signal<Player[]>([]);
  public searchImportResults = this._searchImportResults.asReadonly();

  private _selectedIds = signal<number[]>([]);
  public selectedIds = this._selectedIds.asReadonly();

  getPlayers() {
    let params = new HttpParams();
    if (this.searchQuery()) params = params.set('query', this.searchQuery());
    if (this.startDate()) params = params.set('dateStart', this.startDate() || '');
    if (this.endDate()) params = params.set('dateEnd', this.endDate() || '');
    return this.http.get<Player[]>(`${this.apiBase()}/players`, { params }).pipe(
      tap((response: Player[]) => this._players.set(response || []))
    );
  }

  getPlayerDetail(id: string) {
    return this.http.get<PlayerDetail>(`${this.apiBase()}/players/${id}`).pipe(
      tap((response: PlayerDetail) => this._player.set(response))
    );
  }

  createPlayer(playerData: Player) {
    return this.http.post<Player>(`${this.apiBase()}/players`, playerData).pipe(
      switchMap(() => this.getPlayers())
    );
  }

  deletePlayer(id: string) {
    return this.http.delete(`${this.apiBase()}/players/${id}`).pipe(
      tap((): void => {
        this._players.update((currentPlayers: Player[]): Player[] =>
          currentPlayers.filter((player: Player): boolean => player.id !== id)
        );
        this._player.set(null);
      })
    );
  }

  searchExternalPlayers(query: string) {
    return this.http.get<Player[]>(`${this.apiBase()}/players/search`, {
      params: new HttpParams().set('query', query)
    }).pipe(
      tap((results: Player[]) => this._searchImportResults.set(results))
    );
  }

  importPlayers(selectedIds: number[], lat: number, lng: number) {
    return this.http.post<Player[]>(`${this.apiBase()}/players/import`, {
      playerIds: selectedIds, latitude: lat, longitude: lng
    }).pipe(
      switchMap(() => this.getPlayers())
    );
  }
}
