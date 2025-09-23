// src/services/notificationService.ts
import { Server } from 'socket.io';
import { Notification } from '../Models/notification';

interface NotificationData {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: any;
  relatedId?: string;
  fromUserId?: string;
}

class NotificationService {
  private io: Server | null = null;

  // Initialize with Socket.IO instance
  initialize(socketIO: Server) {
    this.io = socketIO;
    console.log('Notification service initialized');
  }

  // Send notification from backend API
  async sendNotification(data: NotificationData) {
    try {
      // Save to database
      const notification = await Notification.create({
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data,
        relatedId: data.relatedId,
        fromUserId: data.fromUserId,
      });

      // Populate fromUserId for socket emission
      const populatedNotification = await Notification.findById(
        notification._id
      ).populate('fromUserId', 'name UserName profilePic');

      // Send via socket if connected
      if (this.io) {
        this.io
          .of('/notifications')
          .to(data.userId)
          .emit('receive_notification', populatedNotification);
      }

      return { success: true, notification: populatedNotification };
    } catch (error: any) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Bulk send notifications (useful for broadcasting)
  async sendBulkNotifications(notifications: NotificationData[]) {
    const results = [];

    for (const notificationData of notifications) {
      const result = await this.sendNotification(notificationData);
      results.push(result);
    }

    return results;
  }

  // Send notification to multiple users (same notification)
  async sendToMultipleUsers(
    userIds: string[],
    notificationData: Omit<NotificationData, 'userId'>
  ) {
    const notifications = userIds.map((userId) => ({
      ...notificationData,
      userId,
    }));

    return this.sendBulkNotifications(notifications);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
