describe('Gestión de Comentarios (CRUD)', () => {
    const adminUser = {
        email: `admin@example.com`,
        password: '123456'
    };
    const playerName = `Jugador Test-${Date.now()}`;
    const updatedPlayerName = `Jugador Actualizado-${Date.now()}`;
    const commentText = `Test de comentario automático ${Date.now()}`;

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

        // Crear un jugador para comentar
        cy.visit('/create-player');
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
        cy.contains(playerName, { timeout: 10000 }).should('be.visible').click();
    });

    it('debería crear, visualizar y eliminar un comentario', () => {
        // 1. CREATE: Escribir comentario y puntuar
        cy.window().then((win) => {
            cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success) => {
                success({
                    coords: {
                        latitude: 36.7212, // Latitud de prueba
                        longitude: -4.4214, // Longitud de prueba
                        accuracy: 100,
                        altitude: null,
                        altitudeAccuracy: null,
                        heading: null,
                        speed: null,
                    },
                    timestamp: Date.now(),
                });
            });
        });
        cy.get('ion-textarea').type(commentText);
        cy.get('ion-icon[name*="star"]').eq(4).click();
        cy.get('ion-button:has(ion-icon[name="send"])').click();

        // 2. READ: Comprobar que aparece en la lista
        cy.contains('p', commentText).should('be.visible');

        // 3. DELETE: Borrar el comentario específico
        cy.contains('p', commentText)
            .closest('ion-item')
            .find('ion-button[color="danger"]')
            .click();
        cy.get('ion-alert', { timeout: 10000 })
            .should('be.visible')
            .find('button')
            .contains('Confirmar')
            .click({ force: true });

        // 4. VERIFY: Comprobar que ha desaparecido
        cy.contains('p', commentText).should('not.exist');
    });
});
