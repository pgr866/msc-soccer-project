import { NewsPage } from './news.page';
import { NewsService } from '@/app/core/services/news.service';
import { ToastService } from '@/app/core/services/toast.service';
import { AlertService } from '@/app/core/services/alert.service';
import { AuthService } from '@/app/core/services/auth.service';
import { of } from 'rxjs';

describe('NewsPage', () => {
    const authMock = { currentUser: () => ({ role: 'USER' }) };
    const mockNews = {
        title: 'Noticia de prueba',
        date: '2026-05-31',
        labels: 'Fútbol, Deporte',
        player: 'Jugador 1',
        description: 'Descripción de la noticia'
    };

    it('debería mostrar la noticia cuando hay datos disponibles', () => {
        const newsServiceMock = {
            readNews: cy.stub().returns(of({ news: mockNews })),
            receiveNews: cy.stub()
        };

        cy.mount(NewsPage, {
            providers: [
                { provide: NewsService, useValue: newsServiceMock },
                { provide: ToastService, useValue: { showToast: cy.stub() } },
                { provide: AlertService, useValue: {} },
                { provide: AuthService, useValue: authMock }
            ]
        }).then(({ component }) => {
            component.ionViewWillEnter(); 
        });

        cy.contains('Noticia de prueba').should('be.visible');
    });

    it('debería mostrar estado vacío cuando no hay noticias', () => {
        const newsServiceMock = {
            readNews: cy.stub().returns(of({ news: null })),
            receiveNews: cy.stub()
        };

        cy.mount(NewsPage, {
            providers: [
                { provide: NewsService, useValue: newsServiceMock },
                { provide: ToastService, useValue: { showToast: cy.stub() } },
                { provide: AlertService, useValue: {} },
                { provide: AuthService, useValue: authMock }
            ]
        }).then(({ component }) => {
            component.ionViewWillEnter(); 
        });

        cy.contains('No hay noticias pendientes en el buffer').should('be.visible');
    });

    it('debería consumir la noticia tras confirmar el alert', () => {
        const receiveNewsStub = cy.stub().returns(of({ message: 'Noticia consumida' }));
        const newsServiceMock = {
            readNews: cy.stub().returns(of({ news: mockNews })),
            receiveNews: receiveNewsStub
        };

        cy.mount(NewsPage, {
            providers: [
                { provide: NewsService, useValue: newsServiceMock },
                { provide: ToastService, useValue: { showToast: cy.stub() } },
                { provide: AlertService, useValue: { showConfirmation: cy.stub().resolves(true) } },
                { provide: AuthService, useValue: authMock }
            ]
        }).then(({ component }) => {
            component.ionViewWillEnter(); 
        });

        cy.get('ion-button').contains('Consumir Noticia').click({ force: true });
        cy.wrap(receiveNewsStub).should('have.been.called');
    });
});
