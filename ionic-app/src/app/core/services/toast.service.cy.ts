import { ToastService } from './toast.service';
import { ToastController } from '@ionic/angular/standalone';
import { TestBed } from '@angular/core/testing';

describe('ToastService', () => {
    let service: ToastService;
    let toastCtrlStub: any;
    let toastStub: any;

    beforeEach(() => {
        toastStub = {
            present: cy.stub().resolves()
        };

        toastCtrlStub = {
            create: cy.stub().resolves(toastStub)
        };

        TestBed.configureTestingModule({
            providers: [
                ToastService,
                { provide: ToastController, useValue: toastCtrlStub }
            ]
        });

        service = TestBed.inject(ToastService);
    });

    it('debería mostrar un toast de tipo success', async () => {
        await service.showToast('Operación exitosa', 'success');

        expect(toastCtrlStub.create).to.have.been.calledWith(Cypress.sinon.match({
            message: 'Operación exitosa',
            color: 'success'
        }));

        expect(toastStub.present).to.have.been.called;
    });

    it('debería mostrar un toast de tipo error', async () => {
        await service.showToast('Hubo un error', 'error');

        expect(toastCtrlStub.create).to.have.been.calledWith(Cypress.sinon.match({
            message: 'Hubo un error',
            color: 'danger'
        }));
    });
});
