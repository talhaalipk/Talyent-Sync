// src/sockets/videoCallSocket.ts
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../Models/user';
import * as cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

interface VideoCallUser {
  userId: string;
  socketId: string;
  userName: string;
  profilePic: string;
  isOnCall: boolean;
  currentCallWith?: string;
}

class VideoCallSocketHandler {
  private io: Server;
  private videoCallNamespace: any;
  private onlineUsers: Map<string, VideoCallUser> = new Map();
  private activeRooms: Map<string, { userA: string; userB: string }> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.videoCallNamespace = io.of('/videocall');
    this.initialize();

    console.log('🎥 Video Call Socket Handler initialized');
  }

  private initialize() {
    this.videoCallNamespace.use(this.authenticateSocket.bind(this));
    this.videoCallNamespace.on('connection', this.handleConnection.bind(this));
  }

  private async authenticateSocket(socket: Socket, next: Function) {
    try {
      console.log('🔐 Authenticating video call socket...');
      console.log('🍪 Socket handshake headers:', socket.handshake.headers);

      // Extract token from httpOnly cookie in the headers
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) {
        console.log('No cookies found');
        return next(new Error('Authentication error: No cookies provided'));
      }

      // Parse cookies
      const cookies = cookie.parse(rawCookie);
      const token = cookies['token']; // extract token
      console.log('TOKEN : ', token);

      console.log('🔑 Extracted token from cookie:', token ? 'Found' : 'Not found');

      if (!token) {
        console.log('❌ No token found in cookies');
        return next(new Error('No token provided'));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      console.log('✅ Token decoded successfully for user:', decoded.id);

      const user = await User.findById(decoded.id).select('_id UserName profilePic isActive');

      if (!user || !user.isActive) {
        console.log('❌ Invalid or inactive user for video call socket');
        return next(new Error('Invalid or inactive user'));
      }

      socket.data.userId = (user._id as any).toString();
      socket.data.userName = user.UserName || 'Unknown User';
      socket.data.profilePic = user.profilePic || '';

      console.log(`✅ Video call socket authenticated for user: ${socket.data.userName} (${socket.data.userId})`);
      next();
    } catch (error) {
      console.log('❌ Video call socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  }

  private handleConnection(socket: Socket) {
    console.log(`🔌 Video call user connected: ${socket.data.userName} (${socket.id})`);

    // Add user to online users
    this.onlineUsers.set(socket.data.userId, {
      userId: socket.data.userId,
      socketId: socket.id,
      userName: socket.data.userName,
      profilePic: socket.data.profilePic,
      isOnCall: false
    });

    // Emit updated online users
    this.emitOnlineUsers();

    // Handle incoming call
    socket.on('initiate-call', this.handleInitiateCall.bind(this, socket));

    // Handle call response
    socket.on('call-response', this.handleCallResponse.bind(this, socket));

    // Handle WebRTC signaling
    socket.on('webrtc-offer', this.handleWebRTCOffer.bind(this, socket));
    socket.on('webrtc-answer', this.handleWebRTCAnswer.bind(this, socket));
    socket.on('webrtc-ice-candidate', this.handleWebRTCIceCandidate.bind(this, socket));

    // Handle call end
    socket.on('end-call', this.handleEndCall.bind(this, socket));

    // Handle screen share
    socket.on('screen-share-start', this.handleScreenShareStart.bind(this, socket));
    socket.on('screen-share-stop', this.handleScreenShareStop.bind(this, socket));

    // Handle disconnect
    socket.on('disconnect', this.handleDisconnect.bind(this, socket));
  }

  private handleInitiateCall(socket: Socket, data: { targetUserId: string; roomId: string }) {
    console.log(`📞 Call initiated by ${socket.data.userName} to user ${data.targetUserId}`);

    const targetUser = this.onlineUsers.get(data.targetUserId);

    if (!targetUser) {
      console.log('❌ Target user not online for call');
      socket.emit('call-error', { message: 'User is not online' });
      return;
    }

    if (targetUser.isOnCall) {
      console.log('❌ Target user is already on a call');
      socket.emit('call-error', { message: 'User is already on a call' });
      return;
    }

    // Update caller status
    const callerUser = this.onlineUsers.get(socket.data.userId);
    if (callerUser) {
      callerUser.isOnCall = true;
      callerUser.currentCallWith = data.targetUserId;
    }

    // Create room
    this.activeRooms.set(data.roomId, {
      userA: socket.data.userId,
      userB: data.targetUserId
    });

    console.log(`📱 Sending incoming call to ${targetUser.userName}`);

    // Emit to target user
    this.videoCallNamespace.to(targetUser.socketId).emit('incoming-call', {
      callerId: socket.data.userId,
      callerName: socket.data.userName,
      callerProfilePic: socket.data.profilePic,
      roomId: data.roomId
    });

    this.emitOnlineUsers();
  }

  private handleCallResponse(socket: Socket, data: { accepted: boolean; callerId: string; roomId: string }) {
    console.log(`📞 Call response from ${socket.data.userName}: ${data.accepted ? 'ACCEPTED' : 'REJECTED'}`);

    const callerUser = this.onlineUsers.get(data.callerId);

    if (!callerUser) {
      console.log('❌ Caller user not found');
      return;
    }

    if (data.accepted) {
      // Update both users status
      const receiverUser = this.onlineUsers.get(socket.data.userId);
      if (receiverUser) {
        receiverUser.isOnCall = true;
        receiverUser.currentCallWith = data.callerId;
      }

      console.log(`✅ Call accepted, both users joining room: ${data.roomId}`);

      // Join both users to room
      socket.join(data.roomId);
      this.videoCallNamespace.sockets.get(callerUser.socketId)?.join(data.roomId);

      // Notify caller that call was accepted
      this.videoCallNamespace.to(callerUser.socketId).emit('call-accepted', {
        roomId: data.roomId,
        receiverId: socket.data.userId,
        receiverName: socket.data.userName
      });

      // Notify receiver to start call
      socket.emit('call-started', {
        roomId: data.roomId,
        peerId: data.callerId,
        peerName: callerUser.userName
      });

    } else {
      // Call rejected
      if (callerUser) {
        callerUser.isOnCall = false;
        callerUser.currentCallWith = undefined;
      }

      // Remove room
      this.activeRooms.delete(data.roomId);

      console.log(`❌ Call rejected by ${socket.data.userName}`);

      this.videoCallNamespace.to(callerUser.socketId).emit('call-rejected', {
        rejectedBy: socket.data.userName
      });
    }

    this.emitOnlineUsers();
  }

  private handleWebRTCOffer(socket: Socket, data: { offer: any; targetUserId: string; roomId: string }) {
    console.log(`🔄 WebRTC offer from ${socket.data.userName} to ${data.targetUserId}`);

    const targetUser = this.onlineUsers.get(data.targetUserId);
    if (targetUser) {
      this.videoCallNamespace.to(targetUser.socketId).emit('webrtc-offer', {
        offer: data.offer,
        fromUserId: socket.data.userId,
        roomId: data.roomId
      });
    }
  }

  private handleWebRTCAnswer(socket: Socket, data: { answer: any; targetUserId: string; roomId: string }) {
    console.log(`🔄 WebRTC answer from ${socket.data.userName} to ${data.targetUserId}`);

    const targetUser = this.onlineUsers.get(data.targetUserId);
    if (targetUser) {
      this.videoCallNamespace.to(targetUser.socketId).emit('webrtc-answer', {
        answer: data.answer,
        fromUserId: socket.data.userId,
        roomId: data.roomId
      });
    }
  }

  private handleWebRTCIceCandidate(socket: Socket, data: { candidate: any; targetUserId: string; roomId: string }) {
    console.log(`🧊 ICE candidate from ${socket.data.userName} to ${data.targetUserId}`);

    const targetUser = this.onlineUsers.get(data.targetUserId);
    if (targetUser) {
      this.videoCallNamespace.to(targetUser.socketId).emit('webrtc-ice-candidate', {
        candidate: data.candidate,
        fromUserId: socket.data.userId,
        roomId: data.roomId
      });
    }
  }

  private handleScreenShareStart(socket: Socket, data: { roomId: string; targetUserId: string }) {
    console.log(`🖥️ Screen share started by ${socket.data.userName}`);

    const targetUser = this.onlineUsers.get(data.targetUserId);
    if (targetUser) {
      this.videoCallNamespace.to(targetUser.socketId).emit('peer-screen-share-start', {
        fromUserId: socket.data.userId,
        roomId: data.roomId
      });
    }
  }

  private handleScreenShareStop(socket: Socket, data: { roomId: string; targetUserId: string }) {
    console.log(`🖥️ Screen share stopped by ${socket.data.userName}`);

    const targetUser = this.onlineUsers.get(data.targetUserId);
    if (targetUser) {
      this.videoCallNamespace.to(targetUser.socketId).emit('peer-screen-share-stop', {
        fromUserId: socket.data.userId,
        roomId: data.roomId
      });
    }
  }

  private handleEndCall(socket: Socket, data: { roomId: string; targetUserId?: string }) {
    console.log(`☎️ Call ended by ${socket.data.userName}`);

    const room = this.activeRooms.get(data.roomId);
    if (room) {
      const otherUserId = room.userA === socket.data.userId ? room.userB : room.userA;
      const otherUser = this.onlineUsers.get(otherUserId);

      // Update users status
      const currentUser = this.onlineUsers.get(socket.data.userId);
      if (currentUser) {
        currentUser.isOnCall = false;
        currentUser.currentCallWith = undefined;
      }

      if (otherUser) {
        otherUser.isOnCall = false;
        otherUser.currentCallWith = undefined;

        // Notify other user
        this.videoCallNamespace.to(otherUser.socketId).emit('call-ended', {
          endedBy: socket.data.userName,
          roomId: data.roomId
        });
      }

      // Clean up room
      this.videoCallNamespace.in(data.roomId).socketsLeave(data.roomId);
      this.activeRooms.delete(data.roomId);
    }

    this.emitOnlineUsers();
  }

  private handleDisconnect(socket: Socket) {
    console.log(`🔌 Video call user disconnected: ${socket.data.userName}`);

    const user = this.onlineUsers.get(socket.data.userId);
    if (user?.isOnCall && user.currentCallWith) {
      // End any active call
      this.handleEndCall(socket, {
        roomId: `${socket.data.userId}-${user.currentCallWith}`,
        targetUserId: user.currentCallWith
      });
    }

    // Remove from online users
    this.onlineUsers.delete(socket.data.userId);
    this.emitOnlineUsers();
  }

  private emitOnlineUsers() {
    const onlineUsersList = Array.from(this.onlineUsers.values()).map(user => ({
      userId: user.userId,
      userName: user.userName,
      profilePic: user.profilePic,
      isOnCall: user.isOnCall
    }));

    console.log(`👥 Emitting online users count: ${onlineUsersList.length}`);
    this.videoCallNamespace.emit('online-users-updated', { users: onlineUsersList });
  }
}

export default VideoCallSocketHandler;