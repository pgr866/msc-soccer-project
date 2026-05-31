import { PlayersPage } from './players.page';
import { PlayerService } from '@/app/core/services/player.service';
import { ToastService } from '@/app/core/services/toast.service';
import { AuthService } from '@/app/core/services/auth.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('PlayersPage', () => {

    it('debería renderizar la lista de jugadores correctamente', () => {
        const mockPlayers = [{ id: 1, name: 'Jugador 1', team: 'Equipo A' }];
        const playerServiceMock = {
            players: signal(mockPlayers),
            searchQuery: signal(''),
            startDate: signal(undefined),
            endDate: signal(undefined),
            getPlayers: () => of(mockPlayers)
        };

        cy.mount(PlayersPage, {
            providers: [
                { provide: PlayerService, useValue: playerServiceMock },
                { provide: AuthService, useValue: { currentUser: () => ({ role: 'ADMIN' }) } },
                { provide: ToastService, useValue: { showToast: cy.stub() } }
            ]
        });

        cy.get('ion-item').should('contain', 'Jugador 1');
    });

    it('debería mostrar mensaje de lista vacía', () => {
        const playerServiceMock = {
            players: signal([]),
            searchQuery: signal(''),
            startDate: signal(undefined),
            endDate: signal(undefined),
            getPlayers: () => of([])
        };

        cy.mount(PlayersPage, {
            providers: [
                { provide: PlayerService, useValue: playerServiceMock },
                { provide: AuthService, useValue: { currentUser: () => null } },
                { provide: ToastService, useValue: { showToast: cy.stub() } }
            ]
        });

        cy.contains('Aún no hay jugadores para mostrar.').should('be.visible');
    });

    it('debería llamar a loadPlayers al escribir en el buscador', () => {
        const getPlayersStub = cy.stub().returns(of([]));
        const playerServiceMock = {
            players: signal([]),
            searchQuery: signal(''),
            startDate: signal(undefined),
            endDate: signal(undefined),
            getPlayers: getPlayersStub
        };

        cy.mount(PlayersPage, {
            providers: [
                { provide: PlayerService, useValue: playerServiceMock },
                { provide: AuthService, useValue: { currentUser: () => null } },
                { provide: ToastService, useValue: { showToast: cy.stub() } }
            ]
        });

        cy.get('ion-searchbar input').type('Nuevo Jugador{enter}', { force: true });
        cy.wrap(getPlayersStub).should('have.been.called');
    });
});
