import { EditPlayerPage } from './edit-player.page';
import { PlayerService } from '@/app/core/services/player.service';
import { DeviceService } from '@/app/core/services/device.service';
import { ToastService } from '@/app/core/services/toast.service';
import { AlertService } from '@/app/core/services/alert.service';
import { AuthService } from '@/app/core/services/auth.service';
import { NavController } from '@ionic/angular';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EditPlayerPage', () => {
    const mockPlayerData = {
        player: {
            id: '1',
            name: 'Kylian Mbappé',
            latitude: 48.8566,
            longitude: 2.3522
        }
    };

    beforeEach(() => {
        (window as any).google = { maps: { Map: cy.stub() } };
    });

    it('debería cargar los datos del jugador en el formulario', () => {
        cy.mount(EditPlayerPage, {
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: PlayerService, useValue: { getPlayerDetail: () => of(mockPlayerData) } },
                { provide: DeviceService, useValue: {} },
                { provide: ToastService, useValue: {} },
                { provide: AlertService, useValue: {} },
                { provide: NavController, useValue: {} },
                { provide: AuthService, useValue: { currentUser: () => null } }
            ]
        });

        cy.get('ion-input[formControlName="name"] input').should('have.value', 'Kylian Mbappé');
    });

    it('debería ejecutar la actualización al pulsar guardar', () => {
        const updateStub = cy.stub().returns(of(true));

        cy.mount(EditPlayerPage, {
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: PlayerService, useValue: {
                        getPlayerDetail: () => of(mockPlayerData),
                        updatePlayer: updateStub
                    }
                },
                { provide: DeviceService, useValue: {} },
                { provide: ToastService, useValue: { showToast: cy.stub() } },
                { provide: AlertService, useValue: { showConfirmation: cy.stub().resolves(true) } },
                { provide: NavController, useValue: { back: cy.stub() } },
                { provide: AuthService, useValue: { currentUser: () => null } }
            ]
        }).then(({ component, fixture }) => {
            component.playerForm.patchValue({
                name: 'Kylian Mbappé',
                latitude: 1,
                longitude: 1
            });
            fixture.detectChanges();

            component.updatePlayer().then(() => {
                cy.wrap(updateStub).should('have.been.called');
            });
        });
    });
});
