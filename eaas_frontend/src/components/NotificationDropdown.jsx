import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, X, AlertCircle, Clock, CheckCheck, Send, CheckCircle, Trash2, User, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotificationDropdown = ({ user, isOpen, onClose, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && user?.user_id) {
      fetchNotifications();
    }
  }, [isOpen, user?.user_id]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/document/notifications/${user.user_id}`
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

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/document/notification/${id}/read`,
        { method: "PUT" }
      );
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, is_read: true } : notif
          )
        );
        
        if (onUnreadCountChange) {
            const unreadCount = notifications.filter(n => n.id !== id && !n.is_read).length;
            onUnreadCountChange(unreadCount);
            setUnreadCount(unreadCount);
        }
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/document/notifications/${user.user_id}/clear`,
        { method: "DELETE" }
      );
      
      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
        if (onUnreadCountChange) {
            onUnreadCountChange(0);
        }
      }
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/document/notifications/mark-read/${user.user_id}`,
        { method: 'POST' }
      );
      if (response.ok) {
        // Update local state
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
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

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    onClose();
    
    // Navigate based on notification type and user role
    if (notification.notification_type === 'submitted' && user?.role === 'reviewer') {
      // Reviewer clicked on new submission notification -> go to pending reviews
      navigate(`/pending-reviews`);
    } else if (notification.document_id) {
      // Employee clicked on approved/declined notification -> go to submissions
      navigate(`/submissions`);
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

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
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
      case 'document_autosaved':
        return {
          icon: <Clock size={16} />,
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          badgeColor: 'bg-yellow-500'
        };
      case 'profile_updated':
        return {
          icon: <User size={16} />,
          bgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          badgeColor: 'bg-purple-500'
        };
      case 'password_changed':
        return {
          icon: <Key size={16} />,
          bgColor: 'bg-orange-100',
          iconColor: 'text-orange-600',
          badgeColor: 'bg-orange-500'
        };
      case 'user_registered':
      case 'user_role_changed':
      case 'user_updated':
      case 'user_deleted':
      case 'position_created':
      case 'position_deleted':
      case 'office_location_created':
      case 'office_location_deleted':
      case 'document_submitted':
      case 'document_approved':
      case 'document_declined':
        return {
          icon: <Bell size={16} />,
          bgColor: 'bg-indigo-100',
          iconColor: 'text-indigo-600',
          badgeColor: 'bg-indigo-500'
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

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 999998, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        onClick={onClose}
      />

      {/* Dropdown */}
      <div 
        className="fixed top-16 right-4 sm:right-6 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transform origin-top-right transition-all"
        style={{ zIndex: 999999 }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-gray-600" />
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
                title="Clear all notifications"
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors md:hidden"
            >
              <X size={18} />
            </button>
          </div>
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
        <div className="max-h-96 overflow-y-auto bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <Bell size={20} className="opacity-50" />
              </div>
              <p className="text-sm font-medium text-gray-900">No notifications</p>
              <p className="text-xs mt-1">You'll see document updates here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notif) => {
                const style = getNotificationStyle(notif.notification_type);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors relative group ${
                      !notif.is_read ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${style.bgColor}`}>
                        <span className={style.iconColor}>{style.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm mb-0.5 ${!notif.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notif.title || 'Document Update'}
                          </p>
                          {!notif.is_read && (
                            <span className={`w-2 h-2 rounded-full ${style.badgeColor}`}></span>
                          )}
                        </div>
                        <p className={`text-xs leading-relaxed ${!notif.is_read ? 'text-gray-600' : 'text-gray-500'}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-medium">
                          <Clock size={12} />
                          <span>
                            {notif.notification_type === 'submitted' 
                              ? formatTimeAgo(notif.created_at || notif.submitted_at)
                              : formatTimeAgo(notif.created_at || notif.reviewed_at)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Read indicator dot */}
                    {!notif.is_read && (
                      <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-600 rounded-full hidden md:block" />
                    )}
                    
                    {/* Mark as read button (visible on hover) */}
                    {!notif.is_read && (
                      <button 
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        className="absolute bottom-4 right-4 text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-center sticky bottom-0">
            <button 
              onClick={() => {
                onClose();
                navigate(user?.role === 'reviewer' ? '/pending-reviews' : '/submissions');
              }}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {user?.role === 'reviewer' ? 'View all pending reviews' : 'View all submissions'}
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

export default NotificationDropdown;