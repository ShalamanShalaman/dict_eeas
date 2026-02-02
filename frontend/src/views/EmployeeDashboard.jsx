import UploadAttendance from "../views/UploadAttendance"

export default function EmployeeDashboard({ selectedMenu, user }) { // Accept user
  switch (selectedMenu) {
    case "Dashboard":
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Welcome back 👋</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border">Pending: 1</div>
            <div className="bg-white p-6 rounded-xl border border-green-200 bg-green-50">
              Approved: 5
            </div>
            <div className="bg-white p-6 rounded-xl border">Revision: 0</div>
          </div>
        </div>
      );

    case "Upload Attendance":
      // Pass user to UploadAttendance so it can access user_id for saving
      return <UploadAttendance user={user} />;

    default:
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <p>Select a menu item to continue</p>
        </div>
      );
  }
}