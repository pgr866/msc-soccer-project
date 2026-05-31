import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommentService } from './comment.service';
import { BackendConfigService } from './backend-config.service';

describe('CommentService', () => {
    let service: CommentService;
    let httpMock: HttpTestingController;
    const mockBaseUrl = 'https://api.test.com/comment';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                CommentService,
                { provide: BackendConfigService, useValue: { getBaseApi: () => mockBaseUrl } }
            ]
        });
        service = TestBed.inject(CommentService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('debería añadir un comentario al jugador especificado', () => {
        const playerId = '123';
        const mockComment = { text: 'Buen jugador' };

        service.addComment(playerId, mockComment as any).subscribe();

        const req = httpMock.expectOne(`${mockBaseUrl}/comments/player/${playerId}`);
        expect(req.request.method).to.equal('POST');
        expect(req.request.body).to.deep.equal(mockComment);
        req.flush({});
    });

    it('debería eliminar un comentario por su ID', () => {
        const commentId = 'abc';

        service.deleteComment(commentId).subscribe();

        const req = httpMock.expectOne(`${mockBaseUrl}/comments/${commentId}`);
        expect(req.request.method).to.equal('DELETE');
        req.flush({});
    });
});
