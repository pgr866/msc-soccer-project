describe('Home Page Navigation (E2E)', () => {

  beforeEach(() => {
    // Navigate to the home page before each test
    cy.visit('/home');
  });

  it('should navigate to /login when clicking the routerLink button', () => {
    // Click the button using the routerLink
    cy.contains('Go to Login with routerLink').click();

    // Verify the URL changed
    cy.url().should('include', '/login');
  });

  it('should navigate to /login when clicking the navigateForward button', () => {
    // Click the button using NavController navigateForward
    cy.contains('Go to Login with navigateForward').click();

    // Verify the URL changed
    cy.url().should('include', '/login');
  });

  it('should navigate to /login when clicking the processAndNavigate button', () => {
    // Click the button using Router navigate
    cy.contains('Go to Login with navigate').click();

    // Verify the URL changed
    cy.url().should('include', '/login');
  });

  it('should navigate to /login when clicking the navigateRoot button', () => {
    // Click the button using NavController navigateRoot
    cy.contains('Go to Login with navigateRoot').click();

    // Verify the URL changed
    cy.url().should('include', '/login');
  });
});
