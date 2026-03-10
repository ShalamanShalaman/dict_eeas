
import { useState, useEffect, useMemo } from "react";
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./views/Login";
import UserManagement from "./views/UserManagement";
import EmployeeDashboard from "./views/EmployeeDashboard";
import ReviewerDashboard from "./views/ReviewerDashboard";
import AdminDashboard from "./views/AdminDashboard";
import MyProfile from "./views/MyProfile";
import UploadAttendance from "./views/UploadAttendance";
import EmployeeRecords from "./views/EmployeeRecords";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [viewRole, setViewRole] = useState(user ? user.role : "");

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
    setViewRole("");
    localStorage.removeItem("user");
  };

  const Protected = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    return <DashboardLayout user={user} role={viewRole} setRole={setViewRole} onLogout={handleLogout}>{children}</DashboardLayout>;
  };

  const router = useMemo(() => createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />} />
        <Route path="/" element={
          <Protected>
            {viewRole === "employee" && <EmployeeDashboard selectedMenu="Dashboard" user={user} setActivePage={() => {}} />}
            {viewRole === "reviewer" && <ReviewerDashboard user={user} />}
            {viewRole === "admin" && <AdminDashboard selectedMenu="Dashboard" />}
          </Protected>
        } />
        <Route path="/upload" element={<Protected><EmployeeDashboard selectedMenu="Upload Attendance" user={user} setActivePage={() => {}} /></Protected>} />
        <Route path="/saved-progress" element={<Protected><EmployeeDashboard selectedMenu="Saved Progress" user={user} setActivePage={() => {}} /></Protected>} />
        <Route path="/submit-for-approval" element={<Protected><EmployeeDashboard selectedMenu="Submit for Approval" user={user} setActivePage={() => {}} /></Protected>} />
        <Route path="/submissions" element={<Protected><EmployeeDashboard selectedMenu="My Submissions" user={user} setActivePage={() => {}} /></Protected>} />
        <Route path="/pending-reviews" element={<Protected><ReviewerDashboard user={user} /></Protected>} />
        <Route path="/upload-reviewer" element={<Protected><UploadAttendance user={user} /></Protected>} />
        <Route path="/archive" element={<Protected><ReviewerDashboard user={user} isArchiveView={true} /></Protected>} />
        <Route path="/signature" element={<Protected><ReviewerDashboard user={user} /></Protected>} />
        <Route path="/users" element={<Protected>{viewRole === "admin" ? <UserManagement /> : <Navigate to="/" replace />}</Protected>} />
        <Route path="/employee-records" element={<Protected>{viewRole === "admin" ? <EmployeeRecords /> : <Navigate to="/" replace />}</Protected>} />
        <Route path="/templates" element={<Protected>{viewRole === "admin" ? <AdminDashboard selectedMenu="Templates" /> : <Navigate to="/" replace />}</Protected>} />
        <Route path="/logs" element={<Protected>{viewRole === "admin" ? <AdminDashboard selectedMenu="System Logs" /> : <Navigate to="/" replace />}</Protected>} />
        <Route path="/profile" element={<Protected><MyProfile /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </>
    )
  ), [user, viewRole]);

  return <RouterProvider router={router} />;
}
