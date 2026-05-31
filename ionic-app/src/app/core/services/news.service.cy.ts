import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NewsService } from './news.service';
import { BackendConfigService } from './backend-config.service';

describe('NewsService', () => {
    let service: NewsService;
    let httpMock: HttpTestingController;
    const mockBaseUrl = 'https://api.test.com/player';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                NewsService,
                { provide: BackendConfigService, useValue: { getBaseApi: () => mockBaseUrl } }
            ]
        });
        service = TestBed.inject(NewsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('debería enviar la noticia con los parámetros correctos', () => {
        const news = { title: 'T', player: 'P', description: 'D', labels: '#L' };

        service.sendNews(news).subscribe();

        const req = httpMock.expectOne(r => r.url.includes('/corba/send'));
        expect(req.request.method).to.equal('POST');
        expect(req.request.params.get('title')).to.equal('T');
        expect(req.request.params.get('player')).to.equal('P');
        req.flush({});
    });

    it('debería actualizar el límite con el parámetro correcto', () => {
        service.setLimit(10).subscribe();

        const req = httpMock.expectOne(r => r.url.includes('/corba/limit'));
        expect(req.request.method).to.equal('POST');
        expect(req.request.params.get('limit')).to.equal('10');
        req.flush({});
    });

    it('debería realizar llamadas POST simples para read y receive', () => {
        service.readNews().subscribe();
        httpMock.expectOne(r => r.url.includes('/corba/read')).flush({});

        service.receiveNews().subscribe();
        httpMock.expectOne(r => r.url.includes('/corba/receive')).flush({});
    });
});
