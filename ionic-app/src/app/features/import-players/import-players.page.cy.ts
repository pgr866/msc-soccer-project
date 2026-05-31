import { ImportPlayersPage } from './import-players.page';
import { PlayerService } from '@/app/core/services/player.service';
import { DeviceService } from '@/app/core/services/device.service';
import { ToastService } from '@/app/core/services/toast.service';
import { AlertService } from '@/app/core/services/alert.service';
import { AuthService } from '@/app/core/services/auth.service';
import { NavController } from '@ionic/angular';
import { of } from 'rxjs';

describe('ImportPlayersPage', () => {
    const mockResults = [
        { id: 1, name: 'Messi', photoUrl: '' },
        { id: 2, name: 'Ronaldo', photoUrl: '' }
    ];

    it('debería actualizar selectedIds al hacer clic en un ítem', () => {
        cy.mount(ImportPlayersPage, {
            providers: [
                { provide: PlayerService, useValue: { searchExternalPlayers: () => of(mockResults) } },
                { provide: DeviceService, useValue: {} },
                { provide: ToastService, useValue: {} },
                { provide: AlertService, useValue: {} },
                { provide: NavController, useValue: {} },
                { provide: AuthService, useValue: { currentUser: () => null } }
            ]
        }).then(({ component, fixture }) => {
            component.searchImportResults = mockResults;
            fixture.detectChanges();
            component.toggleSelectedId(1, true);
            cy.wrap(component.selectedIds).should('contain', 1);
        });
    });

    it('debería importar jugadores con la ubicación actual', () => {
        const importStub = cy.stub().returns(of(true));
        const deviceStub = cy.stub().resolves({ lat: 10, lng: 20 });

        cy.mount(ImportPlayersPage, {
            providers: [
                { provide: PlayerService, useValue: { importPlayers: importStub } },
                { provide: DeviceService, useValue: { getCurrentPosition: deviceStub } },
                { provide: ToastService, useValue: { showToast: cy.stub() } },
                { provide: AlertService, useValue: { showConfirmation: cy.stub().resolves(true) } },
                { provide: NavController, useValue: { back: cy.stub() } },
                { provide: AuthService, useValue: { currentUser: () => null } }
            ]
        }).then(({ component }) => {
            component.selectedIds = [1, 2];
        });

        cy.get('ion-button').contains('Importar 2 seleccionados').click({ force: true });
        cy.wrap(importStub).should('have.been.calledWith', [1, 2], 10, 20);
    });
});
