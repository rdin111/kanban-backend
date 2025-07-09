import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    const allowedOrigins = [
        'http://localhost:5173', // Your local frontend
        'https://www.flowboard.me', // Your deployed frontend
        'https://flowboard.me' // Optional: without www
    ];

    if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
        allowedOrigins.push(process.env.FRONTEND_URL);
    }

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true
        },
    });

    io.on('connection', (socket: Socket) => {
        console.log('🔌 A user connected:', socket.id);

        socket.on('joinBoard', (boardId: string) => {
            socket.join(boardId);
            console.log(`User ${socket.id} joined board ${boardId}`);
        });

        socket.on('disconnect', () => {
            console.log(' A user disconnected:', socket.id);
        });
    });

    return io;
};

export const getIo = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};