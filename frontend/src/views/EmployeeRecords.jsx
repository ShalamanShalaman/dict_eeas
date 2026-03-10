import { useState, useEffect } from "react";
import { Users, FileText, Search, CheckCircle, XCircle, Clock, Eye, Download, RefreshCw } from "lucide-react";

const API_URL = "http://127.0.0.1:5000/api";

export default function EmployeeRecords() {
  const [employees, setEmployees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, docsRes, locsRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`),
        fetch(`${API_URL}/admin/all-documents`),
        fetch(`${API_URL}/admin/locations`)
      ]);
      
      const usersData = await usersRes.json();
      const docsData = await docsRes.json();
      const locsData = await locsRes.json();
      
      // Filter only employees and reviewers
      const staff = usersData.filter(u => u.role === 'employee' || u.role === 'reviewer');
      setEmployees(staff);
      setLocations(locsData);
      setDocuments(docsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get document counts per employee
  const getEmployeeStats = (userId) => {
    const userDocs = documents.filter(d => d.employee_id === userId);
    return {
      total: userDocs.length,
      drafts: userDocs.filter(d => d.status === 'draft' || d.is_draft).length,
      submitted: userDocs.filter(d => d.status === 'submitted').length,
      approved: userDocs.filter(d => d.status === 'approved').length,
      declined: userDocs.filter(d => d.status === 'declined').length
    };
  };

  // Get status badge
  const getStatusBadge = (status, isDraft) => {
    if (isDraft || status === 'draft') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="w-3 h-3" /> Draft
        </span>
      );
    }
    
    const statusConfig = {
      submitted: { icon: Clock, bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
      approved: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      declined: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-800', label: 'Declined' }
    };
    
    const config = statusConfig[status] || statusConfig.submitted;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" /> {config.label}
      </span>
    );
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = `${emp.full_name} ${emp.user_id} ${emp.email} ${emp.office_name || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLocation = !filterLocation || emp.office_location_id == filterLocation;
    return matchesSearch && matchesLocation;
  });

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = `${doc.employee_name} ${doc.employee_user_id}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || doc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalDocs = documents.length;
  const submittedDocs = documents.filter(d => d.status === 'submitted').length;
  const approvedDocs = documents.filter(d => d.status === 'approved').length;
  const declinedDocs = documents.filter(d => d.status === 'declined').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Employee Records
          </h2>
          <p className="text-gray-500 text-sm">View all employee submissions and approvals</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Documents</p>
              <p className="text-2xl font-bold text-gray-800">{totalDocs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-gray-800">{submittedDocs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-gray-800">{approvedDocs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Declined</p>
              <p className="text-2xl font-bold text-gray-800">{declinedDocs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.location}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Document ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Reviewed</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No documents found</p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{doc.employee_name}</div>
                      <div className="text-xs text-gray-500">{doc.employee_user_id}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {doc.office_name || <span className="text-gray-300 italic">N/A</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">#{doc.id}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(doc.status, doc.is_draft)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {doc.submitted_at ? new Date(doc.submitted_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {doc.reviewed_at ? new Date(doc.reviewed_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => window.open(`/api/document/view/${doc.id}?user_id=${doc.employee_user_id}`, '_blank')}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a 
                          href={`/api/document/download/${doc.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Summary Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800">Employee Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-center">Total Docs</th>
                <th className="px-6 py-4 text-center">Drafts</th>
                <th className="px-6 py-4 text-center">Submitted</th>
                <th className="px-6 py-4 text-center">Approved</th>
                <th className="px-6 py-4 text-center">Declined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((emp) => {
                const stats = getEmployeeStats(emp.id);
                return (
                  <tr key={emp.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{emp.full_name}</div>
                      <div className="text-xs text-gray-500">{emp.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${emp.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          emp.role === 'reviewer' ? 'bg-orange-100 text-orange-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {emp.office_name || <span className="text-gray-300 italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-800">{stats.total}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{stats.drafts}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{stats.submitted}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{stats.approved}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">{stats.declined}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

