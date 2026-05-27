import { type Request, type Response, type NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { type User } from '../models/user.js';

export const authenticate = async (req: Request & { user?: User }, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split('Bearer ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });
    try {
        const decodedToken = await getAuth().verifyIdToken(token);
        const db = getFirestore();
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email ?? '',
            role: userData?.role || 'USER'
        };
        return next();
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unauthorized';
        return res.status(401).json({ message: 'Unauthorized', error: message });
    }
};
