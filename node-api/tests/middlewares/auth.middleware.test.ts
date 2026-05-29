import { jest } from '@jest/globals';

const mockCacheInstance = {
    get: jest.fn() as jest.Mock,
    set: jest.fn() as jest.Mock,
    flushAll: jest.fn() as jest.Mock,
};

jest.mock('node-cache', () => {
    return jest.fn(() => mockCacheInstance);
});

const mockVerifyIdToken = jest.fn() as jest.Mock;
jest.mock('firebase-admin/auth', () => ({
    getAuth: () => ({ verifyIdToken: mockVerifyIdToken })
}));

const mockDoc = { get: jest.fn() as jest.Mock };
const mockDb = { collection: () => ({ doc: () => mockDoc }) };
jest.mock('firebase-admin/firestore', () => ({
    getFirestore: () => mockDb
}));

const safeMock = (mockFn: any) => mockFn;

import * as middleware from '../../src/middlewares/auth.middleware.js';

describe('Auth Middleware - Final Fixed Suite', () => {
    let mockReq: any;
    let mockRes: any;
    let next: any;

    beforeEach(() => {
        mockReq = { headers: { authorization: 'Bearer token' } };
        mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('authenticate()', () => {
        test('Success: Use cached role', async () => {
            safeMock(mockCacheInstance.get).mockReturnValue('ADMIN');
            safeMock(mockVerifyIdToken).mockResolvedValue({ uid: 'u1', email: 'a@b.com' });

            await middleware.authenticate(mockReq, mockRes, next);

            expect(mockReq.user).toBeDefined();
            expect(mockReq.user.role).toBe('ADMIN');
            expect(next).toHaveBeenCalled();
        });

        test('Success: Cache miss, fetch from DB', async () => {
            safeMock(mockCacheInstance.get).mockReturnValue(undefined);
            safeMock(mockVerifyIdToken).mockResolvedValue({ uid: 'u2', email: 'c@d.com' });
            safeMock(mockDoc.get).mockResolvedValue({ data: () => ({ role: 'USER' }), exists: true });

            await middleware.authenticate(mockReq, mockRes, next);

            expect(mockReq.user).toBeDefined();
            expect(mockReq.user.role).toBe('USER');
            expect(mockCacheInstance.set).toHaveBeenCalledWith('u2', 'USER');
            expect(next).toHaveBeenCalled();
        });
    });

    describe('optionalAuthenticate()', () => {
        test('Success: No token', async () => {
            const req = { headers: {} } as any;
            await middleware.optionalAuthenticate(req, mockRes, next);
            expect(next).toHaveBeenCalled();
        });

        test('Success: Invalid token', async () => {
            const req = { headers: { authorization: 'Bearer mal-token' } } as any;
            safeMock(mockVerifyIdToken).mockRejectedValue(new Error('Auth failed'));
            await middleware.optionalAuthenticate(req, mockRes, next);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('Coverage Booster', () => {
        test('optionalAuthenticate: Success with cache hit', async () => {
            safeMock(mockCacheInstance.get).mockReturnValue('USER');
            safeMock(mockVerifyIdToken).mockResolvedValue({ uid: 'u1', email: 'test@test.com' });
            const req = { headers: { authorization: 'Bearer tok' } } as any;
            await middleware.optionalAuthenticate(req, mockRes, next);
            expect(req.user.role).toBe('USER');
        });

        test('authenticate: Handle missing userData', async () => {
            safeMock(mockCacheInstance.get).mockReturnValue(undefined);
            safeMock(mockVerifyIdToken).mockResolvedValue({ uid: 'u-empty' });
            safeMock(mockDoc.get).mockResolvedValue({ exists: true, data: () => undefined });
            await middleware.authenticate(mockReq, mockRes, next);
            expect(mockReq.user.role).toBe('USER');
        });

        test('authenticate: Error handling (401)', async () => {
            safeMock(mockVerifyIdToken).mockRejectedValue(new Error('Boom'));
            await middleware.authenticate(mockReq, mockRes, next);
            expect(mockRes.status).toHaveBeenCalledWith(401);
        });
    });
});
