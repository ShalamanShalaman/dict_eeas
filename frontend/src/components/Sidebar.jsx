const menus = {
  employee: ["Dashboard", "Upload Attendance", "My Submissions", "Downloads"],
  reviewer: ["Dashboard", "Pending Reviews", "Archive", "My Signature"],
  admin: ["Dashboard", "User Management", "Templates", "System Logs"]
};

export default function Sidebar({ role, activePage, onNavigate }) {
  // Fallback in case role is not found in menus
  const currentMenu = menus[role] || menus.employee;

  return (
    <aside className="w-64 bg-white border-r hidden md:flex flex-col">
      
      {/* Header with image */}
      <div className="h-16 flex items-center px-6 border-b">
         {/* Replace with your actual image path */}
        <img 
          src="/images/dict-logo.png" 
          alt="DICT Logo" 
          className="h-8 w-auto" // Adjusted height for better fit
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
              className={`w-full text-left block px-6 py-3 text-sm transition-colors ${
                isActive 
                  ? "bg-blue-50 text-blue-700 font-medium border-r-4 border-blue-600" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item}
            </button>
          );
        })}
      </nav>

      {/* Role display */}
      <div className="p-4 border-t text-xs font-semibold text-slate-400 tracking-wider uppercase">
        {role} Panel
      </div>

    </aside>
  );
}