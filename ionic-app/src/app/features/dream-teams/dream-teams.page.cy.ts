import { DreamTeamsPage } from './dream-teams.page';
import { DreamTeamService } from '@/app/core/services/dream-team.service';
import { ToastService } from '@/app/core/services/toast.service';
import { AuthService } from '@/app/core/services/auth.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('DreamTeamsPage', () => {
    const mockTeams = [{
        id: '1',
        name: 'Equipo Top',
        createdAt: new Date().toISOString(),
        players: [{ id: 'p1', name: 'Jugador 1' }]
    }];

    it('debería listar los equipos cargados desde el servicio', () => {
        const serviceMock = {
            dreamTeams: signal(mockTeams),
            getDreamTeams: cy.stub().returns(of([]))
        };

        cy.mount(DreamTeamsPage, {
            providers: [
                { provide: DreamTeamService, useValue: serviceMock },
                { provide: ToastService, useValue: {} },
                { provide: AuthService, useValue: { currentUser: () => null } }
            ]
        });

        cy.contains('Equipo Top').should('be.visible');
    });

    it('debería mostrar mensaje cuando no hay equipos', () => {
        const serviceMock = {
            dreamTeams: signal([]),
            getDreamTeams: cy.stub().returns(of([]))
        };

        cy.mount(DreamTeamsPage, {
            providers: [
                { provide: DreamTeamService, useValue: serviceMock },
                { provide: ToastService, useValue: {} },
                { provide: AuthService, useValue: { currentUser: () => null } }
            ]
        });

        cy.contains('Aún no hay equipos para mostrar').should('be.visible');
    });

    it('debería llamar a generar y mostrar toast al éxito', () => {
        const generateStub = cy.stub().returns(of(true));
        const toastStub = cy.stub();
        const serviceMock = {
            dreamTeams: signal([]),
            getDreamTeams: cy.stub().returns(of([])),
            generateDreamTeam: generateStub
        };

        cy.mount(DreamTeamsPage, {
            providers: [
                { provide: DreamTeamService, useValue: serviceMock },
                { provide: ToastService, useValue: { showToast: toastStub } },
                { provide: AuthService, useValue: { currentUser: () => null } }
            ]
        });

        cy.get('ion-button').contains('Generar Equipazo con IA').click({ force: true });

        cy.wrap(generateStub).should('have.been.called');
        cy.wrap(toastStub).should('have.been.calledWith', 'Equipazo generado correctamente', 'success');
    });
});
