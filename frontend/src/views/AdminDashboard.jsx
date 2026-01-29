import React, { useState } from 'react'

const AdminDashboard = () => {
  /* ---------------- STATE ---------------- */

  const [totalUsers, setTotalUsers] = useState(150)
  const [activeSessions] = useState(23)
  const [storage] = useState(45)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')

  const [logs, setLogs] = useState([
    { time: '10:05 AM', user: 'Admin_01', action: 'Update', type: 'update', details: 'Modified permissions' },
    { time: '09:45 AM', user: 'Sarah_M', action: 'Create', type: 'create', details: 'Added employee' },
    { time: '09:30 AM', user: 'Admin_01', action: 'Delete', type: 'delete', details: 'Removed inactive user' },
    { time: '09:15 AM', user: 'John_D', action: 'Login', type: 'login', details: 'Successful login' },
    { time: '08:50 AM', user: 'Admin_01', action: 'Export', type: 'export', details: 'Downloaded report' },
  ])

  /* ---------------- HELPERS ---------------- */

  const styles = {
    update: 'text-blue-600 bg-blue-50 border-blue-100',
    create: 'text-green-600 bg-green-50 border-green-100',
    delete: 'text-red-600 bg-red-50 border-red-100',
    login: 'text-violet-600 bg-violet-50 border-violet-100',
    export: 'text-amber-600 bg-amber-50 border-amber-100',
  }

  function addUser(name, role) {
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    setLogs(prev => [
      {
        time,
        user: 'Admin_01',
        action: 'Create',
        type: 'create',
        details: `Added ${role}: ${name}`,
      },
      ...prev,
    ])

    setTotalUsers(u => u + 1)
    setToast(`User "${name}" added`)
    setTimeout(() => setToast(''), 3000)
    setShowModal(false)
  }

  const filteredLogs = logs.filter(
    log =>
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
  )

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* HEADER */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Administration</h2>
          <p className="text-slate-500">Overview of system health and usage</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Add User
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Stat title="Total Users" value={totalUsers}>
          <p className="text-xs text-slate-400 mt-2">
            10 Reviewers · {totalUsers - 10} Employees
          </p>
        </Stat>

        <Stat title="System Status">
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="font-semibold text-slate-800">Online</span>
          </div>
        </Stat>

        <Stat title="Storage Usage" value={`${storage}%`}>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${storage}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {storage} GB of 100 GB
          </p>
        </Stat>

        <Stat title="Active Sessions" value={activeSessions}>
          <p className="text-xs text-green-600 mt-2">▲ 12% last hour</p>
        </Stat>
      </div>

      {/* AUDIT LOGS (FULL WIDTH NOW) */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex flex-col sm:flex-row justify-between gap-3">
          <h3 className="font-semibold">Audit Logs</h3>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="border rounded-lg px-3 py-1.5 text-sm"
          />
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left">Time</th>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Action</th>
              <th className="px-6 py-3 text-left">Details</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                  No logs found
                </td>
              </tr>
            )}

            {filteredLogs.map((log, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-3 text-xs text-slate-400 font-mono">
                  {log.time}
                </td>
                <td className="px-6 py-3 font-medium">
                  {log.user}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs border font-medium ${styles[log.type]}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-3 text-xs text-slate-500">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <AddUserModal
          onClose={() => setShowModal(false)}
          onAdd={addUser}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}

/* ---------------- COMPONENTS ---------------- */

const Stat = ({ title, value, children }) => (
  <div className="bg-white p-6 rounded-xl border shadow-sm hover:-translate-y-0.5 transition">
    <p className="text-sm text-slate-500 mb-1">{title}</p>
    {value && <h3 className="text-3xl font-bold text-slate-800">{value}</h3>}
    {children}
  </div>
)

const AddUserModal = ({ onClose, onAdd }) => {
  const submit = e => {
    e.preventDefault()
    onAdd(e.target.name.value, e.target.role.value)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="px-6 py-4 border-b flex justify-between">
          <h3 className="font-semibold">Add New User</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            required
            className="w-full border rounded-lg px-4 py-2.5"
          />

          <select
            name="role"
            className="w-full border rounded-lg px-4 py-2.5"
          >
            <option>Employee</option>
            <option>Reviewer</option>
            <option>Admin</option>
          </select>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded-lg py-2.5"
            >
              Cancel
            </button>

            <button className="flex-1 bg-slate-800 text-white rounded-lg py-2.5">
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminDashboard
