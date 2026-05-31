import { HttpClient } from '@angular/common/http';
import { inject, Injectable, computed, signal } from '@angular/core';
import { BackendConfigService } from './backend-config.service';
import { DreamTeam } from '@/app/core/models/dream-team-model';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DreamTeamService {
  private http = inject(HttpClient);
  private config = inject(BackendConfigService);
  private apiBase = computed(() => this.config.getBaseApi('dream-team'));

  private _dreamTeams = signal<DreamTeam[]>([]);
  public dreamTeams = this._dreamTeams.asReadonly();

  getDreamTeams() {
    return this.http.get<DreamTeam[]>(`${this.apiBase()}/dream-teams`).pipe(
      tap((teams: DreamTeam[]) => this._dreamTeams.set(teams))
    );
  }

  generateDreamTeam() {
    return this.http.post<DreamTeam>(`${this.apiBase()}/dream-teams`, {}).pipe(
      tap((newTeam: DreamTeam) => {
        this._dreamTeams.update((teams: DreamTeam[]) => [newTeam, ...teams]);
      })
    );
  }
}
