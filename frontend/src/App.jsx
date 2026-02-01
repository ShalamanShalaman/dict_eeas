import { useState } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./views/Login";

import UserManagement from "./views/UserManagement";
import EmployeeDashboard from "./views/EmployeeDashboard";
import ReviewerDashboard from "./views/ReviewerDashboard";
import AdminDashboard from "./views/AdminDashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("Dashboard");

  const handleLogout = () => {
    setUser(null);
    setActivePage("Dashboard");
  };

  const renderView = () => {
    // shared pages
    if (activePage === "User Management") {
      return <UserManagement />;
    }

    if (user.role === "employee") {
      return <EmployeeDashboard selectedMenu={activePage} />;
    }

    if (user.role === "reviewer") {
      return <ReviewerDashboard selectedMenu={activePage} />;
    }

    if (user.role === "admin") {
      return <AdminDashboard selectedMenu={activePage} />;
    }

    return null;
  };

  // 🔒 Not logged in
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // ✅ Logged in
  return (
    <DashboardLayout
      role={user.role}
      setRole={(newRole) =>
        setUser((prev) => ({ ...prev, role: newRole }))
      }
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={handleLogout}
    >
      {renderView()}
    </DashboardLayout>
  );
}
