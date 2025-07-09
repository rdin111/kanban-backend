import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { configurePassport } from './config/passport';
import { initSocket } from './socket';

import connectDB from './config/db';
import boardRoutes from './routes/boardRoutes';
import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';

const startServer = async () => {
    // Configure dotenv and passport
    dotenv.config();
    configurePassport();

    // Connect to Database first
    await connectDB();

    const app: Express = express();
    const httpServer = createServer(app);
    const PORT = process.env.PORT || 5001;

    // Initialize Socket.IO
    initSocket(httpServer);

    // Middleware
    app.use(helmet());
    app.use(cors({
        origin: ['https://flowboard.me', 'https://www.flowboard.me'], // Allow requests from our future React app
        credentials: true // Allow cookies to be sent
    }));
    app.use(express.json());

    // Session Middleware
    app.use(
        session({
            secret: process.env.SESSION_SECRET as string,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({ mongoUrl: process.env.MONGO_URI as string }),
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true
            }
        })
    );

    // Passport Middleware
    app.use(passport.initialize());
    app.use(passport.session());

    // Routes
    app.get('/', (_req: Request, res: Response) => {
        res.send('Kanban API is running!');
    });
    app.use('/api/auth', authRoutes);
    app.use('/api/boards', boardRoutes);
    app.use('/api/tasks', taskRoutes);

    // Start the server
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
};

// Execute the server start and catch any top-level errors
startServer().catch(error => {
    console.error("Fatal error starting server:", error);
    process.exit(1);
});