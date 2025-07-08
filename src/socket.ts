import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: 'http://localhost:5173', // The origin of our future React app
            methods: ['GET', 'POST'],
            credentials: true // Allow cookies for authenticated socket connections

        },
    });

    io.on('connection', (socket: Socket) => {
        console.log('🔌 A user connected:', socket.id);

        // Handler for a user joining a board-specific room
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

// Export a function to get the io instance so our services can use it
export const getIo = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};