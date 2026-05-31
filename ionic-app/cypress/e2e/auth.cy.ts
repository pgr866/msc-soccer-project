describe('Flujo de Registro y Login', () => {
    const newUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'password123'
    };

    before(() => {
        cy.visit('/login');
        cy.wait(2000);
        cy.url().then((url) => {
            if (url.includes('/players')) {
                cy.log('Ya estábamos autenticados, deslogueandose.');
                cy.get('ion-header:visible', { timeout: 10000 })
                    .find('ion-button')
                    .find('ion-icon[name="log-out-outline"]')
                    .parent('ion-button')
                    .click();
            } else {
                cy.log('Estamos deslogueados, pasamos al test.');
            }
        });
    });

    it('debería registrarse y luego desloguearse', () => {
        cy.visit('/signup');
        cy.get('ion-input[formControlName="email"] input').filter(':visible').first().type(newUser.email);
        cy.get('ion-input[formControlName="password"] input').filter(':visible').first().type(newUser.password);
        cy.get('ion-input[formControlName="repeat_password"] input').filter(':visible').first().type(newUser.password);
        cy.get('ion-button').contains('Registrarse').click();
        cy.url({ timeout: 10000 }).should('include', '/players');
        cy.get('ion-header:visible', { timeout: 10000 })
            .find('ion-button')
            .find('ion-icon[name="log-out-outline"]')
            .parent('ion-button')
            .click();
    });

    it('debería hacer login de forma exitosa y desloguearse', () => {
        cy.visit('/login');
        cy.get('input[type="email"]', { timeout: 10000 }).type(newUser.email);
        cy.get('input[type="password"]').type(newUser.password);
        cy.get('ion-button[type="submit"]').filter(':visible').first().click();
        cy.url({ timeout: 10000 }).should('include', '/players');
        cy.get('ion-header', { timeout: 15000 })
            .find('ion-icon[name="log-out-outline"]')
            .should('be.visible')
            .parent('ion-button')
            .click();
    });

    it('debería fallar al registrarse con un email ya existente', () => {
        cy.visit('/signup');
        cy.get('ion-input[formControlName="email"] input').filter(':visible').first().type(newUser.email);
        cy.get('ion-input[formControlName="password"] input').filter(':visible').first().type(newUser.password);
        cy.get('ion-input[formControlName="repeat_password"] input').filter(':visible').first().type(newUser.password);
        cy.get('ion-button[type="submit"]').filter(':visible').first().click();
        cy.url().should('not.include', '/players');
        cy.url().should('include', '/signup');
    });

    it('debería fallar al hacer login con un usuario inexistente', () => {
        cy.visit('/login');
        cy.get('input[type="email"]', { timeout: 10000 }).type('no-existo@test.com');
        cy.get('input[type="password"]').type('password123');
        cy.get('ion-button[type="submit"]').filter(':visible').first().click();
        cy.url().should('not.include', '/players');
        cy.url().should('include', '/login');
    });
});
