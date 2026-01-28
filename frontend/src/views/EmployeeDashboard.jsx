export default function EmployeeDashboard() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Welcome back 👋</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border">Pending: 1</div>
        <div className="bg-white p-6 rounded-xl border">Approved: 5</div>
        <div className="bg-white p-6 rounded-xl border">Revision: 0</div>
      </div>

      {/* Later: upload component + table */}
    </>
  )
}
