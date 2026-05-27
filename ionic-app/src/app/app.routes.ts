import { Routes } from '@angular/router';
import { authGuard } from '@/app/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/signup/signup.page').then( m => m.SignupPage)
  },
  {
    path: 'players',
    loadComponent: () => import('./features/players/players.page').then( m => m.PlayersPage),
    canActivate: [authGuard],
    data: { role: 'ADMIN' }
  },
];
