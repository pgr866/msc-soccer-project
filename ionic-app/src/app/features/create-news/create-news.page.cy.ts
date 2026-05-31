import { CreateNewsPage } from './create-news.page';
import { NewsService } from '@/app/core/services/news.service';
import { ToastService } from '@/app/core/services/toast.service';
import { AuthService } from '@/app/core/services/auth.service';
import { of } from 'rxjs';

describe('CreateNewsPage', () => {
    it('debería deshabilitar la publicación si los campos no cumplen con las validaciones', () => {
        const newsServiceMock = { sendNews: cy.stub() };

        cy.mount(CreateNewsPage, {
            providers: [
                { provide: NewsService, useValue: newsServiceMock },
                { provide: ToastService, useValue: { showToast: cy.stub() } },
                { provide: AuthService, useValue: { currentUser: () => null } }
            ]
        });

        cy.get('ion-button').contains('Publicar noticia').click({ force: true });
        cy.wrap(newsServiceMock.sendNews).should('not.have.been.called');
    });

    it('debería enviar la noticia correctamente cuando el formulario es válido', () => {
        const sendNewsStub = cy.stub().returns(of({ message: 'Noticia publicada' }));
        const toastStub = cy.stub();

        cy.mount(CreateNewsPage, {
            providers: [
                { provide: NewsService, useValue: { sendNews: sendNewsStub } },
                { provide: ToastService, useValue: { showToast: toastStub } },
                { provide: AuthService, useValue: { currentUser: () => null } }
            ]
        }).then(({ component }) => {
            component.playerName = 'Mbappé';

            component.newsForm.patchValue({
                title: 'Noticia válida de 5 a 30',
                description: 'Esta descripción tiene más de 20 caracteres para cumplir la validación.',
                labels: '#test'
            });
        });

        cy.get('ion-button').contains('Publicar noticia').click({ force: true });

        cy.wrap(sendNewsStub).should('have.been.calledWith', {
            title: 'Noticia válida de 5 a 30',
            description: 'Esta descripción tiene más de 20 caracteres para cumplir la validación.',
            labels: '#test',
            player: 'Mbappé'
        });
    });

    it('debería actualizar el límite de noticias', () => {
        const setLimitStub = cy.stub().returns(of({ message: 'Límite actualizado' }));

        cy.mount(CreateNewsPage, {
            providers: [
                { provide: NewsService, useValue: { setLimit: setLimitStub } },
                { provide: ToastService, useValue: { showToast: cy.stub() } },
                { provide: AuthService, useValue: { currentUser: () => null } }
            ]
        }).then(({ component }) => {
            component.newsForm.patchValue({ limit: 10 });
        });

        cy.get('ion-button').contains('Limitar').click({ force: true });
        cy.wrap(setLimitStub).should('have.been.calledWith', 10);
    });
});
