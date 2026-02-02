export default function Header({ role, setRole, user }) {
  // Logic: Show toggle ONLY if user is logged in AND is admin or hr
  const canToggleRoles = user && (user.role === 'admin' || user.role === 'hr');

  return (
    <header
      className="h-16 border-b flex items-center justify-between px-6"
      style={{ backgroundColor: "rgb(28,26,136)" }} // blue background
    >

      <h1 className="font-semibold capitalize text-white">
        Employee Attendance and Accomplishment System
      </h1>

      {/* Only show toggle if user is authorized */}
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

    </header>
  )
}