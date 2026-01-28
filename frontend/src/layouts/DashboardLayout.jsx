import Sidebar from "../components/Sidebar"
import Header from "../components/Header"

export default function DashboardLayout({ role, setRole, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">

      <Sidebar role={role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header role={role} setRole={setRole} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

    </div>
  )
}
