import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Search, Shield, Download, RefreshCw, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const SystemAudits = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [newLogsCount, setNewLogsCount] = useState(0);
  const [referenceLength, setReferenceLength] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogs = useCallback(async (isInitial = false) => {
    if (!isInitial) setIsRefreshing(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/logs?_t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
        setReferenceLength(data.length);
        setNewLogsCount(0);
        if (isInitial) {
          setCurrentPage(1);
        }
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(true);
  }, [fetchLogs]);

  useEffect(() => {
    let isMounted = true;
    const checkNewLogs = async () => {
      if (loading || isRefreshing || referenceLength === 0) return;
      
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/admin/logs?_t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data.length > referenceLength) {
            setNewLogsCount(data.length - referenceLength);
          }
        }
      } catch (error) {
        console.error('Failed to check for new logs', error);
      }
    };

    const interval = setInterval(checkNewLogs, 5000); 
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [referenceLength, loading, isRefreshing]);

  const getActionStyle = (action) => {
    const act = action?.toUpperCase() || '';
    if (['CREATE', 'APPROVE'].includes(act)) return 'bg-green-100 text-green-800 border-green-200';
    if (['DELETE', 'DECLINE'].includes(act)) return 'bg-red-100 text-red-800 border-red-200';
    if (['UPDATE', 'SUBMIT', 'UPLOAD'].includes(act)) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (['LOGIN', 'AUTH'].includes(act)) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (['GENERATE', 'EXPORT'].includes(act)) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatRole = (roleStr) => {
    if (!roleStr) return 'Unknown';
    if (roleStr.toLowerCase() === 'system') return 'System';
    return roleStr.charAt(0).toUpperCase() + roleStr.slice(1).toLowerCase();
  };

  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Time', 'User', 'Role', 'Action', 'Entity', 'Details'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => 
        `"${formatDate(log.created_at)}","${log.user_name || 'System'}","${formatRole(log.user_role)}","${log.action}","${log.entity_type}","${log.details.replace(/"/g, '""')}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `system_audits_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(log => {
    const searchMatch = 
      (log.user_name && log.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.entity_type && log.entity_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const actionMatch = filterAction === 'ALL' || log.action.toUpperCase() === filterAction;
    
    const roleMatch = filterRole === 'ALL' || formatRole(log.user_role) === filterRole;

    let dateMatch = true;
    if (filterDate) {
      const logDate = new Date(log.created_at).toISOString().split('T')[0];
      dateMatch = logDate === filterDate;
    }

    return searchMatch && actionMatch && roleMatch && dateMatch;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueActions = ['ALL', ...new Set(logs.map(log => log.action.toUpperCase()))];
  const uniqueRoles = ['ALL', 'Admin', 'Reviewer', 'Employee', 'System'];

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-in fade-in duration-300">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Audits</h2>
          <p className="text-slate-500 text-sm mt-1">Review system activities and user actions</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => fetchLogs(false)}
            disabled={isRefreshing}
            className="relative flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Reload Logs
            {newLogsCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {newLogsCount > 99 ? '99+' : newLogsCount}
              </span>
            )}
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold">Audit Trail</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[120px] max-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white text-slate-700"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
              className="flex-1 min-w-[120px] max-w-[150px] px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white text-slate-700"
            >
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role === 'ALL' ? 'All Roles' : role}</option>
              ))}
            </select>

            <select
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
              className="flex-1 min-w-[120px] max-w-[150px] px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white text-slate-700"
            >
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action === 'ALL' ? 'All Actions' : action}</option>
              ))}
            </select>

            <div className="relative flex-[2] min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search details..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
              />
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 relative">
          <table className="w-full text-left text-sm text-slate-600 relative">
            <thead className="bg-white text-slate-500 uppercase text-xs font-semibold sticky top-0 z-10 shadow-sm border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity Type</th>
                <th className="px-6 py-4 w-1/2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 h-[300px]">
                    <div className="flex justify-center items-center h-full">
                      <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mr-3" />
                      <span>Loading audit logs...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 h-[300px]">
                    <div className="flex flex-col items-center justify-center h-full">
                      <Search className="w-10 h-10 mb-3 text-slate-300" />
                      <p className="text-base font-medium text-slate-600">No matching logs found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 text-xs text-slate-500 font-mono whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-800">{log.user_name || 'System'}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                        {formatRole(log.user_role)}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${getActionStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-medium text-slate-700">{log.entity_type}</span>
                      {log.entity_id && <span className="text-slate-400 text-xs ml-1 block mt-0.5">ID: #{log.entity_id}</span>}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-slate-500 font-medium">
            Showing <span className="text-slate-800">{paginatedLogs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="text-slate-800">{filteredLogs.length}</span> results
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-slate-700 min-w-[3rem] text-center">
              {currentPage} / {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0 || loading}
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAudits;