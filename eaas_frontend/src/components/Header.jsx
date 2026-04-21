import React, { useState, useEffect } from "react";
import { User, Settings, Key, Bell, HelpCircle, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";
import MessageDropdown from "./MessageDropdown";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Header({ role, setRole, user, onLogout }) {
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const navigate = useNavigate();

  const userName = user?.full_name || user?.name || user?.username || "User";
  const userRole = user?.role || "employee";

  const [imageHash, setImageHash] = useState(() => Date.now());

  useEffect(() => {
    setImageHash(Date.now());
  }, [user]);

  useEffect(() => {
    if (user?.user_id) {
      fetchUnreadCount();
      fetchUnreadMessageCount();

      const intervalId = setInterval(() => {
        fetchUnreadCount();
        fetchUnreadMessageCount();
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [user?.user_id]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/document/notifications/${user.user_id}?_t=${Date.now()}`,
        { headers: { 'Cache-Control': 'no-cache' } }
      );
      if (response.ok) {
        const data = await response.json();
        setUnreadNotificationCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnreadMessageCount = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/messages/unread/${user.user_id}?_t=${Date.now()}`,
        { headers: { 'Cache-Control': 'no-cache' } }
      );
      if (response.ok) {
        const data = await response.json();
        setUnreadMessageCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnreadCountChange = (count) => {
    setUnreadNotificationCount(count);
  };

  const handleMessageUnreadCountChange = (count) => {
    setUnreadMessageCount(count);
  };

  const handleNavigate = (tab) => {
    setShowDropdown(false);
    navigate(`/profile?tab=${tab}`);
  };

  const handleNotificationClick = () => {
    setShowDropdown(false);
    setShowMessages(false);
    setShowNotifications(!showNotifications);
  };

  const handleMessagesClick = () => {
    setShowDropdown(false);
    setShowNotifications(false);
    setShowMessages(!showMessages);
  };

  return (
    <header className="h-20 border-b border-blue-900/40 flex items-center justify-between px-4 md:px-6 bg-gradient-to-r from-[#1c1a88] via-[#1b3baf] to-[#1554c9] shadow-sm">
      <div className="min-w-0">
        <h1 className="text-base md:text-lg font-semibold text-white truncate">
          Employee Attendance and Accomplishment System
        </h1>
        <p className="hidden md:block text-xs text-blue-100/90 mt-0.5">
          Attendance and document workflow
        </p>
      </div>

      <div className="flex items-center gap-2 md:gap-2.5">

        {(user?.role === 'employee' || user?.role === 'reviewer' || user?.role === 'admin') && (
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/10 hover:border-white/30"
            >
              <Bell size={20} />
            </button>
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
            
            <NotificationDropdown 
              user={user}
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onUnreadCountChange={handleUnreadCountChange}
            />
          </div>
        )}

        {(user?.role === 'employee' || user?.role === 'reviewer' || user?.role === 'admin') && (
          <div className="relative">
            <button
              onClick={handleMessagesClick}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/10 hover:border-white/30"
            >
              <MessageSquare size={20} />
            </button>
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )}
            
            <MessageDropdown 
              user={user}
              isOpen={showMessages}
              onClose={() => setShowMessages(false)}
              onUnreadCountChange={handleMessageUnreadCountChange}
            />
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(false);
              setShowMessages(false);
              setShowDropdown(!showDropdown);
            }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/10 hover:border-white/30"
          >
            {user?.profile_picture ? (
              <img 
                key={imageHash}
                src={`${API_BASE_URL}/storage/profile_pictures/${user.profile_picture}?t=${imageHash}`}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400 shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-purple-900 font-bold text-sm shadow-md ${user?.profile_picture ? 'hidden' : ''}`}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col items-start pr-1">
              <span className="text-sm font-semibold leading-tight">{userName}</span>
              <span className="text-xs text-white/70 capitalize">{userRole}</span>
            </div>
            <svg 
              className={`w-4 h-4 text-white/70 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100]">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => handleNavigate("account")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50"
                >
                  <User size={16} />
                  My Profile
                </button>
                <button
                  onClick={() => handleNavigate("personal")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50"
                >
                  <Settings size={16} />
                  Manage Account
                </button>
                <button
                  onClick={() => handleNavigate("security")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50"
                >
                  <Key size={16} />
                  Change Password
                </button>
                {user?.role === 'employee' && (
                  <button
                    onClick={handleNotificationClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50"
                  >
                    <Bell size={16} />
                    Notifications
                  </button>
                )}
                <button
                  onClick={() => handleNavigate("account")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50"
                >
                  <HelpCircle size={16} />
                  Help & Support
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  )
}