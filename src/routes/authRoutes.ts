import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { randomBytes } from 'crypto'; // Import crypto for generating unique IDs
import User from '../models/User';

const router = Router();

// --- Controller function for Demo Login ---
const demoLoginController = (req: Request, res: Response, next: NextFunction) => {
    // Generate unique credentials for a new anonymous user
    const uniqueId = randomBytes(12).toString('hex');
    const newUser = new User({
        name: 'Demo User',
        googleId: `demo-${uniqueId}`,
        email: `demo-${uniqueId}@example.com`,
        isAnonymous: true,
    });

    // Save the new user to the database
    newUser.save()
        .then(demoUser => {
            // Use req.login() to establish a session for the new user
            req.login(demoUser, (err) => {
                if (err) {
                    return next(err);
                }
                // Upon successful login, send back the user object
                return res.status(200).json(demoUser);
            });
        })
        .catch(error => {
            // Pass any database errors to the next middleware
            next(error);
        });
};


// --- Routes ---

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req: Request, res: Response) => {
        res.redirect('http://localhost:3000/dashboard');
    }
);

// @desc    Get current logged-in user
// @route   GET /api/auth/current_user
router.get('/current_user', (req: Request, res: Response) => {
    res.send(req.user);
});

// @desc    Logout user
// @route   GET /api/auth/logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('http://localhost:3000/');
    });
});

// @desc    Login as Demo User
// @route   POST /api/auth/demo
router.post('/demo', demoLoginController);

export default router;