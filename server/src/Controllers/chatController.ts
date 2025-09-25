import { Response } from 'express';
import { Message } from '../Models/message';
import { User } from '../Models/user';
import { Notification } from '../Models/notification';
import mongoose from 'mongoose';
import { AuthRequest } from '../Middleware/auth';
import { uploadDocument } from '../config/cloudinary';

// Get all chat conversations for current user
export const getChatConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get all unique users who have chatted with current user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', new mongoose.Types.ObjectId(userId)] },
              '$receiverId',
              '$senderId',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ['$receiverId', new mongoose.Types.ObjectId(userId)],
                    },
                    { $eq: ['$read', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          unreadCount: 1,
          user: {
            _id: '$userInfo._id',
            name: '$userInfo.name',
            UserName: '$userInfo.UserName',
            profilePic: '$userInfo.profilePic',
            role: '$userInfo.role',
          },
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get chat messages between current user and another user
export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { receiverId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({
      $or: [
        {
          senderId: userId,
          receiverId: receiverId,
        },
        {
          senderId: receiverId,
          receiverId: userId,
        },
      ],
    })
      .populate('senderId', 'name UserName profilePic')
      .populate('receiverId', 'name UserName profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalMessages = await Message.countDocuments({
      $or: [
        {
          senderId: userId,
          receiverId: receiverId,
        },
        {
          senderId: receiverId,
          receiverId: userId,
        },
      ],
    });

    // Mark messages as read for current user
    await Message.updateMany(
      {
        senderId: receiverId,
        receiverId: userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalMessages,
        totalPages: Math.ceil(totalMessages / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a text message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { receiverId, content, messageType = 'text' } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ message: 'Receiver ID and content are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const message = new Message({
      senderId: userId,
      receiverId,
      content,
      messageType,
    });

    const savedMessage = await message.save();
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('senderId', 'name UserName profilePic')
      .populate('receiverId', 'name UserName profilePic');

    // Create notification for receiver
    const sender = await User.findById(userId);
    const notification = new Notification({
      userId: receiverId,
      type: 'message',
      title: `New message from ${sender?.name || sender?.UserName}`,
      body: content.length > 50 ? content.substring(0, 50) + '...' : content,
      data: {
        senderId: userId,
        messageId: savedMessage._id,
      },
      fromUserId: userId,
      relatedId: savedMessage._id,
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload and send file/image message
export const sendFileMessage = async (req: AuthRequest, res: Response) => {
  uploadDocument.single('file')(req, res, async (err) => {
    try {
      const userId = req.user?.id;
      const { receiverId, messageType } = req.body;

      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      if (!receiverId) {
        return res.status(400).json({ message: 'Receiver ID is required' });
      }

      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ message: 'Invalid receiver ID' });
      }

      // Check if receiver exists
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: 'Receiver not found' });
      }

      const message = new Message({
        senderId: userId,
        receiverId,
        content: req.file.originalname,
        messageType:
          messageType ||
          (req.file.mimetype.startsWith('image/') ? 'image' : 'file'),
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });

      const savedMessage = await message.save();
      const populatedMessage = await Message.findById(savedMessage._id)
        .populate('senderId', 'name UserName profilePic')
        .populate('receiverId', 'name UserName profilePic');

      // Create notification for receiver
      const sender = await User.findById(userId);
      const notification = new Notification({
        userId: receiverId,
        type: 'message',
        title: `New file from ${sender?.name || sender?.UserName}`,
        body: `Sent a ${messageType || 'file'}: ${req.file.originalname}`,
        data: {
          senderId: userId,
          messageId: savedMessage._id,
          fileUrl: req.file.path,
        },
        fromUserId: userId,
        relatedId: savedMessage._id,
      });

      await notification.save();

      res.status(201).json({
        success: true,
        message: populatedMessage,
      });
    } catch (error) {
      console.error('Error sending file message:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// Mark messages as read
export const markMessagesAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { senderId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: 'Invalid sender ID' });
    }

    await Message.updateMany(
      {
        senderId: senderId,
        receiverId: userId,
        read: false,
      },
      {
        read: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread message count
export const getUnreadMessageCount = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile for chat (for new conversations)
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { targetUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Get target user's basic profile info
    const targetUser = await User.findById(targetUserId).select(
      'name UserName profilePic role isActive'
    );

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!targetUser.isActive) {
      return res.status(404).json({ message: 'User is not available' });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        UserName: targetUser.UserName,
        profilePic: targetUser.profilePic,
        role: targetUser.role,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
