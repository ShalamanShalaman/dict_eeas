import {
  FiHome,
  FiUpload,
  FiFileText,
  FiDownload,
  FiClock,
  FiArchive,
  FiEdit3,
  FiUsers,
  FiLayers,
  FiActivity,
  FiLogOut,
} from "react-icons/fi";

export default function Sidebar({ role, activePage, onNavigate, onLogout }) {
  const menus = {
    employee: [
      { label: "Dashboard", icon: FiHome },
      { label: "Upload Attendance", icon: FiUpload },
      { label: "My Submissions", icon: FiFileText },
      { label: "Downloads", icon: FiDownload },
    ],
    reviewer: [
      { label: "Dashboard", icon: FiHome },
      { label: "Pending Reviews", icon: FiClock },
      { label: "Archive", icon: FiArchive },
      { label: "My Signature", icon: FiEdit3 },
    ],
    admin: [
      { label: "Dashboard", icon: FiHome },
      { label: "User Management", icon: FiUsers },
      { label: "Templates", icon: FiLayers },
      { label: "System Logs", icon: FiActivity },
    ],
  };

  const currentMenu = menus[role] || menus.employee;

  const handleLogoutClick = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      onLogout();
    }
  };

  return (
    <aside className="w-64 hidden md:flex flex-col bg-[rgb(28,26,136)]">

      {/* Logo */}
      <div className="h-16 flex items-center px-6">
        <img src="/images/dict-logo.png" alt="DICT Logo" className="h-12" />
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 space-y-1">
        {currentMenu.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => onNavigate(label)}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition ${
              activePage === label
                ? "bg-white/15 text-white font-semibold border-l-4 border-yellow-400"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold
                     bg-red-600 hover:bg-red-700 text-white rounded-md"
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
