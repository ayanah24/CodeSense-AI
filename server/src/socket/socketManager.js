import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import redisConnection, { createRedisConnection } from '../config/redis.js';

let io;

const subscriber = createRedisConnection();

subscriber.on('error', (err) => {
    console.error('Redis subscriber error:', err.message);
});

subscriber.on('message', (channel, message) => {
    if (channel !== 'review:complete' || !io) {
        return;
    }

    try {
        const data = JSON.parse(message);
        io.to(`user:${data.userId}`).emit('review:complete', data.review);
        console.log(`Emitted review completed to user:${data.userId}`);
    } catch (err) {
        console.error('Failed to process review:complete message:', err.message);
    }
});

subscriber.subscribe('review:complete');

// initializing
export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    });

    // auth middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error('AUTH_REQUIRED'));
            }

            const decoded = verifyToken(token);
            const sessionExists = await redisConnection.get(`session:${decoded.jti}`);

            if (!sessionExists) {
                return next(new Error('SESSION_EXPIRED'));
            }

            socket.userId = decoded.userId;
            next();
        } catch (err) {
            next(new Error('AUTH_FAILED'));
        }
    });

    // connection handler
    io.on('connection', (socket) => {
        console.log(`Socket connected - userId: ${socket.userId}`);

        socket.join(`user:${socket.userId}`);
        console.log(`Joined room: user:${socket.userId}`);

        socket.on('disconnect', (reason) => {
            console.log(`Socket disconnected - userId: ${socket.userId} reason: ${reason}`);
        });
    });

    console.log('Socket.io initialized');
    return io;
}

// emit to specific user
export function emitToUser(userId, event, data) {
    if (!io) {
        console.warn('Socket.io not initialized');
        return;
    }

    io.to(`user:${userId}`).emit(event, data);
    console.log(`Emitted '${event}' to user:${userId}`);
}

// get io instance
export function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }

    return io;
}
