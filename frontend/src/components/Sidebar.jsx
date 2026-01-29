const menus = {
  employee: ["Dashboard", "Upload Attendance", "My Submissions", "Downloads"],
  reviewer: ["Dashboard", "Pending Reviews", "Archive", "My Signature"],
  admin: ["Dashboard", "User Management", "Templates", "System Logs"]
};

export default function Sidebar({ role, activePage, onNavigate }) {
  const currentMenu = menus[role] || menus.employee;

  return (
    <aside className="w-64 hidden md:flex flex-col bg-[rgb(28,26,136)]">

      {/* Logo header – removed bottom border */}
      <div className="h-16 flex items-center px-6">
        <img
          src="/images/dict-logo.png"
          alt="DICT Logo"
          className="h-8 w-auto"
        />
      </div>

      {/* Menu items */}
      <nav className="flex-1 py-4 space-y-1">
        {currentMenu.map((item, i) => {
          const isActive = activePage === item;

          return (
            <button
              key={i}
              onClick={() => onNavigate(item)}
              className={`w-full text-left px-6 py-3 text-sm transition-all duration-200
                ${
                  isActive
                    ? "bg-white/15 text-white font-semibold border-l-4 border-yellow-400"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              {item}
            </button>
          );
        })}
      </nav>

      {/* Role display */}
      <div className="p-4 text-xs font-semibold text-white/60 tracking-wider uppercase">
        {role} Panel
      </div>

    </aside>
  );
}
