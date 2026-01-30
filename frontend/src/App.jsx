import { useState } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./views/Login";

import EmployeeDashboard from "./views/EmployeeDashboard";
import ReviewerDashboard from "./views/ReviewerDashboard";
import AdminDashboard from "./views/AdminDashboard";
import UserManagement from "./views/UserManagement";

export default function App() {
  const [user, setUser] = useState(null);        // logged-in user
  const [activePage, setActivePage] = useState("Dashboard");

  // 🔁 Handle logout
  const handleLogout = () => {
    setUser(null);
    setActivePage("Dashboard");
  };

  // what appears inside <main>
  const renderView = () => {
    if (activePage === "User Management") return <UserManagement />;

    if (user.role === "employee")
      return <EmployeeDashboard selectedMenu={activePage} />;

    if (user.role === "reviewer")
      return <ReviewerDashboard selectedMenu={activePage} />;

    if (user.role === "admin")
      return <AdminDashboard selectedMenu={activePage} />;

    return null;
  };

  // 🔒 NOT logged in → Login page
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // ✅ Logged in → Dashboard
  return (
    <DashboardLayout
      role={user.role}
      setRole={(newRole) =>
        setUser((prev) => ({ ...prev, role: newRole }))
      }
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={handleLogout}   // 🔥 important
    >
      {renderView()}
    </DashboardLayout>
  );
}
