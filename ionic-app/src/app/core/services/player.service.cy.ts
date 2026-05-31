import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlayerService } from './player.service';
import { BackendConfigService } from './backend-config.service';

describe('PlayerService', () => {
    let service: PlayerService;
    let httpMock: HttpTestingController;
    const mockBaseUrl = 'https://api.test.com/player';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                PlayerService,
                { provide: BackendConfigService, useValue: { getBaseApi: () => mockBaseUrl } }
            ]
        });
        service = TestBed.inject(PlayerService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('debería obtener la lista de jugadores y actualizar la signal', () => {
        const mockPlayers = [{ id: '1', name: 'Messi' }];

        service.getPlayers().subscribe();

        const req = httpMock.expectOne(`${mockBaseUrl}/players`);
        expect(req.request.method).to.equal('GET');
        req.flush(mockPlayers);

        expect(service.players()).to.deep.equal(mockPlayers);
    });

    it('debería eliminar un jugador y actualizar la signal', () => {
        service.deletePlayer('1').subscribe();

        const req = httpMock.expectOne(`${mockBaseUrl}/players/1`);
        expect(req.request.method).to.equal('DELETE');
        req.flush({});
    });

    it('debería buscar jugadores externos', () => {
        const mockResults = [{ id: '3', name: 'Mbappe' }];

        service.searchExternalPlayers('Mbappe').subscribe();

        const req = httpMock.expectOne(req => req.url.includes('/players/search'));
        expect(req.request.params.get('query')).to.equal('Mbappe');
        req.flush(mockResults);

        expect(service.searchImportResults()).to.deep.equal(mockResults);
    });
});
