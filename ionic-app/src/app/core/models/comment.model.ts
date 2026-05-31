import { Player } from './player.model';

export interface Comment {
  id: string;
  userId: string | null;
  playerId: string;
  author: string;
  text: string;
  rating: number;
  createdAt: string;
  latitude: number;
  longitude: number;
}

export interface PlayerDetail {
  player: Player;
  comments: Comment[];
}

export interface CreateCommentDto {
  text: string;
  rating: number;
  latitude: number;
  longitude: number;
}
