import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";

const PDFViewerModal = ({ isOpen, onClose, documentId, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800 truncate pr-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {title || 'Document Viewer'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 bg-slate-100 relative">
          {documentId ? (
            <iframe
              src={`${import.meta.env.VITE_API_BASE_URL}/api/document/view/${documentId}`}
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mb-4">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p className="mt-2 text-sm">No document selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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

const TrashIcon = ({ className }) => (
  <Icon className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
);

const EyeIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
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

const StatusBadge = ({ status }) => {
  const styles = {
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    submitted: "bg-blue-100 text-blue-700 border-blue-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    declined: "bg-red-100 text-red-700 border-red-200",
  };
  
  const icons = {
    draft: <ClockIcon className="w-3 h-3" />,
    submitted: <AlertCircleIcon className="w-3 h-3" />,
    pending: <ClockIcon className="w-3 h-3" />,
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

export default function MySubmissions({ user }) {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewPdfModal, setViewPdfModal] = useState({ isOpen: false, docId: null, title: '' });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, docId: null });

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user?.user_id) return;
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/document/user/${user.user_id}`);
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
    if (doc.is_draft === true) return false;
    
    const matchesFilter = filter === 'all' || doc.status === filter;
    const matchesSearch = getFilename(doc).toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDeleteClick = (docId) => {
    setDeleteDialog({ isOpen: true, docId });
  };

  const handleConfirmDelete = async () => {
    const docId = deleteDialog.docId;
    setDeleteDialog({ isOpen: false, docId: null });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/document/${docId}?user_id=${user.user_id}`, {
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

  const handleViewPdf = (doc) => {
    const filename = getFilename(doc);
    setViewPdfModal({
      isOpen: true,
      docId: doc.id,
      title: filename.replace('.json', '')
    });
  };

  const handleDownloadSigned = (doc) => {
    window.open(`${import.meta.env.VITE_API_BASE_URL}/api/document/download/${doc.id}`, '_blank');
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'pending', label: 'Pending' },
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
            onClick={() => navigate('/upload')}
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
            onClick={() => navigate("/upload")}
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
                    {doc.status === 'declined' && doc.reviewer_note && (
                      <div className="mt-2 p-2 bg-red-50 rounded-lg">
                        <p className="text-xs text-red-600 font-medium">Rejection Reason:</p>
                        <p className="text-xs text-red-500 italic">"{doc.reviewer_note}"</p>
                      </div>
                    )}
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
                      <button 
                        onClick={() => handleViewPdf(doc)}
                        className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Document"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
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
                        onClick={() => handleDeleteClick(doc.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <PDFViewerModal
        isOpen={viewPdfModal.isOpen}
        onClose={() => setViewPdfModal({ isOpen: false, docId: null, title: '' })}
        documentId={viewPdfModal.docId}
        title={viewPdfModal.title}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, docId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
}