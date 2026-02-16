import { useState, useEffect } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./views/Login";
import UserManagement from "./views/UserManagement";
import EmployeeDashboard from "./views/EmployeeDashboard";
import ReviewerDashboard from "./views/ReviewerDashboard";
import AdminDashboard from "./views/AdminDashboard";
import MyProfile from "./views/MyProfile";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [viewRole, setViewRole] = useState(user ? user.role : "");
  const [activePage, setActivePage] = useState("Dashboard");

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      if (!viewRole) setViewRole(user.role);
    } else {
      localStorage.removeItem("user");
      setViewRole("");
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setActivePage("Dashboard");
    setViewRole("");
    localStorage.removeItem("user");
    if (window.location.search) {
      const url = new URL(window.location);
      url.search = "";
      window.history.replaceState({}, "", url);
    }
  };

  const renderView = () => {
    if (activePage === "My Profile") return <MyProfile />;
    if (activePage === "User Management") return <UserManagement />;

    if (viewRole === "employee") return <EmployeeDashboard selectedMenu={activePage} setActivePage={setActivePage} user={user} />;
    if (viewRole === "reviewer") return <ReviewerDashboard selectedMenu={activePage} />;
    if (viewRole === "admin") return <AdminDashboard selectedMenu={activePage} />;

    return null;
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <DashboardLayout
      user={user}
      role={viewRole}
      setRole={setViewRole}
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={handleLogout}
    >
      {renderView()}
    </DashboardLayout>
  );
}
