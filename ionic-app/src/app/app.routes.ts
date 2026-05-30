import { Routes } from '@angular/router';
import { authGuard } from '@/app/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/signup/signup.page').then((m) => m.SignupPage),
  },
  {
    path: 'player-detail/:playerId',
    loadComponent: () =>
      import('./features/player-detail/player-detail.page').then((m) => m.PlayerDetailPage),
  },
  {
    path: 'import-players',
    loadComponent: () =>
      import('./features/import-players/import-players.page').then((m) => m.ImportPlayersPage),
    canActivate: [authGuard],
    // data: { role: 'ADMIN' }
  },
  {
    path: 'create-player',
    loadComponent: () =>
      import('./features/create-player/create-player.page').then((m) => m.CreatePlayerPage),
    canActivate: [authGuard],
  },
];
