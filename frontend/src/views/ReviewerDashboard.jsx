import React from 'react';

const ReviewerDashboard = () => {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Reviewer Dashboard</h2>
        <p className="text-slate-500">You have <strong className="text-slate-800">3 documents</strong> waiting for your approval.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg shadow-red-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">Action Required</p>
            <h3 className="text-3xl font-bold">3</h3>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <i className="fa-solid fa-bell text-xl"></i>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Processed Today</p>
            <h3 className="text-3xl font-bold text-slate-800">12</h3>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <i className="fa-solid fa-check-double text-xl"></i>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">My Team</p>
            <h3 className="text-3xl font-bold text-slate-800">25</h3>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <i className="fa-solid fa-users text-xl"></i>
          </div>
        </div>
      </div>

      {/* Priority Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50">
          <h3 className="font-bold text-red-800"><i className="fa-solid fa-circle-exclamation mr-2"></i> Priority Queue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Document</th>
                <th className="px-6 py-3">Date Submitted</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">MK</div>
                    Michael K.
                  </div>
                </td>
                <td className="px-6 py-4">DTR (Jan 1-15)</td>
                <td className="px-6 py-4">Today, 09:30 AM</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm">
                    Review Now
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewerDashboard;