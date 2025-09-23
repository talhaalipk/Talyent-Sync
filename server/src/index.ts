// server.ts
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectToDatabase } from './config/db';

//  routes
import paymentRouter from './Routes/payment';
import authRouter from './Routes/auth';
import profileRouter from './Routes/profile';
import jobRouter from './Routes/job';
import proposalRouter from './Routes/proposal';
import freelancerRouter from './Routes/freelancer';
import chatRouter from './Routes/chat';
import notificationRouter from './Routes/notifiaction';
import contractRouter from './Routes/contract';
import reviewRouter from './Routes/review';
import analyticsRouter from './Routes/analytics';
import adminAuthRouter from './Routes/Admin/adminAuth';
import adminDashboardRouter from './Routes/Admin/adminDashboard';

// Sockets
import ChatSocketHandler from './sockets/chatSocket';
import { initializeNotificationSocket } from './sockets/notificationSocket';
import { notificationService } from './services/notificationService';

//Model
import './Models/user';
import './Models/message';
import './Models/notification';
import { Wallet } from './Models/Wallet';

// Create Express app and HTTP server
const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};

app.use(cors(corsOptions));
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cookieParser());

// NEW: Socket.io setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
new ChatSocketHandler(io);
notificationService.initialize(io);
initializeNotificationSocket(io);

app.get('/test', (req, res) => {
  console.log('✅ Route hit');
  res.send('ok');
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/freelacer', freelancerRouter);
app.use('/api/proposal', proposalRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/contracts', contractRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/dashboard', adminDashboardRouter);

// Start server
server.listen(port, async () => {
  await connectToDatabase();

  // Run migration safely after DB connection

  console.log(`🟢 Server is running on http://localhost:${port}`);
  console.log(`🔌 Socket.io server is ready for real-time chat`);
});