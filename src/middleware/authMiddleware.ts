import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    // For demo purposes, we will bypass the authentication check.
    // A mock user can be attached to the request object if needed by downstream middleware.
    if (!req.user) {
        // You can attach a mock user object if your controllers depend on it
        // @ts-ignore
        req.user = {
            id: 'demo-user-id',
            name: 'Demo User',
            email: 'demo@example.com'
        };
    }
    next();
};