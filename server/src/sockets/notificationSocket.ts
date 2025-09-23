// src/sockets/notificationSocket.ts
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Notification } from '../Models/notification';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

interface NotificationData {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: any;
  relatedId?: string;
  fromUserId?: string;
}

export const initializeNotificationSocket = (io: Server) => {
  // Create notification namespace
  const notificationNamespace = io.of('/notifications');

  // Authentication middleware
  // notificationSocket.ts
  notificationNamespace.use((socket: AuthenticatedSocket, next) => {
    try {
      // Extract token from cookie (sent automatically with withCredentials)
      const token = socket.handshake.headers.cookie
        ?.split(';')
        .find((c) => c.trim().startsWith('token='))
        ?.split('=')[1];

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  notificationNamespace.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected to notifications`);

    // Join user to their personal room
    if (socket.userId) {
      socket.join(socket.userId);
    }

    // Handle sending notifications
    socket.on('send_notification', async (data: NotificationData) => {
      try {
        // Create notification in database
        const notification = await Notification.create({
          userId: data.userId,
          type: data.type,
          title: data.title,
          body: data.body,
          data: data.data,
          relatedId: data.relatedId,
          fromUserId: data.fromUserId || socket.userId,
        });

        // Populate fromUserId for response
        const populatedNotification = await Notification.findById(
          notification._id
        ).populate('fromUserId', 'name UserName profilePic');

        // Send to target user
        notificationNamespace
          .to(data.userId)
          .emit('receive_notification', populatedNotification);

        // Send confirmation to sender
        socket.emit('notification_sent', {
          success: true,
          notificationId: notification._id,
        });

        console.log(
          `Notification sent from ${socket.userId} to ${data.userId}`
        );
      } catch (error) {
        console.error('Error sending notification:', error);
        socket.emit('notification_error', {
          message: 'Failed to send notification',
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from notifications`);
    });
  });
};
