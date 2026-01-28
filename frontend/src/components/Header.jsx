export default function Header({ role, setRole }) {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">

      <h1 className="font-semibold capitalize">{role} Dashboard</h1>

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
