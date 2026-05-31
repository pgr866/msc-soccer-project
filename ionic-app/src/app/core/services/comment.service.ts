import { HttpClient } from '@angular/common/http';
import { inject, Injectable, computed } from '@angular/core';
import { BackendConfigService } from './backend-config.service';
import { CommentRequest } from '../models/comment-request';

@Injectable({ providedIn: 'root' })
export class CommentService {
    private http = inject(HttpClient);
    private config = inject(BackendConfigService);
    private apiBase = computed(() => this.config.getBaseApi('comment'));

    addComment(id: string, comment: CommentRequest) {
        return this.http.post(`${this.apiBase()}/comments/player/${id}`, comment);
    }

    deleteComment(commentId: string) {
        return this.http.delete(`${this.apiBase()}/comments/${commentId}`);
    }
}
