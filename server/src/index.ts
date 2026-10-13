import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import adminRoutes from './routes/adminRoutes';
import { setupSocketHandlers } from './socket/chatHandler';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    serverNode: process.env.SERVER_ID || 'server-node-1',
    port: process.env.PORT || 5000,
    timestamp: new Date().toISOString(),
  });
});

// Setup Socket handlers
setupSocketHandlers(io);

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Distributed Chat Server Node running on PORT ${PORT}`);
    console.log(`🌐 Server Node ID: ${process.env.SERVER_ID || 'server-node-1'}`);
    console.log(`=======================================================`);
  });
});
