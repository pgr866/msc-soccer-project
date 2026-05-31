import { CreatePlayerPage } from './create-player.page';
import { PlayerService } from '@/app/core/services/player.service';
import { DeviceService } from '@/app/core/services/device.service';
import { ToastService } from '@/app/core/services/toast.service';
import { AlertService } from '@/app/core/services/alert.service';
import { AuthService } from '@/app/core/services/auth.service';
import { NavController } from '@ionic/angular';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('CreatePlayerPage', () => {
    const mockLocation = { lat: 40.0, lng: -3.0 };

    beforeEach(() => {
        (window as any).google = { maps: { Map: cy.stub() } };
    });

    it('debería inicializar el formulario con ubicación actual', () => {
        const deviceStub = cy.stub().resolves(mockLocation);

        cy.mount(CreatePlayerPage, {
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: PlayerService, useValue: {} },
                { provide: DeviceService, useValue: { getCurrentPosition: deviceStub } },
                { provide: ToastService, useValue: {} },
                { provide: AlertService, useValue: {} },
                { provide: NavController, useValue: {} },
                { provide: AuthService, useValue: { currentUser: () => null } }
            ]
        }).then(({ component, fixture }) => {
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                cy.wrap(component.playerForm.get('latitude')?.value).should('eq', mockLocation.lat);
            });
        });
    });

    it('debería crear un jugador correctamente', () => {
        const createStub = cy.stub().returns(of(true));

        cy.mount(CreatePlayerPage, {
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: PlayerService, useValue: { createPlayer: createStub } },
                { provide: DeviceService, useValue: { getCurrentPosition: cy.stub().resolves(mockLocation) } },
                { provide: ToastService, useValue: { showToast: cy.stub() } },
                { provide: AlertService, useValue: { showConfirmation: cy.stub().resolves(true) } },
                { provide: NavController, useValue: { back: cy.stub() } },
                { provide: AuthService, useValue: { currentUser: () => null } }
            ]
        }).then(({ component, fixture }) => {
            component.playerForm.patchValue({
                name: 'Nuevo Jugador',
                latitude: 40.0,
                longitude: -3.0
            });
            fixture.detectChanges();

            component.createPlayer().then(() => {
                cy.wrap(createStub).should('have.been.called');
            });
        });
    });
});
