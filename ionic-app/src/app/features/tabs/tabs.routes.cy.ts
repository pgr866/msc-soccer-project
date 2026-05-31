import { TabsPage } from './tabs.page';
import { AuthService } from '@/app/core/services/auth.service';
import { provideRouter, Router } from '@angular/router';
import { getTestBed } from '@angular/core/testing';

describe('TabsPage', () => {
    it('debería seleccionar el tab correspondiente al cambiar la ruta', () => {
        cy.mount(TabsPage, {
            providers: [
                {
                    provide: AuthService,
                    useValue: { currentUser: () => ({ email: 'test@test.com' }) }
                },
                provideRouter([
                    { path: 'news', component: { template: '' } as any },
                    { path: 'players', component: { template: '' } as any }
                ])
            ]
        }).then((wrapper) => {
            const router = getTestBed().inject(Router);

            router.navigate(['/news']).then(() => {
                cy.get('ion-tab-button[tab="news"]').should('have.attr', 'aria-selected', 'true');
            });

            router.navigate(['/players']).then(() => {
                cy.get('ion-tab-button[tab="players"]').should('have.attr', 'aria-selected', 'true');
            });
        });
    });
});
