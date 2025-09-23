// sockets/chatSocket.ts
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Message } from '../Models/message';
import { User } from '../Models/user';
import { Notification } from '../Models/notification';
import * as cookie from 'cookie';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userData?: any;
}

interface OnlineUser {
  userId: string;
  socketId: string;
  userData: {
    name?: string;
    UserName?: string;
    profilePic?: string;
    role: string;
  };
}

interface TypingData {
  senderId: string;
  receiverId: string;
  isTyping: boolean;
}

interface NotificationData {
  userId: string;
  type:
    | 'message'
    | 'job_posted'
    | 'proposal_received'
    | 'proposal_accepted'
    | 'proposal_status_change'
    | 'job_completed'
    | 'payment_received'
    | 'rating_received';
  title: string;
  body: string;
  data?: any;
  read?: boolean;
  relatedId?: string;
  fromUserId?: string;
}

class ChatSocketHandler {
  private io: Server;
  private onlineUsers: Map<string, OnlineUser> = new Map();
  private typingUsers: Map<string, TypingData> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware for socket connections
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        console.log(
          'socket.handshake.headers.cookie : ',
          socket.handshake.headers.cookie
        );
        const rawCookie = socket.handshake.headers.cookie;
        if (!rawCookie) {
          console.log('No cookies found');
          return next(new Error('Authentication error: No cookies provided'));
        }

        // Parse cookies
        const cookies = cookie.parse(rawCookie);
        const token = cookies['token']; // extract token
        console.log('TOKEN : ', token);

        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        console.log('AUTH MA 4');
        const JWT_SECRET = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, JWT_SECRET) as {
          id: string;
          role: string;
        };

        // Verify user exists and is active
        const user = await User.findById(decoded.id).select(
          'name UserName profilePic role isActive'
        );
        if (!user || !user.isActive) {
          return next(
            new Error('Authentication error: User not found or inactive')
          );
        }

        socket.userId = decoded.id;
        socket.userData = {
          name: user.name,
          UserName: user.UserName,
          profilePic: user.profilePic,
          role: user.role,
        };

        next();
      } catch (error) {
        console.error('Authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected`);

      // Handle user coming online
      this.handleUserOnline(socket);

      // Handle sending messages
      socket.on('send_message', (data) => this.handleSendMessage(socket, data));

      // Handle typing indicators
      socket.on('typing', (data) => this.handleTyping(socket, data));
      socket.on('stop_typing', (data) => this.handleStopTyping(socket, data));

      // Handle marking messages as read
      socket.on('mark_as_read', (data) => this.handleMarkAsRead(socket, data));

      // Handle joining specific chat room
      socket.on('join_chat', (data) => this.handleJoinChat(socket, data));
      socket.on('leave_chat', (data) => this.handleLeaveChat(socket, data));

      // NEW: Handle notification sending
      socket.on('send_notification', (data) =>
        this.handleSendNotification(socket, data)
      );

      // Handle user disconnect
      socket.on('disconnect', () => this.handleUserOffline(socket));
    });
  }

  private handleUserOnline(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    const onlineUser: OnlineUser = {
      userId: socket.userId,
      socketId: socket.id,
      userData: socket.userData!,
    };

    this.onlineUsers.set(socket.userId, onlineUser);

    // Join user to their own room for personal notifications
    socket.join(`user_${socket.userId}`);

    // Broadcast updated online users list
    this.broadcastOnlineUsers();

    console.log(`User ${socket.userId} is now online`);
  }

  private handleUserOffline(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    this.onlineUsers.delete(socket.userId);
    this.typingUsers.delete(socket.userId);

    // Broadcast updated online users list
    this.broadcastOnlineUsers();

    // Notify others that user stopped typing
    socket.broadcast.emit('user_stopped_typing', { userId: socket.userId });

    console.log(`User ${socket.userId} disconnected`);
  }

  private async handleSendMessage(socket: AuthenticatedSocket, data: any) {
    try {
      if (!socket.userId) return;

      const {
        receiverId,
        content,
        messageType = 'text',
        fileUrl,
        fileName,
        fileSize,
      } = data;

      // Validate input
      if (!receiverId || !content) {
        socket.emit('message_error', {
          message: 'Receiver ID and content are required',
        });
        return;
      }

      // Check if receiver exists
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        socket.emit('message_error', { message: 'Receiver not found' });
        return;
      }

      // Create and save message
      const message = new Message({
        senderId: socket.userId,
        receiverId,
        content,
        messageType,
        fileUrl,
        fileName,
        fileSize,
      });

      const savedMessage = await message.save();
      const populatedMessage = await Message.findById(savedMessage._id)
        .populate('senderId', 'name UserName profilePic')
        .populate('receiverId', 'name UserName profilePic');

      // Check if receiver is online and in the chat room
      const receiverSocket = this.onlineUsers.get(receiverId);
      const isReceiverInChat =
        receiverSocket &&
        this.io.sockets.adapter.rooms
          .get(`chat_${socket.userId}_${receiverId}`)
          ?.has(receiverSocket.socketId);

      // If receiver is in the chat room, mark message as read immediately
      if (isReceiverInChat) {
        await Message.findByIdAndUpdate(savedMessage._id, {
          read: true,
          readAt: new Date(),
        });
        populatedMessage!.read = true;
        populatedMessage!.readAt = new Date();
      }

      // Emit message to sender
      socket.emit('message_sent', populatedMessage);

      // Emit message to receiver if online
      if (receiverSocket) {
        this.io
          .to(receiverSocket.socketId)
          .emit('receive_message', populatedMessage);

        // If receiver is NOT in the chat room, create notification
        if (!isReceiverInChat) {
          await this.createMessageNotification(
            socket.userId,
            receiverId,
            content,
            savedMessage._id as string
          );

          // Send notification count update
          const unreadCount = await this.getUnreadMessageCount(receiverId);
          this.io
            .to(receiverSocket.socketId)
            .emit('notification_update', { unreadCount });
        }
      } else {
        // Receiver is offline, create notification
        await this.createMessageNotification(
          socket.userId,
          receiverId,
          content,
          savedMessage._id as string
        );
      }

      console.log(`Message sent from ${socket.userId} to ${receiverId}`);
    } catch (error) {
      console.error('Error handling send message:', error);
      socket.emit('message_error', { message: 'Failed to send message' });
    }
  }

  // NEW: Handle sending general notifications
  private async handleSendNotification(
    socket: AuthenticatedSocket,
    data: NotificationData
  ) {
    try {
      if (!socket.userId) return;

      const {
        userId,
        type,
        title,
        body,
        data: notificationData,
        read = false,
        relatedId,
        fromUserId,
      } = data;

      // Validate required fields
      if (!userId || !type || !title || !body) {
        socket.emit('notification_error', {
          message: 'userId, type, title, and body are required',
        });
        return;
      }

      // Check if target user exists
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        socket.emit('notification_error', { message: 'Target user not found' });
        return;
      }

      // Create and save notification
      const notification = new Notification({
        userId,
        type,
        title,
        body,
        data: notificationData,
        read,
        relatedId: relatedId || undefined,
        fromUserId: fromUserId || socket.userId,
      });

      const savedNotification = await notification.save();
      const populatedNotification = await Notification.findById(
        savedNotification._id
      )
        .populate('fromUserId', 'name UserName profilePic')
        .populate('userId', 'name UserName profilePic');

      // Emit success to sender
      socket.emit('notification_sent', populatedNotification);

      // Check if target user is online
      const targetUserSocket = this.onlineUsers.get(userId);
      if (targetUserSocket) {
        // Send notification to target user
        this.io
          .to(targetUserSocket.socketId)
          .emit('receive_notification', populatedNotification);

        // Send updated notification count
        const unreadNotificationCount =
          await this.getUnreadNotificationCount(userId);
        this.io
          .to(targetUserSocket.socketId)
          .emit('notification_count_update', {
            unreadCount: unreadNotificationCount,
          });
      }

      console.log(
        `Notification sent from ${socket.userId} to ${userId} - Type: ${type}`
      );
    } catch (error) {
      console.error('Error handling send notification:', error);
      socket.emit('notification_error', {
        message: 'Failed to send notification',
      });
    }
  }

  private handleTyping(
    socket: AuthenticatedSocket,
    data: { receiverId: string }
  ) {
    if (!socket.userId) return;

    const { receiverId } = data;
    const typingData: TypingData = {
      senderId: socket.userId,
      receiverId,
      isTyping: true,
    };

    this.typingUsers.set(socket.userId, typingData);

    // Notify receiver if online
    const receiverSocket = this.onlineUsers.get(receiverId);
    if (receiverSocket) {
      this.io.to(receiverSocket.socketId).emit('user_typing', {
        userId: socket.userId,
        userData: socket.userData,
      });
    }
  }

  private handleStopTyping(
    socket: AuthenticatedSocket,
    data: { receiverId: string }
  ) {
    if (!socket.userId) return;

    this.typingUsers.delete(socket.userId);

    const { receiverId } = data;
    const receiverSocket = this.onlineUsers.get(receiverId);
    if (receiverSocket) {
      this.io.to(receiverSocket.socketId).emit('user_stopped_typing', {
        userId: socket.userId,
      });
    }
  }

  private async handleMarkAsRead(
    socket: AuthenticatedSocket,
    data: { senderId: string }
  ) {
    try {
      if (!socket.userId) return;

      const { senderId } = data;

      // Mark all messages from sender as read
      await Message.updateMany(
        {
          senderId: senderId,
          receiverId: socket.userId,
          read: false,
        },
        {
          read: true,
          readAt: new Date(),
        }
      );

      // Notify sender that messages were read
      const senderSocket = this.onlineUsers.get(senderId);
      if (senderSocket) {
        this.io.to(senderSocket.socketId).emit('messages_read', {
          readBy: socket.userId,
        });
      }

      console.log(
        `Messages from ${senderId} marked as read by ${socket.userId}`
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  private handleJoinChat(
    socket: AuthenticatedSocket,
    data: { receiverId: string }
  ) {
    if (!socket.userId) return;

    const { receiverId } = data;
    const chatRoom = `chat_${socket.userId}_${receiverId}`;

    socket.join(chatRoom);
    console.log(`User ${socket.userId} joined chat with ${receiverId}`);

    // Auto-mark messages as read when joining chat
    this.handleMarkAsRead(socket, { senderId: receiverId });
  }

  private handleLeaveChat(
    socket: AuthenticatedSocket,
    data: { receiverId: string }
  ) {
    if (!socket.userId) return;

    const { receiverId } = data;
    const chatRoom = `chat_${socket.userId}_${receiverId}`;

    socket.leave(chatRoom);
    console.log(`User ${socket.userId} left chat with ${receiverId}`);
  }

  private broadcastOnlineUsers() {
    const onlineUsersList = Array.from(this.onlineUsers.values()).map(
      (user) => ({
        userId: user.userId,
        userData: user.userData,
      })
    );

    this.io.emit('online_users_update', onlineUsersList);
  }

  private async createMessageNotification(
    senderId: string,
    receiverId: string,
    content: string,
    messageId: string
  ) {
    try {
      const sender = await User.findById(senderId);
      if (!sender) return;

      const notification = new Notification({
        userId: receiverId,
        type: 'message',
        title: `New message from ${sender.name || sender.UserName}`,
        body: content.length > 50 ? content.substring(0, 50) + '...' : content,
        data: {
          senderId,
          messageId,
        },
        fromUserId: senderId,
        relatedId: messageId,
      });

      await notification.save();
    } catch (error) {
      console.error('Error creating message notification:', error);
    }
  }

  private async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      return await Message.countDocuments({
        receiverId: userId,
        read: false,
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // NEW: Get unread notification count
  private async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      return await Notification.countDocuments({
        userId: userId,
        read: false,
      });
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  }
}

export default ChatSocketHandler;
