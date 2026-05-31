import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, computed } from '@angular/core';
import { BackendConfigService } from './backend-config.service';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private http = inject(HttpClient);
  private config = inject(BackendConfigService);

  private apiBase = computed(() => this.config.getBaseApi('player'));

  sendNews(news: { title: string, player: string, description: string, labels: string }) {
    const params = new HttpParams()
      .set('title', news.title)
      .set('player', news.player)
      .set('description', news.description)
      .set('labels', news.labels);

    return this.http.post(`${this.apiBase()}/corba/send`, null, { params });
  }

  readNews() {
    return this.http.post(`${this.apiBase()}/corba/read`, null);
  }

  receiveNews() {
    return this.http.post(`${this.apiBase()}/corba/receive`, null);
  }

  setLimit(limit: number) {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.post(`${this.apiBase()}/corba/limit`, null, { params });
  }
}
