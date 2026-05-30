import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '@/app/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      // {
      //   path: 'news',
      //   loadComponent: () =>
      //     import('../news/news.page').then((m) => m.NewsPage),
      //   canActivate: [authGuard],
      // },
      {
        path: 'players',
        loadComponent: () =>
          import('../players/players.page').then((m) => m.PlayersPage),
      },
      // {
      //   path: 'dream-team',
      //   loadComponent: () =>
      //     import('../dream-team/dream-team.page').then((m) => m.DreamTeamPage),
      //   canActivate: [authGuard],
      // },
    ],
  },
  {
    path: '',
    redirectTo: '/players',
    pathMatch: 'full',
  },
];
