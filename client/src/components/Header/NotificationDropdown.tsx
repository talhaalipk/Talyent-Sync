import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useNotificationStore } from "../../store/notificationStore"; // Adjust path as needed
import type { INotification } from "../../store/notificationStore"; // Adjust path as needed
import { formatDistanceToNow } from "date-fns";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
  } = useNotificationStore();

  // Get top 4 most recent notifications for dropdown
  const recentNotifications = notifications.slice(0, 4);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications when dropdown opens (if empty)
  useEffect(() => {
    if (open && notifications.length === 0) {
      fetchNotifications(1);
    }
  }, [open, notifications.length, fetchNotifications]);

  // Periodically update unread count
  useEffect(() => {
    const interval = setInterval(() => {
      getUnreadCount();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [getUnreadCount]);

  // Handle notification click
  const handleNotificationClick = async (notification: INotification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    setOpen(false);
  };

  // Format notification date for dropdown
  const formatDropdownDate = (dateString: string) => {
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

  // Truncate text for dropdown display
  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="w-5 h-5 text-[#134848]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-[#134848]">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <>
                    <span className="text-sm text-gray-500">{unreadCount} unread</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      disabled={isLoading}
                      className="text-xs text-[#2E90EB] hover:text-blue-600 font-medium disabled:opacity-50"
                    >
                      Mark all read
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#134848]"></div>
              </div>
            ) : recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0 ${
                    !notification.read ? "bg-blue-50 border-l-4 border-l-[#2E90EB]" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className={`text-sm font-medium truncate ${
                            !notification.read ? "text-[#134848]" : "text-gray-600"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-[#2E90EB] rounded-full ml-2 flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1 leading-relaxed">
                        {truncateText(notification.body)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatDropdownDate(notification.createdAt)}
                        </span>
                        {notification.fromUserId?.name && (
                          <span className="text-xs text-gray-400 truncate max-w-20">
                            {notification.fromUserId.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-gray-500 text-sm">No notifications</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 bg-gray-50">
            <Link
              to="/notifications"
              className="block text-center px-4 py-3 text-sm text-[#134848] hover:bg-gray-100 font-medium transition-colors"
              onClick={() => setOpen(false)}
            >
              {notifications.length > 4
                ? `See All ${notifications.length} Notifications`
                : "See All Notifications"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
