import { jest } from '@jest/globals';
import { type Request, type Response, type NextFunction } from 'express';
import { authorizeRole } from '../../src/middlewares/role.middleware.js';

describe('Role Middleware', () => {
    let mockReq: Partial<Request & { user?: any }>;
    let mockRes: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        mockReq = {
            user: undefined
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as any;
        next = jest.fn();
        jest.clearAllMocks();
    });

    test('should call next() if user has the required role', () => {
        mockReq.user = { role: 'ADMIN' };
        const middleware = authorizeRole('ADMIN');

        middleware(mockReq as Request, mockRes as Response, next);

        expect(next).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should return 403 if user has a different role', () => {
        mockReq.user = { role: 'USER' };
        const middleware = authorizeRole('ADMIN');

        middleware(mockReq as Request, mockRes as Response, next);

        expect(next).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
    });

    test('should return 403 if no user is present in the request', () => {
        mockReq.user = undefined;
        const middleware = authorizeRole('ADMIN');

        middleware(mockReq as Request, mockRes as Response, next);

        expect(next).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(403);
    });
});
