import { GenericHeaderComponent } from './generic-header.component';
import { AuthService } from '@/app/core/services/auth.service';
import { BackendConfigService } from '@/app/core/services/backend-config.service';

describe('GenericHeaderComponent', () => {
  it('debería renderizar y mostrar el título correctamente', () => {
    cy.mount(GenericHeaderComponent, {
      componentProperties: {
        title: 'Mi Título de Prueba',
        favIcon: true
      },
      providers: [
        {
          provide: AuthService,
          useValue: {
            currentUser: () => null,
            logout: () => { }
          }
        },
        {
          provide: BackendConfigService,
          useValue: {
            isSpringMode: () => false,
            toggleBackend: () => { }
          }
        }
      ]
    });

    cy.get('ion-title').should('contain', 'Mi Título de Prueba');
    cy.get('ion-toggle').should('exist');
  });

  it('debería mostrar el botón de Iniciar Sesión cuando no hay usuario', () => {
    cy.mount(GenericHeaderComponent, {
      providers: [
        { provide: AuthService, useValue: { currentUser: () => null } },
        { provide: BackendConfigService, useValue: { isSpringMode: () => false } }
      ]
    });
    cy.get('ion-button').contains('Iniciar Sesión').should('be.visible');
  });

  it('debería mostrar el botón de Logout cuando SÍ hay usuario', () => {
    cy.mount(GenericHeaderComponent, {
      providers: [
        {
          provide: AuthService,
          useValue: {
            currentUser: () => ({ role: 'ADMIN' }),
            logout: cy.stub().as('logoutStub')
          }
        },
        { provide: BackendConfigService, useValue: { isSpringMode: () => false } }
      ]
    });

    cy.get('ion-button').contains('Iniciar Sesión').should('not.exist');
    cy.get('ion-button:has(ion-icon[name="log-out-outline"])').click();
    cy.get('@logoutStub').should('have.been.called');
  });
});
