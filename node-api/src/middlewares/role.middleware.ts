import { type Request, type Response, type NextFunction } from 'express';
import { type User } from '../models/user.js';

export const authorizeRole = (requiredRole: User['role']) => {
    return (req: Request & { user?: User }, res: Response, next: NextFunction) => {
        if (req.user?.role === requiredRole) {
            return next();
        }
        return res.status(403).json({ message: "Insufficient permissions" });
    };
};
