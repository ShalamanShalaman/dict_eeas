import React, { useState, useEffect } from "react";
import { User, Settings, Key, Bell, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

export default function Header({ role, setRole, user, onLogout }) {
  const canToggleRoles = user && (user.role === 'admin' || user.role === 'hr');
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const navigate = useNavigate();

  const userName = user?.full_name || user?.name || user?.username || "User";
  const userRole = user?.role || "employee";

  // Use state to force image re-render when user object updates
  const [imageHash, setImageHash] = useState(() => Date.now());

  useEffect(() => {
    // Update hash whenever the user object changes (like after a profile picture upload)
    setImageHash(Date.now());
  }, [user]);

  // Fetch unread notification count on mount
  useEffect(() => {
    if (user?.user_id) {
      fetchUnreadCount();
    }
  }, [user?.user_id]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/document/notifications/${user.user_id}`
      );
      if (response.ok) {
        const data = await response.json();
        setUnreadNotificationCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch unread notification count:", err);
    }
  };

  const handleUnreadCountChange = (count) => {
    setUnreadNotificationCount(count);
  };

  const handleNavigate = (tab) => {
    setShowDropdown(false);
    navigate(`/profile?tab=${tab}`);
  };

  const handleNotificationClick = () => {
    setShowDropdown(false);
    setShowNotifications(true);
  };

  return (
    <header
      className="h-16 border-b flex items-center justify-between px-6"
      style={{ backgroundColor: "rgb(28,26,136)" }}
    >
      <h1 className="font-semibold capitalize text-white">
        Employee Attendance and Accomplishment System
      </h1>

      <div className="flex items-center gap-2">
        {canToggleRoles && (
          <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
            {["employee", "reviewer", "admin"].map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3 py-1 text-sm rounded-md capitalize ${
                  role === r ? "bg-white shadow text-blue-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Notification Bell - Show for employees, reviewers, and admins */}
        {(user?.role === 'employee' || user?.role === 'reviewer' || user?.role === 'admin') && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
              title="Notifications"
            >
              <Bell size={20} />
            </button>
            {/* Unread count badge outside the bell */}
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
            
            {/* Imported standalone component used here */}
            <NotificationDropdown 
              user={user}
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onUnreadCountChange={handleUnreadCountChange}
            />
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/10 hover:border-white/30"
          >
            {user?.profile_picture ? (
              <img 
                key={imageHash}
                src={`http://127.0.0.1:8000/storage/profile_pictures/${user.profile_picture}?t=${imageHash}`}
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
            <div className="hidden md:flex flex-col items-start">
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
  );
}