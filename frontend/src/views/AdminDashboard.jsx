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

const ServerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
);

const DatabaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
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

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const API_URL = "http://127.0.0.1:5000/api";

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeSessions] = useState(0);
  const [storage] = useState(45);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(true);

  const [logs, setLogs] = useState([]);
  const [availableActions, setAvailableActions] = useState([]);
  const [filterAction, setFilterAction] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    fetchLogs();
    fetchUserCount();
    fetchActions();
  }, []);

  const fetchUserCount = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`);
      const data = await res.json();
      setTotalUsers(data.length || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      setTotalUsers(0);
    }
  };

  const fetchActions = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/logs/actions`);
      const data = await res.json();
      setAvailableActions(data);
    } catch (error) {
      console.error("Error fetching actions:", error);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      let url = `${API_URL}/admin/logs?limit=100`;
      if (filterAction) {
        url += `&action=${encodeURIComponent(filterAction)}`;
      }
      if (filterRole) {
        url += `&role=${encodeURIComponent(filterRole)}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Transform API logs to frontend format
  const transformLog = (log) => {
    const actionTypes = {
      'LOGIN': { action: 'Login', type: 'login' },
      'CREATE_USER': { action: 'Create', type: 'create' },
      'UPDATE_USER': { action: 'Update', type: 'update' },
      'DELETE_USER': { action: 'Delete', type: 'delete' },
      'UPLOAD_DOCUMENT': { action: 'Upload', type: 'create' },
      'SUBMIT_DOCUMENT': { action: 'Submit', type: 'update' },
      'APPROVE_DOCUMENT': { action: 'Approve', type: 'update' },
      'DECLINE_DOCUMENT': { action: 'Decline', type: 'delete' },
      'UPLOAD_ATTACHMENTS': { action: 'Upload', type: 'create' },
      'UPDATE_PROFILE': { action: 'Update', type: 'update' },
    };

    const transformed = actionTypes[log.action] || { action: log.action, type: 'update' };
    
    return {
      time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(log.created_at).toLocaleDateString(),
      user: log.user_name,
      role: log.user_role,
      action: transformed.action,
      type: transformed.type,
      details: log.details || log.action
    };
  };

  const styles = {
    update: 'bg-blue-100 text-blue-800',
    create: 'bg-green-100 text-green-800',
    delete: 'bg-red-100 text-red-800',
    login: 'bg-violet-100 text-violet-800',
    export: 'bg-amber-100 text-amber-800',
  };

  function addUser(name, role) {
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setLogs(prev => [
      {
        time,
        date: new Date().toLocaleDateString(),
        user: 'Admin_01',
        role: 'admin',
        action: 'Create',
        type: 'create',
        details: `Added ${role}: ${name}`,
      },
      ...prev,
    ]);

    setTotalUsers(u => u + 1);
    setToast(`User "${name}" added successfully`);
    setTimeout(() => setToast(''), 3000);
    setShowModal(false);
  }

  const handleFilterChange = () => {
    fetchLogs();
  };

  const filteredLogs = logs.filter(
    log => {
      const transformed = transformLog(log);
      return (
        transformed.user.toLowerCase().includes(search.toLowerCase()) ||
        transformed.action.toLowerCase().includes(search.toLowerCase()) ||
        transformed.details.toLowerCase().includes(search.toLowerCase())
      );
    }
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Administration</h2>
          <p className="text-slate-500">Overview of system health and usage</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchLogs}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshIcon /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-6 rounded-xl shadow-lg shadow-blue-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">Total Users</p>
            <h3 className="text-3xl font-bold">{totalUsers}</h3>
            <p className="text-xs mt-2 opacity-80">
              System Users
            </p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <UsersIcon />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg shadow-green-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">System Status</p>
            <div className="flex items-center gap-2 mt-1 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <h3 className="text-2xl font-bold">Online</h3>
            </div>
            <p className="text-xs opacity-80">All services operational</p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <ServerIcon />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="w-full">
            <p className="text-sm font-medium text-slate-500 mb-1">Storage Usage</p>
            <h3 className="text-3xl font-bold text-slate-800 mb-2">{storage}%</h3>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
              <div
                className="bg-indigo-600 h-1.5 rounded-full"
                style={{ width: `${storage}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {storage} GB of 100 GB used
            </p>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg ml-4">
            <DatabaseIcon />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Active Sessions</p>
            <h3 className="text-3xl font-bold text-slate-800">{activeSessions}</h3>
            <p className="text-xs text-green-600 mt-2 font-medium">Currently logged in</p>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <ActivityIcon />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Audit Logs</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); }}
              onBlur={handleFilterChange}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="">All Actions</option>
              {availableActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); }}
              onBlur={handleFilterChange}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="reviewer">Reviewer</option>
              <option value="employee">Employee</option>
            </select>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <SearchIcon />
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search logs..."
                className="w-full sm:w-64 pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingLogs ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Loading logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <SearchIcon className="w-8 h-8 mb-2 opacity-50" />
                      <p>No logs found matching your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, i) => {
                  const transformed = transformLog(log);
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                        {transformed.date} {transformed.time}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {transformed.user}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize
                          ${transformed.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                            transformed.role === 'reviewer' ? 'bg-orange-100 text-orange-800' : 
                            'bg-green-100 text-green-800'}`}>
                          {transformed.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[transformed.type] || styles.update}`}>
                          {transformed.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {transformed.details}
                      </td>
                    </tr>
                  );
                })
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
              <option>Employee</option>
              <option>Reviewer</option>
              <option>Admin</option>
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

