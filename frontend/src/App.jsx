import { useState, useEffect } from "react";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./views/Login";
import UserManagement from "./views/UserManagement";
import EmployeeDashboard from "./views/EmployeeDashboard";
import ReviewerDashboard from "./views/ReviewerDashboard";
import AdminDashboard from "./views/AdminDashboard";

export default function App() {
  // 1. Initialize User from LocalStorage to fix "Please Log In" errors
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // 2. Separate View State:
  // 'user.role' is their actual permission level
  // 'viewRole' is what dashboard they are currently looking at
  const [viewRole, setViewRole] = useState(user ? user.role : "");
  const [activePage, setActivePage] = useState("Dashboard");

  // 3. Sync User to LocalStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      // If viewRole isn't set (e.g. fresh login), sync it
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
  };

  const renderView = () => {
    if (activePage === "User Management") return <UserManagement />;

    // Render based on the current VIEW MODE (viewRole)
    if (viewRole === "employee") {
      // Pass 'user' prop so UploadAttendance knows who is saving
      return <EmployeeDashboard selectedMenu={activePage} setActivePage={setActivePage} user={user} />;
    }

    if (viewRole === "reviewer") {
      return <ReviewerDashboard selectedMenu={activePage} />;
    }

    if (viewRole === "admin") {
      return <AdminDashboard selectedMenu={activePage} />;
    }

    return null;
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <DashboardLayout
      user={user}           // Pass user to Layout -> Header
      role={viewRole}       // Pass current view mode
      setRole={setViewRole} 
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={handleLogout}
    >
      {renderView()}
    </DashboardLayout>
  );
}