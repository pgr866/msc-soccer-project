import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DreamTeamService } from './dream-team.service';
import { BackendConfigService } from './backend-config.service';

describe('DreamTeamService', () => {
    let service: DreamTeamService;
    let httpMock: HttpTestingController;
    const mockBaseUrl = 'https://api.test.com/dream-team';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                DreamTeamService,
                { provide: BackendConfigService, useValue: { getBaseApi: () => mockBaseUrl } }
            ]
        });
        service = TestBed.inject(DreamTeamService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('debería obtener los equipos y actualizar la signal dreamTeams', () => {
        const mockTeams = [{ id: '1', name: 'Equipo IA' }];

        service.getDreamTeams().subscribe();

        const req = httpMock.expectOne(`${mockBaseUrl}/dream-teams`);
        expect(req.request.method).to.equal('GET');
        req.flush(mockTeams);

        expect(service.dreamTeams()).to.deep.equal(mockTeams);
    });

    it('debería generar un nuevo equipo y añadirlo al principio de la signal', () => {
        const newTeam = { id: '2', name: 'Nuevo Equipo' };
        const initialTeams = [{ id: '1', name: 'Equipo 1' }];

        service.getDreamTeams().subscribe();
        httpMock.expectOne(`${mockBaseUrl}/dream-teams`).flush(initialTeams);

        service.generateDreamTeam().subscribe();

        const req = httpMock.expectOne(`${mockBaseUrl}/dream-teams`);
        expect(req.request.method).to.equal('POST');
        req.flush(newTeam);

        expect(service.dreamTeams()[0]).to.deep.equal(newTeam);
        expect(service.dreamTeams().length).to.equal(2);
    });
});
