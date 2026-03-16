import React, { useState, useEffect } from 'react';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const UserCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <polyline points="17 11 19 13 23 9" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UserPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');

  const [logs, setLogs] = useState([
    { time: '10:05 AM', user: 'Admin_01', action: 'Update', type: 'update', details: 'Modified permissions' },
    { time: '09:45 AM', user: 'Sarah_M', action: 'Create', type: 'create', details: 'Added employee' },
    { time: '09:30 AM', user: 'Admin_01', action: 'Delete', type: 'delete', details: 'Removed inactive user' },
    { time: '09:15 AM', user: 'John_D', action: 'Login', type: 'login', details: 'Successful login' },
    { time: '08:50 AM', user: 'Admin_01', action: 'Export', type: 'export', details: 'Downloaded report' },
  ]);

  const styles = {
    update: 'bg-blue-100 text-blue-800',
    create: 'bg-green-100 text-green-800',
    delete: 'bg-red-100 text-red-800',
    login: 'bg-violet-100 text-violet-800',
    export: 'bg-amber-100 text-amber-800',
  };

  // Fetch real users from the backend
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/users', {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  function addUser(name, role) {
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setLogs(prev => [
      {
        time,
        user: 'Admin_01',
        action: 'Create',
        type: 'create',
        details: `Added ${role}: ${name}`,
      },
      ...prev,
    ]);

    // Note: To fully create a real user, this should be a POST request to /api/admin/create-user
    // For now, we refresh the user list assuming the backend handles it or we mock it locally
    fetchUsers();
    
    setToast(`User creation attempt for "${name}" completed`);
    setTimeout(() => setToast(''), 3000);
    setShowModal(false);
  }

  const filteredLogs = logs.filter(
    log =>
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
  );

  // Derived real metrics
  const totalUsers = users.length;
  const employeesCount = users.filter(u => u.role?.toLowerCase() === 'employee').length;
  const reviewersCount = users.filter(u => u.role?.toLowerCase() === 'reviewer').length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Administration</h2>
          <p className="text-slate-500">Overview of system health and usage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Users Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-6 rounded-xl shadow-lg shadow-blue-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">Total Users</p>
            <h3 className="text-3xl font-bold">
              {loadingUsers ? <span className="text-2xl opacity-70">Loading...</span> : totalUsers}
            </h3>
            <p className="text-xs mt-2 opacity-80">
              Registered accounts across all roles
            </p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <UsersIcon />
          </div>
        </div>

        {/* Employees Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-xl shadow-lg shadow-teal-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">Employees</p>
            <h3 className="text-3xl font-bold">
              {loadingUsers ? <span className="text-2xl opacity-70">...</span> : employeesCount}
            </h3>
            <p className="text-xs mt-2 opacity-80">
              Standard staff accounts
            </p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <UserIcon />
          </div>
        </div>

        {/* Reviewers Card */}
        <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white p-6 rounded-xl shadow-lg shadow-purple-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">Reviewers</p>
            <h3 className="text-3xl font-bold">
              {loadingUsers ? <span className="text-2xl opacity-70">...</span> : reviewersCount}
            </h3>
            <p className="text-xs mt-2 opacity-80">
              Authorized to review documents
            </p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <UserCheckIcon />
          </div>
        </div>

      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Audit Logs</h3>
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <SearchIcon />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <SearchIcon className="w-8 h-8 mb-2 opacity-50" />
                      <p>No logs found matching your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                      {log.time}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {log.user}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[log.type]}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addUser}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="text-green-400">
              <CheckCircleIcon />
            </div>
            <p className="text-sm font-medium">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const AddUserModal = ({ isOpen, onClose, onAdd }) => {
  if (!isOpen) return null;

  const submit = e => {
    e.preventDefault();
    onAdd(e.target.name.value, e.target.role.value);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
            <UserPlusIcon />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Add New User</h3>
            <p className="text-sm text-slate-500">Create a new account in the system</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              placeholder="e.g. Jane Doe"
              required
              autoFocus
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
            >
              <option value="employee">Employee</option>
              <option value="reviewer">Reviewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;