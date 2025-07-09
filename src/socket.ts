import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    const allowedOrigins = [
        'http://localhost:5173',
        'https://www.flowboard.me',
        'https://flowboard.me'
    ];

    io = new Server(httpServer, {
        cors: {
            origin: function (origin, callback) {
                if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
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