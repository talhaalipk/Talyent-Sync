import express from 'express';
import { protect } from '../Middleware/auth';
import {
  getChatConversations,
  getChatMessages,
  sendMessage,
  sendFileMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
  getUserProfile,
} from '../Controllers/chatController';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Get all conversations for current user
router.get('/conversations', getChatConversations);

// Get user profile for new conversation
router.get('/user/:targetUserId', getUserProfile);

// Get messages between current user and specific user
router.get('/messages/:receiverId', getChatMessages);

// Send text message
router.post('/send', sendMessage);

// Send file/image message
router.post('/send-file', sendFileMessage);

// Mark messages as read
router.patch('/read/:senderId', markMessagesAsRead);

// Get unread message count
router.get('/unread-count', getUnreadMessageCount);

export default router;
