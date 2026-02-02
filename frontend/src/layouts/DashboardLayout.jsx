import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout({
  user, // <--- Receive user object
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

      <div className="flex-1 flex flex-col">
        {/* Pass user to Header for permission checks */}
        <Header role={role} setRole={setRole} user={user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}