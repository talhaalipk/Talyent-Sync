import React, { useEffect, useState } from "react";
import { useNotificationStore } from "../store/notificationStore"; // Adjust path as needed
import type { INotification } from "../store/notificationStore"; // Adjust path as needed
import { formatDistanceToNow } from "date-fns";

// ------------- Notification Page Component -------------
const NotificationPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    currentPage,
    setError,
  } = useNotificationStore();

  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  // Handle mark individual notification as read
  const handleMarkAsRead = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
  };

  // Handle delete notification
  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  // Load more notifications
  const loadMoreNotifications = async () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      await fetchNotifications(currentPage + 1);
      setLoadingMore(false);
    }
  };

  // Format notification date
  const formatNotificationDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "job_posted":
        return "💼";
      case "proposal_received":
        return "📝";
      case "proposal_accepted":
        return "✅";
      case "job_completed":
        return "🎉";
      case "payment_received":
        return "💰";
      case "rating_received":
        return "⭐";
      case "message":
        return "💬";
      default:
        return "🔔";
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-[calc(100vh-80px)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#134848]">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={isLoading || unreadCount === 0}
            className="bg-[#2E90EB] text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        </div>
      )}

      {isLoading && notifications.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#134848]"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification: INotification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg shadow-sm border ${
                notification.read
                  ? "bg-gray-50 border-gray-200"
                  : "bg-white border-gray-300 border-l-4 border-l-[#2E90EB]"
              } transition cursor-pointer hover:shadow-md`}
              onClick={() => handleMarkAsRead(notification._id, notification.read)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h2
                        className={`text-lg font-semibold ${
                          notification.read ? "text-gray-600" : "text-[#134848]"
                        }`}
                      >
                        {notification.title}
                      </h2>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-[#2E90EB] rounded-full ml-2 flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{notification.body}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatNotificationDate(notification.createdAt)}
                      </span>
                      {notification.fromUserId?.name && (
                        <span className="text-xs text-gray-500">
                          from {notification.fromUserId.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification._id);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-2 p-1"
                  title="Delete notification"
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          {notifications.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔔</div>
              <p className="text-gray-500 text-lg">No notifications yet</p>
              <p className="text-gray-400 text-sm mt-2">
                When you receive notifications, they'll appear here
              </p>
            </div>
          )}

          {hasMore && notifications.length > 0 && (
            <div className="flex justify-center pt-6">
              <button
                onClick={loadMoreNotifications}
                disabled={loadingMore}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition disabled:opacity-50"
              >
                {loadingMore ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
