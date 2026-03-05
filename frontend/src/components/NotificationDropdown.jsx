import React, { useState, useEffect } from "react";
import { Bell, X, AlertCircle, Clock, CheckCheck, Send, CheckCircle } from "lucide-react";

const NotificationDropdown = ({ user, isOpen, onClose, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user?.user_id) {
      fetchNotifications();
    }
  }, [isOpen, user?.user_id]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/document/notifications/${user.user_id}`
      );
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        const count = data.unread_count || 0;
        setUnreadCount(count);
        // Update parent component with unread count
        if (onUnreadCountChange) {
          onUnreadCountChange(count);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/document/notifications/mark-read/${user.user_id}`,
        { method: 'POST' }
      );
      if (response.ok) {
        // Update local state
        setNotifications(prev => prev.map(n => ({ ...n, notification_read: true })));
        setUnreadCount(0);
        // Update parent component
        if (onUnreadCountChange) {
          onUnreadCountChange(0);
        }
      }
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get icon and color based on notification type
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'submitted':
        return {
          icon: <Send size={16} />,
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          badgeColor: 'bg-blue-500'
        };
      case 'approved':
        return {
          icon: <CheckCircle size={16} />,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          badgeColor: 'bg-green-500'
        };
      case 'declined':
        return {
          icon: <AlertCircle size={16} />,
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          badgeColor: 'bg-red-500'
        };
      default:
        return {
          icon: <Bell size={16} />,
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-600',
          badgeColor: 'bg-gray-500'
        };
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-gray-600" />
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mark All as Read Button */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <CheckCheck size={16} />
              Mark all as read ({unreadCount})
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Bell size={32} className="mb-2 opacity-50" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs">You'll see document updates here</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const style = getNotificationStyle(notification.notification_type);
              return (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 transition-colors ${
                    notification.notification_read ? 'bg-white' : style.bgColor.replace('100', '50')
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${style.bgColor}`}>
                      <span className={style.iconColor}>{style.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.notification_title || 'Document Update'}
                        </p>
                        {!notification.notification_read && (
                          <span className={`w-2 h-2 rounded-full ${style.badgeColor}`}></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {notification.document_name}
                      </p>
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 italic">
                          "{notification.reviewer_note}"
                        </p>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>
                          {notification.notification_type === 'submitted' 
                            ? formatDate(notification.submitted_at)
                            : formatDate(notification.reviewed_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-center text-gray-500">
              Check My Submissions for more details
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;