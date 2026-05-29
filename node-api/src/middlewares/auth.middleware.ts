import { type Request, type Response, type NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import NodeCache from 'node-cache';
import { type User } from '../models/user.js';

const roleCache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

export const optionalAuthenticate = async (req: Request & { user?: User }, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next();
    }
    const token = authHeader.split('Bearer ')[1];
    if (!token) return next();
    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const cachedRole = roleCache.get<'USER' | 'ADMIN'>(decodedToken.uid);
        if (cachedRole) {
            req.user = { uid: decodedToken.uid, email: decodedToken.email ?? '', role: cachedRole };
        } else {
            const db = getFirestore();
            const userDoc = await db.collection('users').doc(decodedToken.uid).get();
            const userData = userDoc.data();
            const role: 'USER' | 'ADMIN' = userData?.role === 'ADMIN' ? 'ADMIN' : 'USER';
            roleCache.set(decodedToken.uid, role);
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email ?? '',
                role: role
            };
        }
        next();
    } catch (err: unknown) {
        next();
    }
};

export const authenticate = async (req: Request & { user?: User }, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split('Bearer ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });
    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const cachedRole = roleCache.get<'USER' | 'ADMIN'>(decodedToken.uid);
        if (cachedRole) {
            req.user = { uid: decodedToken.uid, email: decodedToken.email ?? '', role: cachedRole };
            return next();
        }
        const db = getFirestore();
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();
        const role: 'USER' | 'ADMIN' = userData?.role === 'ADMIN' ? 'ADMIN' : 'USER';
        roleCache.set(decodedToken.uid, role);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email ?? '',
            role: role
        };
        return next();
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unauthorized';
        return res.status(401).json({ message: 'Unauthorized', error: message });
    }
};
