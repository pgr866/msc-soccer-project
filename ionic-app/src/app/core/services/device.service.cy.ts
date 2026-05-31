import { TestBed } from '@angular/core/testing';
import { DeviceService } from './device.service';
import { Storage } from '@angular/fire/storage';

describe('DeviceService Smoke Test', () => {
    let service: DeviceService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DeviceService,
                { provide: Storage, useValue: {} }
            ]
        });
        service = TestBed.inject(DeviceService);
    });

    it('debería instanciarse correctamente', () => {
        expect(service).to.not.be.undefined;
        expect(service).to.be.instanceOf(DeviceService);
    });

    it('debería tener los métodos definidos', () => {
        expect(service.getCurrentPosition).to.be.a('function');
        expect(service.takeAndUploadPhoto).to.be.a('function');
    });
});
