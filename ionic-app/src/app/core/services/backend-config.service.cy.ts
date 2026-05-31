import { TestBed } from '@angular/core/testing';
import { BackendConfigService } from './backend-config.service';
import { environment } from '@/environments/environment';

describe('BackendConfigService', () => {
    let service: BackendConfigService;

    beforeEach(() => {
        localStorage.clear();

        TestBed.configureTestingModule({
            providers: [BackendConfigService]
        });
        service = TestBed.inject(BackendConfigService);
    });

    it('debería inicializarse con el valor del localStorage', () => {
        localStorage.setItem('isSpringMode', 'true');

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            providers: [BackendConfigService]
        });

        const newService = TestBed.inject(BackendConfigService);
        expect(newService.isSpringMode()).to.be.true;
    });

    it('debería calcular la URL correctamente en modo Node (por defecto)', () => {
        const url = service.getBaseApi('player');
        expect(url).to.equal(`${environment.nodeApiUrl}/api`);
    });

    it('debería alternar el modo y actualizar la URL al cambiar a Spring', () => {
        service.toggleBackend();

        const url = service.getBaseApi('player');

        expect(service.isSpringMode()).to.be.true;
        expect(url).to.equal(`${environment.springApiUrl}/player-service/api`);
        expect(localStorage.getItem('isSpringMode')).to.equal('true');
    });

    it('debería devolver el prefijo correcto para diferentes servicios en modo Spring', () => {
        service.toggleBackend();

        expect(service.getBaseApi('comment')).to.contain('/comment-service/api');
        expect(service.getBaseApi('dream-team')).to.contain('/dream-team-service/api');
    });
});
