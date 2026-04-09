import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.draft}`}>
      {icons[status] || icons.draft}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

function StatsCard({ title, value, icon: IconComponent, variant }) {
  if (variant === 'white') {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
          <IconComponent className="w-5 h-5" />
        </div>
      </div>
    );
  }

  const gradientClasses = {
    amber: "bg-gradient-to-br from-amber-500 to-orange-500 shadow-orange-200",
    blue: "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200",
    green: "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-200",
    red: "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-200",
  };

  return (
    <div className={`${gradientClasses[variant]} text-white p-6 rounded-xl shadow-lg flex items-start justify-between`}>
      <div>
        <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
      </div>
      <div className="p-3 bg-white/20 rounded-lg">
        <IconComponent className="w-5 h-5" />
      </div>
    </div>
  );
}

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
    <div className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0">
      <div className="p-2 bg-slate-100 rounded-lg shrink-0 mt-0.5">
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
      <div className="shrink-0 mt-1">
        <StatusBadge status={activity.status} />
      </div>
    </div>
  );
}

export default function EmployeeDashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, draft: 0, submitted: 0, approved: 0, declined: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageHash, setImageHash] = useState(() => Date.now());

  useEffect(() => {
    setImageHash(Date.now());
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.user_id) return;
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/document/user/${user.user_id}`);
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
      <div className="p-6 bg-slate-50 min-h-screen flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.first_name || 'Employee'}! 👋</h2>
          <p className="text-slate-500 mt-1">Here's what's happening with your submissions today.</p>
        </div>
        <button
          onClick={() => navigate("/upload")}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
        >
          <UploadIcon className="w-4 h-4" />
          New Submission
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Submissions" value={stats.total} icon={FileTextIcon} variant="white" />
        <StatsCard title="Drafts (Pending)" value={stats.draft} icon={ClockIcon} variant="amber" />
        <StatsCard title="Submitted" value={stats.submitted} icon={AlertCircleIcon} variant="blue" />
        <StatsCard title="Approved" value={stats.approved} icon={CheckCircleIcon} variant="green" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-indigo-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction icon={UploadIcon} title="New Submission" description="Create attendance report" onClick={() => navigate("/upload")} color="blue" />
          <QuickAction icon={SaveIcon} title="Saved Progress" description="Continue working on drafts" onClick={() => navigate("/saved-progress")} color="purple" />
          <QuickAction icon={FileTextIcon} title="My Submissions" description="View all submissions" onClick={() => navigate("/submissions")} color="green" />
          <QuickAction icon={UserIcon} title="My Profile" description="Update your information" onClick={() => navigate("/profile")} color="orange" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUpIcon className="w-5 h-5 text-indigo-600" />
              Recent Activity
            </h3>
            <button onClick={() => navigate("/submissions")} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All →
            </button>
          </div>
          
          <div className="p-4">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <ClockIcon className="w-10 h-10 mb-3 opacity-50" />
                <p className="font-medium text-slate-600">No recent activity yet</p>
                <p className="text-sm">Start by creating your first submission</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentActivity.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-600" />
            Your Profile
          </h3>
          
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              {user?.profile_picture ? (
                <img 
                  key={imageHash}
                  src={`http://127.0.0.1:8000/storage/profile_pictures/${user.profile_picture}?t=${imageHash}`}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-600 shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-purple-900 font-bold text-2xl shadow-md ${user?.profile_picture ? 'hidden' : ''}`}>
                <span className="text-2xl font-bold">
                  {user?.first_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">{user?.full_name || 'Employee'}</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <BriefcaseIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-0.5">Position</p>
                  <p className="font-semibold text-slate-800">{user?.position_name || user?.position_id || 'Not assigned'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <MapPinIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-0.5">Office</p>
                  <p className="font-semibold text-slate-800">{user?.office_name || user?.office_location_id || 'Not assigned'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <UserIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-0.5">Provincial Officer</p>
                  <p className="font-semibold text-slate-800">{user?.provincial_officer || 'Not assigned'}</p>
                </div>
              </div>
            </div>

            <button onClick={() => navigate("/profile")} className="w-full mt-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2.5 rounded-lg font-medium transition-colors text-sm">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}