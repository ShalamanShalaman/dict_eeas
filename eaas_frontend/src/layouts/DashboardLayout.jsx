import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout({
  user,
  role,
  setRole,
  activePage,
  setActivePage,
  onLogout,
  children,
}) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        role={role}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header role={role} setRole={setRole} user={user} onLogout={onLogout} />
        <main className="flex-1 overflow-auto p-2">
          {children || <Outlet context={{ user, role, setRole }} />}
        </main>
      </div>
    </div>
  );
}