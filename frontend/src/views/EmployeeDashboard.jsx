import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UploadAttendance from "../views/UploadAttendance";
import SavedProgress from "./SavedProgress";
import AttachFiles from "./AttachFiles";

// Icons
const Icon = ({ children, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

const FileTextIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </Icon>
);

const UploadIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Icon>
);

const ClockIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Icon>
);

const CheckCircleIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Icon>
);

const XCircleIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </Icon>
);

const AlertCircleIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </Icon>
);

const SaveIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </Icon>
);

const UserIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

const BriefcaseIcon = ({ className }) => (
  <Icon className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Icon>
);

const MapPinIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

const CalendarIcon = ({ className }) => (
  <Icon className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Icon>
);

const TrendingUpIcon = ({ className }) => (
  <Icon className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </Icon>
);

const ActivityIcon = ({ className }) => (
  <Icon className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </Icon>
);

const TrashIcon = ({ className }) => (
  <Icon className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
);

const EyeIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

const DownloadIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Icon>
);

// Status badge component
const StatusBadge = ({ status }) => {
  const styles = {
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    submitted: "bg-blue-100 text-blue-700 border-blue-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    declined: "bg-red-100 text-red-700 border-red-200",
  };
  
  const icons = {
    draft: <ClockIcon className="w-3 h-3" />,
    submitted: <AlertCircleIcon className="w-3 h-3" />,
    approved: <CheckCircleIcon className="w-3 h-3" />,
    declined: <XCircleIcon className="w-3 h-3" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.draft}`}>
      {icons[status] || icons.draft}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Stats Card Component
function StatsCard({ title, value, icon: IconComponent, color, trend }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600", 
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUpIcon className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue} group-hover:scale-110 transition-transform`}>
          <IconComponent className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickAction({ icon: IconComponent, title, description, onClick, color }) {
  const colorClasses = {
    blue: "hover:bg-blue-50 hover:border-blue-300 text-blue-600",
    green: "hover:bg-green-50 hover:border-green-300 text-green-600",
    purple: "hover:bg-purple-50 hover:border-purple-300 text-purple-600",
    orange: "hover:bg-orange-50 hover:border-orange-300 text-orange-600",
  };

  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl text-left hover:shadow-md transition-all ${colorClasses[color] || colorClasses.blue}`}
    >
      <div className={`p-3 rounded-xl bg-slate-100 ${colorClasses[color] || ''}`}>
        <IconComponent className="w-5 h-5" />
      </div>
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </button>
  );
}

// Activity Item Component
function ActivityItem({ activity }) {
  const getIcon = () => {
    switch (activity.status) {
      case 'approved': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'declined': return <XCircleIcon className="w-4 h-4 text-red-600" />;
      case 'submitted': return <UploadIcon className="w-4 h-4 text-blue-600" />;
      default: return <SaveIcon className="w-4 h-4 text-slate-600" />;
    }
  };

  const getMessage = () => {
    switch (activity.status) {
      case 'approved': return 'Your submission was approved';
      case 'declined': return 'Your submission needs revision';
      case 'submitted': return 'Submitted for review';
      default: return 'Draft saved';
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
      <div className="p-2 bg-slate-100 rounded-lg shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{getMessage()}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {new Date(activity.updated_at || activity.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      <StatusBadge status={activity.status} />
    </div>
  );
}

// My Submissions Component
function MySubmissions({ user, onNavigate }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user?.user_id) return;
      
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/document/user/${user.user_id}`);
        if (response.ok) {
          const data = await response.json();
          const sorted = data.sort((a, b) => 
            new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
          );
          setSubmissions(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch submissions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user?.user_id]);

  const getFilename = (doc) => {
    if (doc.file_path) {
      const parts = doc.file_path.split(/[/\\]/);
      return parts[parts.length - 1];
    }
    return `Document #${doc.id}`;
  };

  const getSignedFilename = (doc) => {
    if (doc.review_file_path) {
      const parts = doc.review_file_path.split(/[/\\]/);
      return parts[parts.length - 1];
    }
    return null;
  };

  const filteredSubmissions = submissions.filter(doc => {
    const matchesFilter = filter === 'all' || doc.status === filter;
    const matchesSearch = getFilename(doc).toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/document/${docId}?user_id=${user.user_id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSubmissions(submissions.filter(doc => doc.id !== docId));
      } else {
        alert('Failed to delete document');
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleView = (doc) => {
    onNavigate("Upload Attendance");
    window.history.pushState({}, '', `?doc_id=${doc.id}`);
  };

  const handleDownloadSigned = (doc) => {
    window.open(`http://127.0.0.1:5000/api/document/download/${doc.id}`, '_blank');
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Drafts' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileTextIcon className="w-7 h-7 text-indigo-600" />
            My Submissions
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track and manage all your document submissions</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-full md:w-64"
            />
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </Icon>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          >
            {filterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <button
            onClick={() => onNavigate("Upload Attendance")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            <UploadIcon className="w-4 h-4" />
            New Submission
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filterOptions.slice(1).map(opt => {
          const count = submissions.filter(d => d.status === opt.value).length;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`p-4 rounded-xl border text-left transition-all ${filter === opt.value ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <p className="text-2xl font-bold text-slate-800">{count}</p>
              <p className="text-sm text-slate-500">{opt.label}s</p>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Loading submissions...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <FileTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No submissions found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            {search || filter !== 'all' ? "Try adjusting your search or filter criteria" : "Start by creating your first attendance submission"}
          </p>
          <button
            onClick={() => onNavigate("Upload Attendance")}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Create Submission
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Document</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Signed Document</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <FileTextIcon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{getFilename(doc).replace('.json', '')}</p>
                        <p className="text-xs text-slate-500">ID: {doc.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-6 py-4">
                    {doc.review_file_path ? (
                      <button
                        onClick={() => handleDownloadSigned(doc)}
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        {getSignedFilename(doc)}
                      </button>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(doc.updated_at || doc.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {doc.review_file_path && (
                        <button
                          onClick={() => handleDownloadSigned(doc)}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download Signed Document"
                        >
                          <DownloadIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleView(doc)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View/Edit"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {doc.status === 'draft' && (
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Main Dashboard Component
function DashboardHome({ user, onNavigate }) {
  const [stats, setStats] = useState({ total: 0, draft: 0, submitted: 0, approved: 0, declined: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.user_id) return;
      
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/document/user/${user.user_id}`);
        if (response.ok) {
          const data = await response.json();
          
          const statsData = {
            total: data.length,
            draft: data.filter(d => d.status === 'draft' || d.is_draft).length,
            submitted: data.filter(d => d.status === 'submitted').length,
            approved: data.filter(d => d.status === 'approved').length,
            declined: data.filter(d => d.status === 'declined').length,
          };
          setStats(statsData);

          const sorted = [...data].sort((a, b) => 
            new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
          );
          setRecentActivity(sorted.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.user_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, {user?.first_name || 'Employee'}! 👋</h2>
          <p className="text-slate-500 mt-1">Here's what's happening with your submissions today.</p>
        </div>
        <button
          onClick={() => onNavigate("Upload Attendance")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
        >
          <UploadIcon className="w-4 h-4" />
          New Submission
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Submissions" value={stats.total} icon={FileTextIcon} color="indigo" />
        <StatsCard title="Drafts (Pending)" value={stats.draft} icon={ClockIcon} color="yellow" />
        <StatsCard title="Submitted" value={stats.submitted} icon={AlertCircleIcon} color="blue" />
        <StatsCard title="Approved" value={stats.approved} icon={CheckCircleIcon} color="green" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-indigo-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction icon={UploadIcon} title="New Submission" description="Create attendance report" onClick={() => onNavigate("Upload Attendance")} color="blue" />
          <QuickAction icon={SaveIcon} title="Saved Progress" description="Continue working on drafts" onClick={() => onNavigate("Saved Progress")} color="purple" />
          <QuickAction icon={FileTextIcon} title="My Submissions" description="View all submissions" onClick={() => onNavigate("My Submissions")} color="green" />
          <QuickAction icon={UserIcon} title="My Profile" description="Update your information" onClick={() => window.location.href = '/profile'} color="orange" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUpIcon className="w-5 h-5 text-indigo-600" />
              Recent Activity
            </h3>
            <button onClick={() => onNavigate("My Submissions")} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All →
            </button>
          </div>
          
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <ClockIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No recent activity yet</p>
              <p className="text-sm">Start by creating your first submission</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-600" />
            Your Profile
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {user?.first_name?.charAt(0) || 'U'}{user?.last_name?.charAt(0) || ''}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">{user?.full_name || 'Employee'}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <BriefcaseIcon className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-slate-500">Position</p>
                  <p className="font-medium text-slate-800">{user?.position_name || 'Not assigned'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <MapPinIcon className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-slate-500">Office</p>
                  <p className="font-medium text-slate-800">{user?.office_name || 'Not assigned'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-slate-500">Provincial Officer</p>
                  <p className="font-medium text-slate-800">{user?.provincial_officer || 'Not assigned'}</p>
                </div>
              </div>
            </div>

            <button onClick={() => window.location.href = '/profile'} className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-medium transition-colors text-sm">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Submit for Approval Component
function SubmitForApproval({ user, onNavigate }) {
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [loadingReviewers, setLoadingReviewers] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/document/reviewers');
        if (response.ok) {
          const data = await response.json();
          setReviewers(data);
          if (data.length === 1) {
            setSelectedReviewerId(data[0].id.toString());
          }
        }
      } catch (err) {
        console.error("Failed to fetch reviewers:", err);
      } finally {
        setLoadingReviewers(false);
      }
    };
    fetchReviewers();
  }, []);

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length > 0) {
      setFiles([...files, ...newFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileTextIcon className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileTextIcon className="w-5 h-5 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileTextIcon className="w-5 h-5 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileTextIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <FileTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleConvertAndSubmit = async () => {
    if (files.length === 0) {
      setError("Please attach at least one file");
      return;
    }

    if (!selectedReviewerId) {
      setError("Please select a reviewer");
      return;
    }

    setConverting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('user_id', user.user_id);
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      const uploadResponse = await fetch('/api/document/upload-attachments', {
        method: 'POST',
        body: formData
      });

      let uploadResult;
      const contentType = uploadResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        uploadResult = await uploadResponse.json();
      } else {
        const text = await uploadResponse.text();
        console.error('Non-JSON response:', text);
        setError('Server error: ' + (uploadResponse.statusText || 'Invalid response'));
        return;
      }

      if (!uploadResponse.ok) {
        setError(uploadResult.error || 'Failed to convert files to PDF');
        return;
      }

      const createDocFormData = new FormData();
      createDocFormData.append('user_id', user.user_id);
      
      const fileResponse = await fetch(`/static/${uploadResult.file_path}`);
      const fileBlob = await fileResponse.blob();
      const fileName = uploadResult.file_path.split('/').pop();
      const convertedFile = new File([fileBlob], fileName, { type: 'application/pdf' });
      createDocFormData.append('file', convertedFile);

      const createDocResponse = await fetch('/api/document/upload', {
        method: 'POST',
        body: createDocFormData
      });

      const createDocResult = await createDocResponse.json();

      if (!createDocResponse.ok) {
        setError(createDocResult.error || 'Failed to create document');
        return;
      }

      const submitFormData = new FormData();
      submitFormData.append('user_id', user.user_id);
      submitFormData.append('reviewer_id', selectedReviewerId);

      const submitResponse = await fetch(`/api/document/submit/${createDocResult.document.id}`, {
        method: 'POST',
        body: submitFormData
      });

      const submitResult = await submitResponse.json();

      if (submitResponse.ok) {
        const selectedReviewer = reviewers.find(r => r.id.toString() === selectedReviewerId);
        const reviewerName = selectedReviewer ? selectedReviewer.full_name : 'selected reviewer';
        
        alert(`Successfully submitted to ${reviewerName}!`);
        setFiles([]);
        setSelectedReviewerId(reviewers.length === 1 ? reviewers[0].id.toString() : '');
      } else {
        setError(submitResult.error || 'Failed to submit document to reviewer');
      }
    } catch (err) {
      console.error("Full error:", err);
      let errorMessage = err.message;
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        errorMessage = 'Failed to connect to the server. Please ensure the backend is running.';
      } else if (err.message && err.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and ensure the backend is running.';
      }
      setError('Error: ' + errorMessage + '. Please check if the backend server is running.');
    } finally {
      setConverting(false);
    }
  };

  const SendIcon = ({ className }) => (
    <Icon className={className}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </Icon>
  );

  const XIcon = ({ className }) => (
    <Icon className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Icon>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
          <SendIcon className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Submit for Approval</h2>
        <p className="text-slate-500 text-sm mt-1">Attach files, select a reviewer, and submit for approval</p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        {/* File Drop Zone Section */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 mb-1 flex items-center gap-2">
            <UploadIcon className="w-5 h-5 text-indigo-500" />
            Attach Files
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Attach multiple files. They will be converted to PDF and submitted to your reviewer.
          </p>

          <div 
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
              const droppedFiles = Array.from(e.dataTransfer.files);
              if (droppedFiles.length > 0) {
                setFiles([...files, ...droppedFiles]);
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png,.pdf,.txt"
              onChange={(e) => {
                const newFiles = Array.from(e.target.files);
                if (newFiles.length > 0) {
                  setFiles([...files, ...newFiles]);
                }
              }}
              className="hidden"
            />
            <div className="w-14 h-14 mx-auto mb-3 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
              Click to select files or drag and drop
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Excel (.xlsx, .xls) • Word (.doc, .docx) • Images (.jpg, .png) • PDF
            </p>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">
                  Selected Files <span className="text-indigo-600">({files.length})</span>
                </p>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-slate-500 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                        {getFileIcon(file.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reviewer Selection Section */}
        <div className="p-6 bg-slate-50/50">
          <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-500" />
            Select Reviewer <span className="text-red-500">*</span>
          </label>
          {loadingReviewers ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              Loading reviewers...
            </div>
          ) : reviewers.length === 0 ? (
            <p className="text-sm text-red-500">No reviewers available. Please contact your administrator.</p>
          ) : (
            <select
              value={selectedReviewerId}
              onChange={(e) => setSelectedReviewerId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm shadow-sm"
            >
              <option value="">-- Select a Reviewer --</option>
              {reviewers.map(reviewer => (
                <option key={reviewer.id} value={reviewer.id}>
                  {reviewer.full_name} {reviewer.office_location ? `(${reviewer.office_location})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircleIcon className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="p-6 border-t border-slate-100">
          <button
            onClick={handleConvertAndSubmit}
            disabled={files.length === 0 || converting || !selectedReviewerId || loadingReviewers}
            className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
          >
            {converting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Converting & Submitting...
              </>
            ) : (
              <>
                <SendIcon className="w-5 h-5" />
                Convert & Submit for Approval
              </>
            )}
          </button>
        </div>
      </div>

      {/* Help Text */}
      <p className="text-center text-xs text-slate-400">
        Files will be automatically converted to PDF before submission
      </p>
    </div>
  );
}

// Main EmployeeDashboard Component
export default function EmployeeDashboard({ selectedMenu, setActivePage, user }) {
  const navigate = useNavigate();

  const handleNavigate = (menu) => {
    switch (menu) {
      case "Dashboard":
        navigate('/');
        break;
      case "Upload Attendance":
        navigate('/upload');
        break;
      case "Saved Progress":
        navigate('/saved-progress');
        break;
      case "Submit for Approval":
        navigate('/submit-for-approval');
        break;
      case "My Submissions":
        navigate('/submissions');
        break;
      default:
        navigate('/');
    }
  };

  switch (selectedMenu) {
    case "Dashboard":
      return (
        <div className="p-6">
          <DashboardHome user={user} onNavigate={handleNavigate} />
        </div>
      );

    case "Upload Attendance":
      return <UploadAttendance user={user} />;

    case "Saved Progress":
      return <SavedProgress user={user} onResumeWork={(doc) => {
        navigate(`/upload?doc_id=${doc.id}`);
      }} onNewProgress={() => navigate('/upload')} />;

    case "Submit for Approval":
      return (
        <div className="p-6">
          <SubmitForApproval user={user} onNavigate={handleNavigate} />
        </div>
      );

    case "My Submissions":
      return (
        <div className="p-6">
          <MySubmissions user={user} onNavigate={handleNavigate} />
        </div>
      );

    default:
      return (
        <div className="p-6">
          <DashboardHome user={user} onNavigate={handleNavigate} />
        </div>
      );
  }
}
