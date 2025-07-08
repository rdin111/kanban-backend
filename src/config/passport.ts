import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User, { IUser } from '../models/User';

export const configurePassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
                callbackURL: '/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                const newUser = {
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails?.[0].value,
                };

                try {
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        // If user exists, pass the user object to the next step
                        done(null, user);
                    } else {
                        // If user doesn't exist, create a new one
                        user = await User.create(newUser);
                        done(null, user);
                    }
                } catch (err) {
                    console.error(err);
                    done(err, undefined);
                }
            }
        )
    );

    // Serializing user determines what data of the user object should be stored in the session.
    passport.serializeUser((user, done) => {
        done(null, (user as IUser).id);
    });

    // Deserializing user will attach the user object to the request object (req.user).
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};