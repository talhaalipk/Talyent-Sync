// Routes/notification.ts
import express from 'express';
import { protect } from '../Middleware/auth';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
  addNotification,
} from '../Controllers/notificationController';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// Add notification
router.post('/', addNotification);

// Get all notifications for current user
router.get('/', getNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadNotificationCount);

// Mark notification as read
router.patch('/:notificationId/read', markNotificationAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllNotificationsAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

export default router;
