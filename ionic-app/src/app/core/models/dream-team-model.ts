export interface PlayerName {
  id: string;
  name: string;
}

export interface DreamTeam {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  players: PlayerName[];
}
