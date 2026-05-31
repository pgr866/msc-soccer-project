import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

describe('AuthService', () => {
    let service: AuthService;
    let authMock: any;
    let dbMock: any;

    beforeEach(() => {
        authMock = { currentUser: { getIdToken: cy.stub().resolves('fake-token') } };
        dbMock = {};

        TestBed.configureTestingModule({
            providers: [
                AuthService,
                { provide: Auth, useValue: authMock },
                { provide: Firestore, useValue: dbMock }
            ]
        });
        service = TestBed.inject(AuthService);
    });

    it('debería instanciarse correctamente', () => {
        expect(service).to.not.be.undefined;
    });

    it('debería retornar un token al llamar a getToken', async () => {
        const token = await service.getToken();
        expect(token).to.equal('fake-token');
        expect(authMock.currentUser.getIdToken).to.have.been.called;
    });

    it('debería lanzar error si las contraseñas no coinciden en signup', async () => {
        try {
            await service.signup('test@test.com', '123', '456');
            expect(true).to.be.false;
        } catch (e: any) {
            expect(e.message).to.equal('Las contraseñas no coinciden.');
        }
    });
});
