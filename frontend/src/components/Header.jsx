export default function Header({ role, setRole }) {
  return (
    <header
      className="h-16 border-b flex items-center justify-between px-6"
      style={{ backgroundColor: "rgb(20, 17, 189)" }} // blue background
    >

      <h1 className="font-semibold capitalize text-white">
        Employee Attendance and Accomplishment System
      </h1>

      <div className="hidden md:flex bg-slate-100 p-1 rounded-lg">
        {["employee", "reviewer", "admin"].map(r => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`px-3 py-1 text-sm rounded-md ${
              role === r ? "bg-white shadow" : ""
            }`}
          >
            {r}
          </button>
        ))}
      </div>

    </header>
  )
}