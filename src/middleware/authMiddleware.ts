import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    // req.user is created by Passport if the user is authenticated
    if (req.user) {
        next(); // User is logged in, proceed to the route handler
    } else {
        res.status(401).json({ message: 'Unauthorized: You must be logged in.' });
    }
};