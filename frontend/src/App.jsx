import { useState } from "react"
import DashboardLayout from "./layouts/DashboardLayout"

import EmployeeDashboard from "./views/EmployeeDashboard"
import ReviewerDashboard from "./views/ReviewerDashboard"
import AdminDashboard from "./views/AdminDashboard"

export default function App() {

  const [role, setRole] = useState("employee")

  const renderView = () => {
    if (role === "employee") return <EmployeeDashboard />
    if (role === "reviewer") return <ReviewerDashboard />
    if (role === "admin") return <AdminDashboard />
  }

  return (
    <DashboardLayout role={role} setRole={setRole}>
      {renderView()}
    </DashboardLayout>
  )
}
