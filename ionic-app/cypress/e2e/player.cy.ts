describe('Gestión de Jugadores (CRUD)', () => {
    const adminUser = {
        email: `admin@example.com`,
        password: '123456'
    };
    const playerName = `Jugador Test-${Date.now()}`;
    const updatedPlayerName = `Jugador Actualizado-${Date.now()}`;

    before(() => {
        cy.visit('/login');
        cy.wait(2000); 
        cy.url().then((url) => {
            if (url.includes('/players')) {
                cy.log('Ya estábamos autenticados, saltando al test.');
            } else {
                cy.log('Estamos en login, procediendo a autenticar.');
                cy.get('app-login:not(.ion-page-hidden)', { timeout: 10000 }).should('be.visible');
                cy.get('input[type="email"]').type(adminUser.email);
                cy.get('input[type="password"]').type(adminUser.password);
                cy.get('ion-button[type="submit"]').click();
                cy.wait(2000); 
                cy.url({ timeout: 15000 }).should('include', '/players');
            }
        });
    });

    it('debería crear un jugador', () => {
        cy.visit('/players');
        cy.get('ion-fab-button').first().should('be.visible').click();
        cy.get('ion-fab-button[routerLink="/create-player"]').click();
        cy.url().should('include', '/create-player');
        cy.get('ion-input[formControlName="name"]')
            .find('input')
            .clear({ force: true })
            .type(playerName, { force: true });
        cy.get('ion-button[type="submit"]').click();
        cy.get('ion-alert', { timeout: 10000 })
            .should('be.visible')
            .find('button')
            .contains('Confirmar')
            .click({ force: true });
        cy.url({ timeout: 15000 }).should('include', '/players');
    });

    it('debería buscar un jugador', () => {
        cy.visit('/players');
        cy.get('ion-searchbar')
            .find('input')
            .clear({ force: true })
            .type(playerName, { force: true });
        cy.contains(playerName, { timeout: 10000 }).should('be.visible')
    });

    it('debería actualizar un jugador', () => {
        cy.visit('/players');
        cy.contains(playerName, { timeout: 10000 }).should('be.visible').click();
        cy.get('ion-button[color="warning"]').should('be.visible').click();
        cy.url().should('include', '/edit-player');
        cy.get('ion-input[formControlName="name"]')
            .find('input')
            .clear({ force: true })
            .type(updatedPlayerName, { force: true });
        cy.get('ion-button[type="submit"]').contains('Guardar Cambios').click({ force: true });
        cy.get('ion-alert', { timeout: 10000 })
            .should('be.visible')
            .find('button')
            .contains('Confirmar')
            .click({ force: true });
        cy.contains(updatedPlayerName, { timeout: 10000 }).should('be.visible');
        cy.visit('/players');
        cy.get('ion-searchbar')
            .find('input')
            .clear({ force: true })
            .type(updatedPlayerName, { force: true });
        cy.contains(updatedPlayerName, { timeout: 10000 }).should('be.visible')
    });

    it('debería eliminar un jugador', () => {
        cy.visit('/players');
        cy.contains(updatedPlayerName, { timeout: 10000 }).should('be.visible').click();
        cy.get('ion-button[color="danger"]').should('be.visible').click();
        cy.get('ion-alert', { timeout: 10000 })
            .should('be.visible')
            .find('button')
            .contains('Confirmar')
            .click({ force: true });
        cy.url({ timeout: 15000 }).should('include', '/players');
        cy.get('ion-searchbar').find('input').clear({ force: true });
        cy.contains(updatedPlayerName, { timeout: 10000 }).should('not.exist');
    });
});
