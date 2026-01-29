import { useState } from "react"
import DashboardLayout from "./layouts/DashboardLayout"
import UserManagement from "./views/UserManagement"

import EmployeeDashboard from "./views/EmployeeDashboard"
import ReviewerDashboard from "./views/ReviewerDashboard"
import AdminDashboard from "./views/AdminDashboard"

export default function App() {
  const [role, setRole] = useState("admin")
  const [activePage, setActivePage] = useState("User Management") // Default to User Management for testing

  const renderView = () => {
    // 1. Check for Specific Pages first
    if (activePage === "User Management") {
       return <UserManagement />
    }

    // 2. Default Dashboard Views based on Role
    if (activePage === "Dashboard") {
      if (role === "employee") return <EmployeeDashboard />
      if (role === "reviewer") return <ReviewerDashboard />
      if (role === "admin") return <AdminDashboard />
    }
    
    // 3. Fallback
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <p className="text-lg">Page "{activePage}" is under construction.</p>
      </div>
    )
  }

  return (
    <DashboardLayout 
      role={role} 
      setRole={setRole} 
      activePage={activePage}       
      setActivePage={setActivePage} 
    >
      {renderView()}
    </DashboardLayout>
  )
}