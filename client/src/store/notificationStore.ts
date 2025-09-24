// src/store/notificationStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import api from "../utils/axiosInstance";
import { io, Socket } from "socket.io-client";
import { useCallback } from "react";

export type NotificationType =
  | "message"
  | "job_posted"
  | "proposal_received"
  | "proposal_accepted"
  | "job_completed"
  | "payment_received"
  | "rating_received";

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  relatedId?: string;
  fromUserId?: {
    _id: string;
    name?: string;
    UserName?: string;
    profilePic?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SendNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  relatedId?: string;
  fromUserId?: string;
}

interface NotificationStore {
  // State
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  socket: Socket | null;
  isConnected: boolean;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;

  // Socket Actions
  initializeSocket: () => void;
  disconnectSocket: () => void;
  sendNotification: (data: SendNotificationData) => void;

  // API Actions
  fetchNotifications: (page?: number, unreadOnly?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  getUnreadCount: () => Promise<void>;

  // State Management
  addNewNotification: (notification: INotification) => void;
  setError: (error: string | null) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      socket: null,
      isConnected: false,
      currentPage: 1,
      totalPages: 1,
      hasMore: true,

      // Initialize Socket Connection
      initializeSocket: () => {
        const { socket } = get();

        // Disconnect existing socket
        if (socket) {
          socket.disconnect();
        }

        const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

        // Create new socket connection to notification namespace
        const newSocket = io(`${socketUrl}/notifications`, {
          withCredentials: true,
          autoConnect: true,
        });

        newSocket.on("connect", () => {
          console.log("Connected to notification socket");
          set({ isConnected: true });
        });

        newSocket.on("disconnect", () => {
          console.log("Disconnected from notification socket");
          set({ isConnected: false });
        });

        // Listen for incoming notifications
        newSocket.on("receive_notification", (notification: INotification) => {
          console.log("Received notification:", notification);
          get().addNewNotification(notification);
        });

        // Listen for send confirmation
        newSocket.on(
          "notification_sent",
          (response: { success: boolean; notificationId: string }) => {
            console.log("Notification sent successfully:", response);
          }
        );

        // Listen for errors
        newSocket.on("notification_error", (error: { message: string }) => {
          console.error("Notification error:", error);
          set({ error: error.message });
        });

        set({ socket: newSocket });
      },

      // Disconnect Socket
      disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
          set({ socket: null, isConnected: false });
        }
      },

      // Send Notification via Socket
      sendNotification: (data: SendNotificationData) => {
        const { socket, isConnected } = get();

        if (!socket || !isConnected) {
          set({ error: "Socket not connected" });
          return;
        }

        socket.emit("send_notification", data);
      },

      // Fetch Notifications from API
      fetchNotifications: async (page = 1, unreadOnly = false) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.get("/notifications", {
            params: {
              page,
              limit: 20,
              unreadOnly: unreadOnly.toString(),
            },
          });

          const { notifications, unreadCount, pagination } = response.data;

          if (page === 1) {
            set({
              notifications,
              unreadCount,
              currentPage: pagination.page,
              totalPages: pagination.totalPages,
              hasMore: pagination.page < pagination.totalPages,
            });
          } else {
            set((state) => ({
              notifications: [...state.notifications, ...notifications],
              currentPage: pagination.page,
              hasMore: pagination.page < pagination.totalPages,
            }));
          }
        } catch (error: any) {
          console.error("Error fetching notifications:", error);
          set({ error: error.response?.data?.message || "Failed to fetch notifications" });
        } finally {
          set({ isLoading: false });
        }
      },

      // Mark notification as read
      markAsRead: async (notificationId: string) => {
        try {
          const response = await api.patch(`/notifications/${notificationId}/read`);
          const { unreadCount } = response.data;

          set((state) => ({
            notifications: state.notifications.map((n) =>
              n._id === notificationId ? { ...n, read: true } : n
            ),
            unreadCount,
          }));
        } catch (error: any) {
          console.error("Error marking notification as read:", error);
          set({ error: error.response?.data?.message || "Failed to mark as read" });
        }
      },

      // Mark all notifications as read
      markAllAsRead: async () => {
        try {
          await api.patch("/notifications/read-all");
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          }));
        } catch (error: any) {
          console.error("Error marking all notifications as read:", error);
          set({ error: error.response?.data?.message || "Failed to mark all as read" });
        }
      },

      // Delete notification
      deleteNotification: async (notificationId: string) => {
        try {
          const response = await api.delete(`/notifications/${notificationId}`);
          const { unreadCount } = response.data;

          set((state) => ({
            notifications: state.notifications.filter((n) => n._id !== notificationId),
            unreadCount,
          }));
        } catch (error: any) {
          console.error("Error deleting notification:", error);
          set({ error: error.response?.data?.message || "Failed to delete notification" });
        }
      },

      // Get unread count
      getUnreadCount: async () => {
        try {
          const response = await api.get("/notifications/unread-count");
          set({ unreadCount: response.data.unreadCount });
        } catch (error: any) {
          console.error("Error fetching unread count:", error);
        }
      },

      // Add new notification to state
      addNewNotification: (notification: INotification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + (notification.read ? 0 : 1),
        }));
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },

      // Clear notifications
      clearNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
          currentPage: 1,
          totalPages: 1,
          hasMore: true,
        });
      },
    }),
    {
      name: "notification-store",
    }
  )
);

// Helper hook for sending notifications
export const useNotificationSender = () => {
  const { sendNotification, isConnected } = useNotificationStore();

  const send = (data: SendNotificationData) => {
    if (isConnected) {
      sendNotification(data);
    } else {
      console.warn("Notification socket not connected");
    }
  };

  return {
    sendNotification: send,
    isConnected,
  };
};

// Hook to initialize notifications (use in App.tsx)
export const useNotificationInit = () => {
  // Select only the actions to avoid subscribing to the entire store
  const initializeSocket = useNotificationStore((s) => s.initializeSocket);
  const disconnectSocket = useNotificationStore((s) => s.disconnectSocket);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const getUnreadCount = useNotificationStore((s) => s.getUnreadCount);

  // Memoize the initialize function to prevent infinite re-renders
  const initialize = useCallback(async () => {
    try {
      // Initialize socket
      initializeSocket();

      // Fetch initial data
      await Promise.all([fetchNotifications(1), getUnreadCount()]);
    } catch (error) {
      console.error("Error initializing notifications:", error);
    }
  }, [initializeSocket, fetchNotifications, getUnreadCount]);

  // Memoize the cleanup function to prevent infinite re-renders
  const cleanup = useCallback(() => {
    disconnectSocket();
  }, [disconnectSocket]);

  return {
    initialize,
    cleanup,
  };
};
