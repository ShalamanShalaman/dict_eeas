import React from 'react';

const AdminDashboard = () => {
  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Administration</h2>
          <p className="text-slate-500">Overview of system health and usage.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <i className="fa-solid fa-plus mr-2"></i> Add User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Users</p>
          <h3 className="text-3xl font-bold text-slate-800">150</h3>
          <div className="mt-2 text-xs text-slate-400 flex gap-2">
            <span><i className="fa-solid fa-user-tie"></i> 10 Reviewers</span>
            <span><i className="fa-solid fa-user"></i> 140 Empl.</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">System Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <h3 className="text-xl font-bold text-slate-800">Online</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-1">Storage Usage</p>
            <h3 className="text-3xl font-bold text-slate-800">45%</h3>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Audit Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-6 py-3 text-slate-400 font-mono text-xs">10:05 AM</td>
                  <td className="px-6 py-3 font-medium text-slate-900">Admin_01</td>
                  <td className="px-6 py-3"><span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-100">Update</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;