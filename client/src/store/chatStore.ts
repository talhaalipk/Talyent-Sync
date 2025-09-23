// stores/chatStore.ts
import { create } from "zustand";
import { Socket } from "socket.io-client";
import api from "../utils/axiosInstance"; // Your existing axios instance
import { socket } from "../utils/socket";

export interface User {
  _id: string;
  name?: string;
  UserName?: string;
  profilePic?: string;
  role: string;
}

export interface Message {
  _id: string;
  senderId: User;
  receiverId: User;
  content: string;
  messageType: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  _id: string;
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface OnlineUser {
  userId: string;
  userData: User;
}

export interface TypingUser {
  userId: string;
  userData: User;
}

interface ChatState {
  // Socket connection
  socket: Socket | null;
  isConnected: boolean;

  // Chat data
  conversations: Conversation[];
  currentMessages: Message[];
  selectedConversationId: string | null;
  currentReceiverInfo: User | null;

  // Real-time features
  onlineUsers: OnlineUser[];
  typingUsers: TypingUser[];

  // UI states
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  isLoadingReceiverInfo: boolean;
  isNewConversation: boolean;

  // Actions
  initializeSocket: () => void;
  disconnectSocket: () => void;

  // Conversation actions
  loadConversations: () => Promise<void>;
  selectConversation: (receiverId: string) => void;
  loadReceiverInfo: (receiverId: string) => Promise<void>;

  // Message actions
  loadMessages: (receiverId: string, page?: number) => Promise<void>;
  sendMessage: (receiverId: string, content: string) => void;
  sendFileMessage: (receiverId: string, file: File) => Promise<void>;

  // Real-time actions
  startTyping: (receiverId: string) => void;
  stopTyping: (receiverId: string) => void;
  markMessagesAsRead: (senderId: string) => void;

  // Helper functions
  addNewMessage: (message: Message) => void;
  updateConversationList: () => void;
  resetChatState: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  socket: null,
  isConnected: false,
  conversations: [],
  currentMessages: [],
  selectedConversationId: null,
  currentReceiverInfo: null,
  onlineUsers: [],
  typingUsers: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  isLoadingReceiverInfo: false,
  isNewConversation: false,

  // Initialize socket connection
  // Initialize socket connection
  // Initialize socket connection
  // Initialize socket connection
  initializeSocket: () => {
    const existingSocket = get().socket;

    // If socket exists and is connected, just update state
    if (existingSocket && existingSocket.connected) {
      console.log("Socket already connected, updating state");
      set({ isConnected: true });
      return;
    }

    // Remove existing listeners to prevent duplicates
    socket.removeAllListeners();

    set({ socket });

    socket.on("connect", () => {
      console.log("socket connet ma");
      console.log("Connected to chat server");
      set({ isConnected: true });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from chat server");
      set({ isConnected: false });
    });

    socket.on("receive_message", (message: Message) => {
      const state = get();
      console.log("recive message");
      // Add message to current chat if it's the active conversation
      if (state.selectedConversationId === message.senderId._id) {
        state.addNewMessage(message);
      }

      // Update conversation list
      state.updateConversationList();
    });

    socket.on("message_sent", (message: Message) => {
      get().addNewMessage(message);
      set({ isSendingMessage: false });
    });

    socket.on("online_users_update", (users: OnlineUser[]) => {
      console.log("Online users updated:", users); // Debug log
      set({ onlineUsers: users });
    });

    socket.on("user_typing", (data: TypingUser) => {
      const state = get();
      const typingUsers = state.typingUsers.filter((u) => u.userId !== data.userId);
      set({ typingUsers: [...typingUsers, data] });
    });

    socket.on("user_stopped_typing", (data: { userId: string }) => {
      const state = get();
      const typingUsers = state.typingUsers.filter((u) => u.userId !== data.userId);
      set({ typingUsers });
    });

    socket.on("messages_read", () => {
      // Update messages as read in current chat
      const state = get();
      const updatedMessages = state.currentMessages.map((msg) => ({
        ...msg,
        read: true,
        readAt: new Date(),
      }));
      set({ currentMessages: updatedMessages });
    });

    socket.on("message_error", (error) => {
      console.error("Message error:", error.message);
      set({ isSendingMessage: false });
    });

    // Set initial connection state
    set({ socket, isConnected: socket.connected });
  },

  // Disconnect socket
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  // Load conversations
  loadConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const response = await api.get("/chat/conversations");
      set({ conversations: response.data.conversations });
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  // Load receiver info for new conversations
  loadReceiverInfo: async (receiverId: string) => {
    set({ isLoadingReceiverInfo: true });
    try {
      const response = await api.get(`/chat/user/${receiverId}`);
      set({ currentReceiverInfo: response.data.user });
    } catch (error) {
      console.error("Failed to load receiver info:", error);
      set({ currentReceiverInfo: null });
    } finally {
      set({ isLoadingReceiverInfo: false });
    }
  },

  // Select conversation
  selectConversation: (receiverId: string) => {
    const { socket } = get();

    // Leave previous chat room
    if (get().selectedConversationId && socket) {
      socket.emit("leave_chat", { receiverId: get().selectedConversationId });
    }

    set({
      selectedConversationId: receiverId,
      currentMessages: [],
      isNewConversation: false,
      currentReceiverInfo: null,
    });

    // Join new chat room
    if (socket) {
      socket.emit("join_chat", { receiverId });
    }

    // Load messages and receiver info
    get().loadMessages(receiverId);
    get().loadReceiverInfo(receiverId);
  },

  // Load messages
  loadMessages: async (receiverId: string, page = 1) => {
    set({ isLoadingMessages: true });
    try {
      const response = await api.get(`/chat/messages/${receiverId}?page=${page}&limit=50`);
      const messages = response.data.messages;
      set({
        currentMessages: messages,
        isNewConversation: messages.length === 0,
      });
      get().updateConversationList();
    } catch (error) {
      console.error("Failed to load messages:", error);
      set({ isNewConversation: true });
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  // Send message
  sendMessage: (receiverId: string, content: string) => {
    const { socket } = get();
    if (!socket || !content.trim()) return;

    set({ isSendingMessage: true });
    socket.emit("send_message", {
      receiverId,
      content: content.trim(),
      messageType: "text",
    });
  },

  // Send file message
  sendFileMessage: async (receiverId: string, file: File) => {
    set({ isSendingMessage: true });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("receiverId", receiverId);
      formData.append("messageType", file.type.startsWith("image/") ? "image" : "file");

      const response = await api.post("/chat/send-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        // Send socket event for real-time delivery
        const { socket } = get();
        const message = response.data.message;

        if (socket) {
          socket.emit("send_message", {
            receiverId,
            content: message.content,
            messageType: message.messageType,
            fileUrl: message.fileUrl,
            fileName: message.fileName,
            fileSize: message.fileSize,
            _id: message._id,
          });
        }
      }
    } catch (error) {
      console.error("Failed to send file:", error);
      set({ isSendingMessage: false });
    }
  },

  // Start typing
  startTyping: (receiverId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit("typing", { receiverId });
    }
  },

  // Stop typing
  stopTyping: (receiverId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit("stop_typing", { receiverId });
    }
  },

  // Mark messages as read
  markMessagesAsRead: (senderId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit("mark_as_read", { senderId });
      get().updateConversationList();
    }
  },

  // Add new message
  addNewMessage: (message: Message) => {
    const state = get();
    const isDuplicate = state.currentMessages.some((msg) => msg._id === message._id);

    if (!isDuplicate) {
      set({
        currentMessages: [...state.currentMessages, message],
        isNewConversation: false,
      });
    }
  },

  // Update conversation list
  updateConversationList: () => {
    // Reload conversations to get updated unread counts
    get().loadConversations();
  },

  // Reset chat state
  resetChatState: () => {
    set({
      conversations: [],
      currentMessages: [],
      selectedConversationId: null,
      currentReceiverInfo: null,
      onlineUsers: [],
      typingUsers: [],
      isNewConversation: false,
    });
  },
}));
