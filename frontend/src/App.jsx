import { useState } from "react"
import DashboardLayout from "./layouts/DashboardLayout"
import UserManagement from "./views/UserManagement"

import EmployeeDashboard from "./views/EmployeeDashboard"
import ReviewerDashboard from "./views/ReviewerDashboard"
import AdminDashboard from "./views/AdminDashboard"

export default function App() {
  const [role, setRole] = useState("admin")
  const [activePage, setActivePage] = useState("Dashboard")

  const renderView = () => {

    // pages shared across roles
    if (activePage === "User Management") {
      return <UserManagement />
    }

    // dashboards handle sub-pages
    if (role === "employee") {
      return <EmployeeDashboard selectedMenu={activePage} />
    }

    if (role === "reviewer") {
      return <ReviewerDashboard selectedMenu={activePage} />
    }

    if (role === "admin") {
      return <AdminDashboard selectedMenu={activePage} />
    }

    return null
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
