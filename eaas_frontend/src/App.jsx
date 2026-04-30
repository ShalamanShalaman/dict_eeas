import { useState, useEffect, useMemo } from "react";
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./views/Login";
import UserManagement from "./views/UserManagement";
import LocationManagement from "./views/LocationManagement";
import EmployeeDashboard from "./views/EmployeeDashboard";
import ReviewerDashboard from "./views/ReviewerDashboard";
import AdminDashboard from "./views/AdminDashboard";
import MyProfile from "./views/MyProfile";
import UploadAttendance from "./views/UploadAttendance";
import SystemAudits from "./views/SystemAudits";
import SavedProgress from "./views/SavedProgress";
import SubmitForApproval from "./views/SubmitForApproval";
import MySubmissions from "./views/MySubmissions";
import SystemManual from "./views/SystemManual";

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

  useEffect(() => {
    const handleUserUpdate = (e) => {
      setUser(e.detail);
    };

    window.addEventListener("userUpdated", handleUserUpdate);
    return () => window.removeEventListener("userUpdated", handleUserUpdate);
  }, []);

  const handleLogout = () => {
    setUser(null);
    setViewRole("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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
            {viewRole === "employee" && <EmployeeDashboard user={user} />}
            {viewRole === "reviewer" && <ReviewerDashboard user={user} />}
            {viewRole === "admin" && <AdminDashboard />}
          </Protected>
        } />
        <Route path="/upload" element={<Protected><UploadAttendance user={user} /></Protected>} />
        <Route path="/saved-progress" element={<Protected><SavedProgress user={user} /></Protected>} />
        <Route path="/submit-for-approval" element={<Protected><SubmitForApproval user={user} /></Protected>} />
        <Route path="/submissions" element={<Protected><MySubmissions user={user} /></Protected>} />
        <Route path="/pending-reviews" element={<Protected><ReviewerDashboard user={user} isPendingView={true} /></Protected>} />
        <Route path="/upload-reviewer" element={<Protected><UploadAttendance user={user} /></Protected>} />
        <Route path="/archive" element={<Protected><ReviewerDashboard user={user} isArchiveView={true} /></Protected>} />
        <Route path="/signature" element={<Protected><ReviewerDashboard user={user} /></Protected>} />
        <Route path="/users" element={<Protected>{viewRole === "admin" ? <UserManagement /> : <Navigate to="/" replace />}</Protected>} />
        <Route path="/locations" element={<Protected>{viewRole === "admin" ? <LocationManagement /> : <Navigate to="/" replace />}</Protected>} />
        <Route path="/templates" element={<Protected>{viewRole === "admin" ? <AdminDashboard /> : <Navigate to="/" replace />}</Protected>} />
        <Route path="/audits" element={<Protected>{viewRole === "admin" ? <SystemAudits /> : <Navigate to="/" replace />}</Protected>} />
        <Route path="/logs" element={<Navigate to="/audits" replace />} />
        <Route path="/profile" element={<Protected><MyProfile /></Protected>} />
        <Route path="/manual" element={<Protected><SystemManual user={user} /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </>
    )
  ), [user, viewRole]);

  return <RouterProvider router={router} />;
}