import { HomePage } from './home.page';
import { provideRouter } from '@angular/router';
import { NavController } from '@ionic/angular';

describe('HomePage (Component Testing)', () => {
  beforeEach(() => {
    // Create the stubs inside the beforeEach block
    const navCtrlSpy = {
      navigateForward: cy.stub().as('navForward'),
      navigateRoot: cy.stub().as('navRoot'),
    };

    cy.mount(HomePage, {
      providers: [
        provideRouter([]),
        { provide: NavController, useValue: navCtrlSpy }
      ],
    });
  });

  it('should render the 4 buttons correctly', () => {
    cy.get('ion-button').should('have.length', 4);
    cy.contains('Go to Login with routerLink').should('be.visible');
  });

  it('should trigger navigateForward when the button is clicked', () => {
    cy.contains('Go to Login with navigateForward').click({ force: true });
    
    // Check that the stub was called
    cy.get('@navForward').should('have.been.calledWith', '/login');
  });

  it('should trigger navigateRoot when the button is clicked', () => {
    cy.contains('Go to Login with navigateRoot').click({ force: true });
    
    // Check that the stub was called
    cy.get('@navRoot').should('have.been.calledWith', '/login');
  });
});
