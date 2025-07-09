import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { randomBytes } from 'crypto';
import User from '../models/User';

const router = Router();

const demoLoginController = (req: Request, res: Response, next: NextFunction) => {
    const uniqueId = randomBytes(12).toString('hex');
    const newUser = new User({
        name: 'Demo User',
        googleId: `demo-${uniqueId}`,
        email: `demo-${uniqueId}@example.com`,
        isAnonymous: true,
    });

    newUser.save()
        .then(demoUser => {
            req.login(demoUser, (err) => {
                if (err) {
                    return next(err);
                }
                return res.status(200).json(demoUser);
            });
        })
        .catch(error => {
            next(error);
        });
};

router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// This is the section to change
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req: Request, res: Response) => {
        // Redirect to the deployed frontend URL + /dashboard
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
);

router.get('/current_user', (req: Request, res: Response) => {
    res.send(req.user);
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        // Also update the logout redirect
        res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000/');
    });
});

router.post('/demo', demoLoginController);

export default router;