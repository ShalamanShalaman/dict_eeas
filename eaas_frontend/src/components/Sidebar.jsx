import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Home,
  Upload,
  FileText,
  Clock,
  Archive,
  Users,
  Shield,
  LogOut,
  Save,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";

let globalLogoutLock = false;

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  user = null,
  isProcessing = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || isProcessing) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Enter" && confirmVariant === "danger") {
        e.preventDefault(); 
        onConfirm();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose, onConfirm, confirmVariant, isProcessing]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={isProcessing ? undefined : onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in slide-in-from-bottom-4 fade-in zoom-in-95 duration-300">
        <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />
        
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${confirmVariant === 'danger' ? 'bg-red-100' : 'bg-blue-100'} animate-in pulse`}>
              {confirmVariant === 'danger' ? (
                <LogOut size={28} className="text-red-600" />
              ) : (
                <AlertCircle size={28} className="text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{isProcessing ? "Logging out..." : title}</h3>
              {user && !isProcessing && (
                <p className="text-sm text-gray-500 mt-0.5">
                  Signing out {user.first_name} {user.last_name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-gray-600 text-base leading-relaxed">
            {isProcessing ? "Please wait..." : message}
          </p>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            disabled={isProcessing}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                       rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); 
              onConfirm();
            }}
            disabled={isProcessing}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200
                       flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50
                       ${confirmVariant === 'danger' 
                         ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow' 
                         : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
          >
            {isProcessing ? (
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
               confirmVariant === 'danger' && <LogOut size={16} />
            )}
            {isProcessing ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default function Sidebar({ role, onLogout }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [collapsed, setCollapsed] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDirection, setSpinDirection] = useState('');
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    general: true,
    myDocuments: true,
    reviewer: true,
    admin: true,
  });
  const location = useLocation();
  
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

  const toggleCategory = (category) => {
    if (collapsed) {
      handleToggle();
      setExpandedCategories(prev => ({ ...prev, [category]: true }));
    } else {
      setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
    }
  };

  const handleToggle = () => {
    setIsSpinning(true);
    setSpinDirection(!collapsed ? 'logo-spin-counter-clockwise' : 'logo-spin-clockwise');
    setCollapsed(!collapsed);
    setTimeout(() => setIsSpinning(false), 200);
  };

  const getMenuStructure = () => {
    const structure = [
      {
        id: 'general',
        title: 'MAIN',
        items: [
          { label: "Dashboard", icon: Home, path: "/" },
        ]
      },
      {
        id: 'myDocuments',
        title: 'MY DOCUMENTS',
        items: [
          { label: "Upload Attendance", icon: Upload, path: "/upload" },
          { label: "Saved Progress", icon: Save, path: "/saved-progress" },
          // Appending ?new=true to ensure proper state resetting when navigating directly
          { label: "Submit for Approval", icon: Clock, path: "/submit-for-approval?new=true", matchPath: "/submit-for-approval" },
          { label: "My Submissions", icon: FileText, path: "/submissions" },
        ]
      }
    ];

    if (role === 'reviewer' || role === 'admin') {
      structure.push({
        id: 'reviewer',
        title: 'REVIEWER ACTIONS',
        items: [
          { label: "Pending Reviews", icon: Clock, path: "/pending-reviews" },
          { label: "Archive", icon: Archive, path: "/archive" },
        ]
      });
    }

    if (role === 'admin') {
      structure.push({
        id: 'admin',
        title: 'ADMINISTRATION',
        items: [
          { label: "User Management", icon: Users, path: "/users" },
          { label: "System Audits", icon: Shield, path: "/audits" },
        ]
      });
    }

    return structure;
  };

  const menuStructure = getMenuStructure();

  const handleLogoutClick = () => {
    globalLogoutLock = false; 
    setShowLogoutConfirm(true);
  };
  
  const handleConfirmLogout = async () => {
    if (globalLogoutLock) return; 
    globalLogoutLock = true;
    
    setIsLoggingOut(true); 

    const freshUserStr = localStorage.getItem("user");
    const freshUser = freshUserStr ? JSON.parse(freshUserStr) : {};
    const finalUserId = freshUser.user_id || freshUser.id || user?.user_id || user?.id;
    const token = localStorage.getItem("token") || "";

    if (finalUserId) {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ user_id: finalUserId })
        });
      } catch (err) {
      }
    }

    setShowLogoutConfirm(false);
    setIsLoggingOut(false);
    if (onLogout) onLogout(); 
  };
  
  const handleCancelLogout = () => setShowLogoutConfirm(false);

  return (
    <>
      <aside 
        className={`${collapsed ? 'w-20' : 'w-64'} hidden md:flex flex-col bg-[#09095C] text-white h-screen sticky top-0 transition-all duration-200 relative group z-50`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className="h-20 flex items-center px-6 shrink-0 border-b border-white/10">
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
          className={`absolute ${collapsed ? '-right-3 border border-gray-400/50 bg-[#09095C]' : 'right-1'} top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-lg transition-all duration-200 ${sidebarHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} group-hover:opacity-100 group-hover:scale-100 z-50`}
        >
          {collapsed ? <ChevronRight size={20} className="text-white" /> : <ChevronLeft size={20} className="text-white" />}
        </button>

        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {menuStructure.map((category) => (
            <div key={category.id} className="mb-2">
              {!collapsed && (
                <div 
                  className="px-6 py-2 flex items-center justify-between cursor-pointer group/cat"
                  onClick={() => toggleCategory(category.id)}
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover/cat:text-white/70 transition-colors">
                    {category.title}
                  </span>
                  {expandedCategories[category.id] ? (
                    <ChevronUp size={14} className="text-white/40" />
                  ) : (
                    <ChevronDown size={14} className="text-white/40" />
                  )}
                </div>
              )}
              
              <div className={`space-y-0.5 overflow-hidden transition-all ${(expandedCategories[category.id] || collapsed) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {category.items.map(({ label, icon: Icon, path, matchPath }) => {
                  const checkPath = matchPath || path.split('?')[0];
                  const isActive = location.pathname === checkPath;
                  return (
                    <Link
                      key={label}
                      to={path}
                      className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-6'} py-2.5 text-sm transition-all duration-200 relative group/item ${
                        isActive
                          ? "bg-white/10 text-white font-semibold"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-r"></div>
                      )}
                      <Icon size={18} className={`${isActive ? "text-yellow-400" : ""} shrink-0`} />
                      <span className={`truncate ${collapsed ? 'hidden' : ''}`}>{label}</span>
                    </Link>
                  );
                })}
              </div>
              {collapsed && <div className="h-px bg-white/10 my-2 mx-4"></div>}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-[#09095C] shrink-0">
          <button
            onClick={handleLogoutClick}
            className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-4'} py-3 text-sm font-semibold bg-red-600/90 hover:bg-red-600 text-white rounded-lg shadow-sm transition-colors`}
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
        message="Are you sure you want to log out of your account?"
        confirmText="Log Out"
        cancelText="Cancel"
        confirmVariant="danger"
        user={user}
        isProcessing={isLoggingOut} 
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }
        @keyframes spin-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        .logo-spin-clockwise { animation: spin-cw 0.3s ease-in-out; }
        .logo-spin-counter-clockwise { animation: spin-ccw 0.3s ease-in-out; }
      `}</style>
    </>
  );
}