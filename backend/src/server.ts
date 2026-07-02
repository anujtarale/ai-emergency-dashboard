import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import http from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import app from './app';
import config from './config';
import logger from './utils/logger';
import User from './models/User';
import { initializeDatabase } from './utils/initDb';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (server-to-server, curl, Postman, etc.)
      if (!origin) return callback(null, true);
      // Allow any localhost origin (any port) for development
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      // Allow the configured client URL
      if (origin === config.clientUrl) {
        return callback(null, true);
      }
      // Allow any HTTPS origin (covers  deployments and any other HTTPS frontend)
      if (origin.startsWith('https://')) {
        return callback(null, true);
      }
      logger.warn(`Socket.IO CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }
});
app.set('io', io);

interface AuthenticatedSocket extends Socket {
  user?: any;
}

io.use(async (socket: AuthenticatedSocket, next) => {
  try {
    let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token && socket.handshake.headers?.cookie) {
      const cookieHeader = socket.handshake.headers.cookie;
      const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => {
          const [key, ...val] = c.trim().split('=');
          return [key, val.join('=')];
        })
      );
      token = cookies.accessToken;
    }

    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; role: string };
    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (!user) {
      return next(new Error('Authentication error'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket: AuthenticatedSocket) => {
  logger.info(`New client connected: ${socket.user?._id} (Role: ${socket.user?.role})`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    logger.info(`Client ${socket.user?._id} joined room: ${roomId}`);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    logger.info(`Client ${socket.user?._id} left room: ${roomId}`);
  });

  socket.on('disconnect', (reason) => {
    logger.info(`Client disconnected: ${socket.user?._id} - Reason: ${reason}`);
  });

  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.user?._id}:`, error);
  });
});

mongoose.connect(config.mongodbUri)
  .then(async () => {
    logger.info('MongoDB connected');
    await initializeDatabase();
  })
  .catch((err) => logger.error('MongoDB connection error:', err));

const PORT = process.env.PORT || config.port;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export { io };

// Triggering reload for nodemon to boot up with local database settings
