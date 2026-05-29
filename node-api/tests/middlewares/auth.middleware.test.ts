import { jest } from '@jest/globals';

const mockCacheInstance = {
    get: jest.fn(),
    set: jest.fn(),
    flushAll: jest.fn(),
};

jest.mock('node-cache', () => {
    return jest.fn(() => mockCacheInstance);
});

const mockVerifyIdToken = jest.fn();
jest.mock('firebase-admin/auth', () => ({
    getAuth: () => ({ verifyIdToken: mockVerifyIdToken })
}));

const mockDoc = { get: jest.fn() };
const mockDb = { collection: () => ({ doc: () => mockDoc }) };
jest.mock('firebase-admin/firestore', () => ({
    getFirestore: () => mockDb
}));

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
            mockCacheInstance.get.mockReturnValue('ADMIN');
            mockVerifyIdToken.mockResolvedValue({ uid: 'u1', email: 'a@b.com' });

            await middleware.authenticate(mockReq, mockRes, next);

            expect(mockReq.user).toBeDefined();
            expect(mockReq.user.role).toBe('ADMIN');
            expect(next).toHaveBeenCalled();
        });

        test('Success: Cache miss, fetch from DB', async () => {
            mockCacheInstance.get.mockReturnValue(undefined);
            mockVerifyIdToken.mockResolvedValue({ uid: 'u2', email: 'c@d.com' });
            mockDoc.get.mockResolvedValue({ data: () => ({ role: 'USER' }), exists: true });

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
            mockVerifyIdToken.mockRejectedValue(new Error('Auth failed'));
            await middleware.optionalAuthenticate(req, mockRes, next);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('Coverage Booster', () => {
        test('optionalAuthenticate: Success with cache hit', async () => {
            mockCacheInstance.get.mockReturnValue('USER');
            mockVerifyIdToken.mockResolvedValue({ uid: 'u1', email: 'test@test.com' });
            const req = { headers: { authorization: 'Bearer tok' } } as any;
            await middleware.optionalAuthenticate(req, mockRes, next);
            expect(req.user.role).toBe('USER');
        });

        test('authenticate: Handle missing userData', async () => {
            mockCacheInstance.get.mockReturnValue(undefined);
            mockVerifyIdToken.mockResolvedValue({ uid: 'u-empty' });
            mockDoc.get.mockResolvedValue({ exists: true, data: () => undefined });
            await middleware.authenticate(mockReq, mockRes, next);
            expect(mockReq.user.role).toBe('USER');
        });

        test('authenticate: Error handling (401)', async () => {
            mockVerifyIdToken.mockRejectedValue(new Error('Boom'));
            await middleware.authenticate(mockReq, mockRes, next);
            expect(mockRes.status).toHaveBeenCalledWith(401);
        });
    });
});
