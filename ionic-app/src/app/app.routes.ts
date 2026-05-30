import { Routes } from '@angular/router';
import { authGuard } from '@/app/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'players',
    pathMatch: 'full',
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
    path: 'players',
    loadComponent: () =>
      import('./features/players/players.page').then((m) => m.PlayersPage),
  },
  {
    path: 'player-detail/:id',
    loadComponent: () =>
      import('./features/player-detail/player-detail.page').then(
        (m) => m.PlayerDetailPage
      ),
  },
];

// Rutas protegidas con guardias de autenticación y roles (ejemplo)
// canActivate: [authGuard],
// data: { role: 'ADMIN' }