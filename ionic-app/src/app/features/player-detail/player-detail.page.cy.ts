import { PlayerDetailPage } from './player-detail.page';
import { PlayerService } from '@/app/core/services/player.service';
import { CommentService } from '@/app/core/services/comment.service';
import { DeviceService } from '@/app/core/services/device.service';
import { AlertService } from '@/app/core/services/alert.service';
import { ToastService } from '@/app/core/services/toast.service';
import { AuthService } from '@/app/core/services/auth.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('PlayerDetailPage', () => {

    it('debería cargar y mostrar los detalles del jugador', () => {
        const mockPlayerDetail = {
            player: { id: '1', name: 'Messi', photoUrl: '', position: 'FW' },
            comments: []
        };

        cy.mount(PlayerDetailPage, {
            componentProperties: { playerId: '1' },
            providers: [
                {
                    provide: PlayerService, useValue: {
                        player: signal(mockPlayerDetail),
                        getPlayerDetail: () => of(mockPlayerDetail)
                    }
                },
                { provide: DeviceService, useValue: {} },
                { provide: AlertService, useValue: {} },
                { provide: ToastService, useValue: {} },
                { provide: CommentService, useValue: {} },
                { provide: AuthService, useValue: { currentUser: () => null } }
            ]
        });

        cy.contains('Messi').should('be.visible');
    });

    it('debería publicar un comentario y recargar el jugador', () => {
        const addCommentStub = cy.stub().returns(of(true));
        const getPlayerDetailStub = cy.stub().returns(of({ player: { id: '1' }, comments: [] }));

        cy.mount(PlayerDetailPage, {
            componentProperties: { playerId: '1' },
            providers: [
                {
                    provide: PlayerService, useValue: {
                        player: signal({ player: { id: '1' }, comments: [] }),
                        getPlayerDetail: getPlayerDetailStub
                    }
                },
                { provide: DeviceService, useValue: { getCurrentPosition: cy.stub().resolves({ lat: 0, lng: 0 }) } },
                { provide: AlertService, useValue: {} },
                { provide: ToastService, useValue: { showToast: cy.stub() } },
                { provide: CommentService, useValue: { addComment: addCommentStub } },
                { provide: AuthService, useValue: { currentUser: () => null } }
            ]
        });

        cy.get('ion-textarea textarea').type('Excelente jugador', { force: true });

        cy.get('ion-button ion-icon[name="send"]').parent().click({ force: true });

        cy.wrap(addCommentStub).should('have.been.called');
    });
});
