import { SignupPage } from './signup.page';
import { AuthService } from '@/app/core/services/auth.service';
import { ToastService } from '@/app/core/services/toast.service';
import { LoadingController } from '@ionic/angular';

describe('SignupPage', () => {

    it('debería validar que las contraseñas coinciden', () => {
        const authMock = { signup: cy.stub(), currentUser: () => null };
        const toastMock = { showToast: cy.stub() };
        const loadingMock = { create: cy.stub().resolves({ present: cy.stub(), dismiss: cy.stub() }) };

        cy.mount(SignupPage, {
            providers: [
                { provide: AuthService, useValue: authMock },
                { provide: ToastService, useValue: toastMock },
                { provide: LoadingController, useValue: loadingMock }
            ]
        });

        cy.get('ion-input[formControlName="email"] input').type('test@test.com', { force: true });
        cy.get('ion-input[formControlName="password"] input').type('123456', { force: true });
        cy.get('ion-input[formControlName="repeat_password"] input').type('diferente', { force: true });
        cy.get('ion-input[formControlName="repeat_password"] input').blur();

        cy.contains('Las contraseñas no coinciden').should('be.visible');

        cy.get('ion-button[type="submit"]').should('have.class', 'button-disabled');
    });

    it('debería llamar a signup y navegar al éxito', () => {
        const authMock = { signup: cy.stub().resolves(), currentUser: () => null };
        const toastMock = { showToast: cy.stub() };
        const loadingMock = { create: cy.stub().resolves({ present: cy.stub(), dismiss: cy.stub() }) };

        cy.mount(SignupPage, {
            providers: [
                { provide: AuthService, useValue: authMock },
                { provide: ToastService, useValue: toastMock },
                { provide: LoadingController, useValue: loadingMock }
            ]
        });

        cy.get('ion-input[formControlName="email"] input').type('test@test.com', { force: true });
        cy.get('ion-input[formControlName="password"] input').type('123456', { force: true });
        cy.get('ion-input[formControlName="repeat_password"] input').type('123456', { force: true });

        cy.get('ion-button[type="submit"]').click({ force: true });

        cy.wrap(authMock.signup).should('have.been.called');
        cy.wrap(toastMock.showToast).should('have.been.calledWith', 'Cuenta creada con éxito.', 'success');
    });
});
