const menus = {
  employee: ["Dashboard", "Upload Attendance", "My Submissions", "Downloads"],
  reviewer: ["Dashboard", "Pending Reviews", "Archive", "My Signature"],
  admin: ["Dashboard", "User Management", "Templates", "System Logs"]
}

export default function Sidebar({ role }) {
  return (
    <aside className="w-64 bg-white border-r hidden md:flex flex-col">

      {/* Header with image instead of text */}
      <div className="h-16 flex items-center px-6 border-b">
        <img 
          src="/images/dict-logo.png"        // <-- path to your image
          alt="DICT Logo"               // <-- accessibility text
          className="h-15 w-auto"      // <-- adjust size
        />
      </div>

      {/* Menu items */}
      <nav className="flex-1 py-4">
        {menus[role].map((item, i) => (
          <a key={i} className="block px-6 py-3 text-sm hover:bg-slate-50">
            {item}
          </a>
        ))}
      </nav>

      {/* Role display */}
      <div className="p-4 border-t text-sm text-slate-500">
        {role.toUpperCase()}
      </div>

    </aside>
  )
}
