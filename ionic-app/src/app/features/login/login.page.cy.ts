import { LoginPage } from './login.page';
import { AuthService } from '@/app/core/services/auth.service';
import { ToastService } from '@/app/core/services/toast.service';
import { LoadingController } from '@ionic/angular';
import { provideRouter } from '@angular/router';

describe('LoginPage', () => {

    it('debería mostrar errores de validación', () => {
        cy.mount(LoginPage, {
            providers: [
                { provide: AuthService, useValue: { currentUser: () => null } },
                { provide: ToastService, useValue: { showToast: cy.stub() } },
                { provide: LoadingController, useValue: {} },
                provideRouter([])
            ]
        });

        cy.get('ion-input[formControlName="email"] input').type('correo-invalido', { force: true });
        cy.get('ion-input[formControlName="email"] input').blur();
        cy.contains('Ingresa un correo válido').should('be.visible');
    });

    it('debería ejecutar el flujo de login correctamente', () => {
        const loginStub = cy.stub().resolves();
        const loadingMock = { create: cy.stub().resolves({ present: cy.stub(), dismiss: cy.stub() }) };

        cy.mount(LoginPage, {
            providers: [
                { provide: AuthService, useValue: { login: loginStub, currentUser: () => null } },
                { provide: ToastService, useValue: { showToast: cy.stub() } },
                { provide: LoadingController, useValue: loadingMock },
                provideRouter([])
            ]
        });

        cy.get('ion-input[formControlName="email"] input').type('test@test.com', { force: true });
        cy.get('ion-input[formControlName="password"] input').type('123456', { force: true });

        cy.get('ion-button[type="submit"]').click({ force: true });

        cy.wrap(loginStub).should('have.been.calledWith', 'test@test.com', '123456');
    });
});
