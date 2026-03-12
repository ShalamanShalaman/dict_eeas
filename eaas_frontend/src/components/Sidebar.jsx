import { useState, useEffect } from "react";
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
  Shield,
  Menu,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

export default function Sidebar({ role, onLogout }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [collapsed, setCollapsed] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDirection, setSpinDirection] = useState('');
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const location = useLocation();
  
  // restore collapse state from localStorage so we remember if sidebar was hidden
  useEffect(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    if (stored !== null) {
      setCollapsed(stored === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed);
  }, [collapsed]);
  
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        setUser(JSON.parse(e.newValue || "{}"));
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  
  useEffect(() => {
    const handleUserUpdate = (e) => {
      setUser(e.detail);
    };
    
    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  const menus = {
    employee: [
      { label: "Dashboard", icon: Home, path: "/" },
      { label: "Upload Attendance", icon: Upload, path: "/upload" },
      { label: "Saved Progress", icon: Save, path: "/saved-progress" },
      { label: "Submit for Approval", icon: Clock, path: "/submit-for-approval" },
      { label: "My Submissions", icon: FileText, path: "/submissions" },
    ],
    reviewer: [
      { label: "Dashboard", icon: Home, path: "/" },
      { label: "Upload Attendance", icon: Upload, path: "/upload-reviewer" },
      { label: "Pending Reviews", icon: Clock, path: "/pending-reviews" },
      { label: "Archive", icon: Archive, path: "/archive" },
    ],
    admin: [
      { label: "Dashboard", icon: Home, path: "/" },
      { label: "User Management", icon: Users, path: "/users" },
      { label: "Templates", icon: Layers, path: "/templates" },
      { label: "System Audits", icon: Shield, path: "/audits" },
    ],
  };

  const currentMenu = menus[role] || menus.employee;

  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };
  const handleCancelLogout = () => setShowLogoutConfirm(false);

  const handleToggle = () => {
    setIsSpinning(true);
    setSpinDirection(!collapsed ? 'logo-spin-counter-clockwise' : 'logo-spin-clockwise');
    setCollapsed(!collapsed);
    setTimeout(() => setIsSpinning(false), 200);
  };

  const initials = user.first_name && user.last_name 
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() 
    : "U";

  return (
    <>
      <aside 
        className={`${collapsed ? 'w-20' : 'w-64'} hidden md:flex flex-col bg-[#09095C] text-white h-screen sticky top-0 transition-all duration-200 relative group`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >        

        <div className="h-20 flex items-center px-6">
          <div className="flex items-center flex-shrink-0">
            <img
              src="/images/dict_logo.png"
              alt="DICT Logo"
              className={`h-10 max-w-full w-auto object-contain ${isSpinning ? spinDirection : ''}`}
            />
            {!collapsed && (
              <img
                src="/images/dict_logo2.png"
                alt="DICT Text"
                className="h-12 max-w-full w-auto ml-2 object-contain"
              />
            )}
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`absolute right-1 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-lg transition-all duration-200 ${sidebarHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} group-hover:opacity-100 group-hover:scale-100`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={20} className="text-white" />
          ) : (
            <ChevronLeft size={20} className="text-white" />
          )}
        </button>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {currentMenu.map(({ label, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={label}
                to={path}
                className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-6'} py-3 text-sm transition-all duration-200 relative group ${
                  isActive
                    ? "bg-white/10 text-white font-semibold"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-r"></div>
                )}
                <Icon size={18} className={isActive ? "text-yellow-400" : ""} />
                <span className={`${collapsed ? 'hidden' : ''}`}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 bg-[#09095C]">
          <button
            onClick={handleLogoutClick}
            className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-4'} py-3 text-sm font-semibold bg-red-600/90 hover:bg-red-600 text-white rounded-lg shadow-sm transition-colors`}
          >
            <LogOut size={18} />
            {!collapsed && 'Logout'}
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