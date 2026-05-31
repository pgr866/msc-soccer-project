import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';
import { AlertController } from '@ionic/angular';

describe('AlertService', () => {
    let service: AlertService;
    let alertCtrlMock: any;
    let alertElementMock: any;

    beforeEach(() => {
        alertElementMock = {
            present: cy.stub().resolves()
        };

        alertCtrlMock = {
            create: cy.stub().resolves(alertElementMock)
        };

        TestBed.configureTestingModule({
            providers: [
                AlertService,
                { provide: AlertController, useValue: alertCtrlMock }
            ]
        });
        service = TestBed.inject(AlertService);
    });

    it('debería retornar true al confirmar', async () => {
        const confirmationPromise = service.showConfirmation('Título', '¿Seguro?');

        const createCall = alertCtrlMock.create.firstCall.args[0];
        const confirmButton = createCall.buttons.find((b: any) => b.text === 'Confirmar');

        confirmButton.handler();

        const result = await confirmationPromise;
        expect(result).to.be.true;
    });

    it('debería retornar false al cancelar', async () => {
        const confirmationPromise = service.showConfirmation('Título', '¿Seguro?');

        const createCall = alertCtrlMock.create.firstCall.args[0];
        const cancelButton = createCall.buttons.find((b: any) => b.text === 'Cancelar');

        cancelButton.handler();

        const result = await confirmationPromise;
        expect(result).to.be.false;
    });
});
