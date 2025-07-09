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
    dotenv.config();
    configurePassport();
    await connectDB();

    const app: Express = express();
    const httpServer = createServer(app);
    const PORT = process.env.PORT || 5001;

    initSocket(httpServer);

    const allowedOrigins = [
        'http://localhost:5173', // Your local frontend
        'https://www.flowboard.me', // Your deployed frontend
        'https://flowboard.me' // Optional: without www
    ];

    if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
        allowedOrigins.push(process.env.FRONTEND_URL);
    }

    app.use(helmet());
    app.use(cors({
        origin: allowedOrigins,
        credentials: true
    }));
    app.use(express.json());

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

    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/', (_req: Request, res: Response) => {
        res.send('Kanban API is running!');
    });
    app.use('/api/auth', authRoutes);
    app.use('/api/boards', boardRoutes);
    app.use('/api/tasks', taskRoutes);

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
};

startServer().catch(error => {
    console.error("Fatal error starting server:", error);
    process.exit(1);
});