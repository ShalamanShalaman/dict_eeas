import React from "react";
import {
  Home,
  Upload,
  FileText,
  Clock,
  Archive,
  Edit3,
  Users,
  Layers,
  Activity,
  LogOut,
  User,
} from "lucide-react";

export default function Sidebar({ role, activePage, onNavigate, onLogout }) {
  const menus = {
    employee: [
      { label: "Dashboard", icon: Home },
      { label: "Upload Attendance", icon: Upload },
      { label: "Saved Progress", icon: FileText },
      { label: "Submission For Aproval", icon: FileText },
      { label: "My Submissions", icon: FileText },
      { label: "My Profile", icon: User },
    ],
    reviewer: [
      { label: "Dashboard", icon: Home },
      { label: "Pending Reviews", icon: Clock },
      { label: "Archive", icon: Archive },
      { label: "My Signature", icon: Edit3 },
      { label: "My Profile", icon: User },
    ],
    admin: [
      { label: "Dashboard", icon: Home },
      { label: "User Management", icon: Users },
      { label: "Templates", icon: Layers },
      { label: "System Logs", icon: Activity },
      { label: "My Profile", icon: User },
    ],
  };

  // Fallback to employee menu if role is undefined
  const currentMenu = menus[role] || menus.employee;

  const handleLogoutClick = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      onLogout();
    }
  };

  return (
    <aside className="w-64 hidden md:flex flex-col bg-[rgb(28,26,136)] text-white h-screen sticky top-0">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-white/10">
        <img src="/images/dict-logo.png" alt="DICT Logo" className="h-10 w-auto" />
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
        {currentMenu.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => onNavigate(label)}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-all duration-200 relative group ${
              activePage === label
                ? "bg-white/10 text-white font-semibold"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            {/* Active Indicator Line */}
            {activePage === label && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-r"></div>
            )}
            
            <Icon size={18} className={activePage === label ? "text-yellow-400" : ""} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10 bg-[rgb(28,26,136)]">
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold
                     bg-red-600/90 hover:bg-red-600 text-white rounded-lg shadow-sm transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}