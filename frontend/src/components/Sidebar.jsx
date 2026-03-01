import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Save,
} from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

export default function Sidebar({ role, onLogout }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();

  const menus = {
    employee: [
      { label: "Dashboard", icon: Home, path: "/" },
      { label: "Upload Attendance", icon: Upload, path: "/upload" },
      { label: "Saved Progress", icon: Save, path: "/saved-progress" },
      { label: "Submit for Approval", icon: Clock, path: "/submit-for-approval" },
      { label: "My Submissions", icon: FileText, path: "/submissions" },
      { label: "My Profile", icon: User, path: "/profile" },
    ],
    reviewer: [
      { label: "Dashboard", icon: Home, path: "/" },
      { label: "Pending Reviews", icon: Clock, path: "/pending-reviews" },
      { label: "Archive", icon: Archive, path: "/archive" },
      { label: "My Profile", icon: User, path: "/profile" },
    ],
    admin: [
      { label: "Dashboard", icon: Home, path: "/" },
      { label: "User Management", icon: Users, path: "/users" },
      { label: "Templates", icon: Layers, path: "/templates" },
      { label: "System Logs", icon: Activity, path: "/logs" },
      { label: "My Profile", icon: User, path: "/profile" },
    ],
  };

  const currentMenu = menus[role] || menus.employee;

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };
  const handleCancelLogout = () => setShowLogoutConfirm(false);

  return (
    <>
      <aside className="w-64 hidden md:flex flex-col bg-[rgb(28,26,136)] text-white h-screen sticky top-0">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <img src="/images/dict-logo.png" alt="DICT Logo" className="h-10 w-auto" />
        </div>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {currentMenu.map(({ label, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={label}
                to={path}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-all duration-200 relative group ${
                  isActive
                    ? "bg-white/10 text-white font-semibold"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-r"></div>
                )}
                <Icon size={18} className={isActive ? "text-yellow-400" : ""} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

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

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </>
  );
}