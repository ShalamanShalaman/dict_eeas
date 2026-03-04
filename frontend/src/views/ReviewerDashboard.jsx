import React, { useState, useEffect } from 'react';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ArchiveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const getDocumentName = (document) => {
  if (document?.file_path) {
    const parts = document.file_path.split(/[/\\]/);
    return parts[parts.length - 1];
  }
  return `Document #${document?.id}`;
};

// Inline PDF Viewer Modal
const PDFViewerModal = ({ isOpen, onClose, documentId, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800 truncate pr-4 flex items-center gap-2">
            <FileIcon />
            {title || 'Document Viewer'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <XIcon />
          </button>
        </div>
        <div className="flex-1 bg-slate-100 relative">
          {documentId ? (
            <iframe
              src={`http://127.0.0.1:5000/api/document/view/${documentId}`}
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <FileIcon />
              <p className="mt-2 text-sm">No document selected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ApproveModal = ({ isOpen, doc, onClose, onApprove, processing }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckIcon />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Approve Document</h3>
            <p className="text-sm text-slate-500">This action cannot be undone</p>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to approve this document? The employee will be notified.
          </p>
          {doc && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-sm"><strong>Document:</strong> {getDocumentName(doc).replace('.json', '')}</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onApprove(doc.id)}
            disabled={processing}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            {processing ? 'Approving...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeclineModal = ({ isOpen, doc, onClose, onDecline, processing }) => {
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDeclineReason('');
    }
  }, [isOpen, doc?.id]);

  if (!isOpen) return null;

  const handleDecline = () => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }
    onDecline(doc.id, declineReason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <XIcon />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Decline Document</h3>
            <p className="text-sm text-slate-500">Provide a reason for declining</p>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Reason for declining <span className="text-red-500">*</span>
          </label>
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Explain why this document is being declined..."
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm h-32 resize-none"
            rows="4"
            autoFocus
          />
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDecline}
            disabled={processing || !declineReason.trim()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            {processing ? 'Declining...' : 'Decline'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeclineSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl transform transition-all">
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center animate-bounce">
              <XIcon />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Document Declined
          </h3>
          
          <p className="text-sm text-slate-500 text-center mb-6">
            The document has been declined and the employee will be notified.
          </p>
          
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const UploadModal = ({ isOpen, doc, onClose, onUpload, uploading }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
    }
  }, [isOpen, doc?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <UploadIcon />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Upload Signed Document</h3>
            <p className="text-sm text-slate-500">Upload and approve in one step</p>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Signed Document <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">Supported: PDF, DOC, DOCX, XLS, XLSX</p>
        </div>
        
        {doc && (
          <div className="bg-slate-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-slate-600">
              <strong>Original:</strong> {getDocumentName(doc).replace('.json', '')}
            </p>
          </div>
        )}
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onUpload(doc.id, selectedFile)}
            disabled={!selectedFile || uploading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            {uploading ? 'Uploading...' : 'Upload & Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ReviewerDashboard = ({ user, isArchiveView = false }) => {
  const [pendingDocs, setPendingDocs] = useState([]);
  const [archivedDocs, setArchivedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showDeclineSuccessModal, setShowDeclineSuccessModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [viewPdfModal, setViewPdfModal] = useState({ isOpen: false, docId: null, title: '' });

  useEffect(() => {
    if (user?.id) {
      fetchDocuments();
    }
  }, [user?.id]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/document/reviewer/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPendingDocs(data);
      }
      
      const archiveResponse = await fetch(`http://127.0.0.1:5000/api/document/reviewer-archive/${user.id}`);
      if (archiveResponse.ok) {
        const archiveData = await archiveResponse.json();
        setArchivedDocs(archiveData);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (doc) => {
    const url = doc.review_file_path 
      ? `http://127.0.0.1:5000/static/${doc.review_file_path}`
      : `http://127.0.0.1:5000/api/document/download/${doc.id}?reviewer_id=${user.user_id}`;
    window.open(url, '_blank');
  };

  const handleUploadSigned = async (docId, file) => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }
    
    setUploadingFile(docId);
    try {
      const formData = new FormData();
      formData.append('user_id', user.user_id);
      formData.append('file', file);
      
      const response = await fetch(`http://127.0.0.1:5000/api/document/upload-review/${docId}`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setShowUploadModal(false);
        fetchDocuments();
      } else {
        const error = await response.json();
        alert('Failed to upload: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setUploadingFile(null);
    }
  };

  const handleApprove = async (docId) => {
    setProcessing(docId);
    try {
      const formData = new FormData();
      formData.append('user_id', user.user_id);
      formData.append('action', 'approve');
      
      const response = await fetch(`http://127.0.0.1:5000/api/document/review/${docId}`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setPendingDocs(pendingDocs.filter(doc => doc.id !== docId));
        setShowApproveModal(false);
        setSelectedDoc(null);
        fetchDocuments();
      } else {
        const error = await response.json();
        alert('Failed to approve: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (docId, reason) => {
    setProcessing(docId);
    try {
      const formData = new FormData();
      formData.append('user_id', user.user_id);
      formData.append('action', 'decline');
      formData.append('reason', reason);
      
      const response = await fetch(`http://127.0.0.1:5000/api/document/review/${docId}`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setPendingDocs(pendingDocs.filter(doc => doc.id !== docId));
        closeDeclineModal();
        setShowDeclineSuccessModal(true);
        fetchDocuments();
      } else {
        const error = await response.json();
        alert('Failed to decline: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  const openApproveModal = (doc) => {
    setSelectedDoc(doc);
    setShowApproveModal(true);
  };

  const closeApproveModal = () => {
    setShowApproveModal(false);
    setSelectedDoc(null);
  };

  const openDeclineModal = (doc) => {
    setSelectedDoc(doc);
    setShowDeclineModal(true);
  };

  const closeDeclineModal = () => {
    setShowDeclineModal(false);
    setSelectedDoc(null);
  };

  const openUploadModal = (doc) => {
    setSelectedDoc(doc);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedDoc(null);
  };

  const getEmployeeName = (doc) => {
    return doc.employee_name || `Employee #${doc.employee_id}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingCount = pendingDocs.filter(d => d.status === 'submitted').length;
  const archiveCount = archivedDocs.length;
  const approvedCount = archivedDocs.filter(d => d.status === 'approved').length;
  const declinedCount = archivedDocs.filter(d => d.status === 'declined').length;

  const renderDocumentRow = (doc, isArchive = false) => (
    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            {getEmployeeName(doc).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900">{getEmployeeName(doc)}</p>
            <p className="text-xs text-slate-400">ID: {doc.employee_id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-50 rounded text-red-500">
            <FileIcon />
          </div>
          <span className="font-medium">{getDocumentName(doc).replace('.json', '')}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-slate-600">{formatDate(doc.submitted_at || doc.updated_at)}</p>
      </td>
      <td className="px-6 py-4">
        {isArchive ? (
          doc.status === 'approved' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircleIcon /> Approved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <XIcon /> Declined
            </span>
          )
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <ClockIcon /> Pending
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => setViewPdfModal({ isOpen: true, docId: doc.id, title: getDocumentName(doc).replace('.json', '') })}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="View Document"
          >
            <EyeIcon />
          </button>
          <button 
            onClick={() => handleDownload(doc)}
            className="p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors"
            title={isArchive ? "Download Signed Document" : "Download Document"}
          >
            <DownloadIcon />
          </button>
          {!isArchive && (
            <>
              <button 
                onClick={() => openUploadModal(doc)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Upload Signed Document"
              >
                <UploadIcon />
              </button>
              <button 
                onClick={() => openDeclineModal(doc)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Decline"
              >
                <XIcon />
              </button>
              <button 
                onClick={() => openApproveModal(doc)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-sm flex items-center gap-1"
              >
                <CheckIcon />
                Approve
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );

  if (isArchiveView) {
    return (
      <div>
        <PDFViewerModal
          isOpen={viewPdfModal.isOpen}
          onClose={() => setViewPdfModal({ isOpen: false, docId: null, title: '' })}
          documentId={viewPdfModal.docId}
          title={viewPdfModal.title}
        />
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Archive</h2>
          <p className="text-slate-500">
            View approved and declined document submissions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg shadow-green-200 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-90 mb-1">Approved</p>
              <h3 className="text-3xl font-bold">{approvedCount}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <CheckCircleIcon />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white p-6 rounded-xl shadow-lg shadow-red-200 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-90 mb-1">Declined</p>
              <h3 className="text-3xl font-bold">{declinedCount}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <XIcon />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Processed</p>
              <h3 className="text-3xl font-bold text-slate-800">{archiveCount}</h3>
            </div>
            <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
              <ArchiveIcon />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p>Loading documents...</p>
            </div>
          ) : archivedDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 mb-4 opacity-50">
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
              <p className="text-lg font-medium text-slate-600">No archived documents</p>
              <p className="text-sm">Approved or declined documents will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-6 py-3">Document</th>
                    <th className="px-6 py-3">Date Processed</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {archivedDocs.map(doc => renderDocumentRow(doc, true))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PDFViewerModal
        isOpen={viewPdfModal.isOpen}
        onClose={() => setViewPdfModal({ isOpen: false, docId: null, title: '' })}
        documentId={viewPdfModal.docId}
        title={viewPdfModal.title}
      />
      <ApproveModal 
        isOpen={showApproveModal} 
        doc={selectedDoc}
        onClose={closeApproveModal}
        onApprove={handleApprove}
        processing={processing}
      />
      <DeclineModal 
        isOpen={showDeclineModal} 
        doc={selectedDoc}
        onClose={closeDeclineModal}
        onDecline={handleDecline}
        processing={processing}
      />
      <DeclineSuccessModal 
        isOpen={showDeclineSuccessModal}
        onClose={() => setShowDeclineSuccessModal(false)}
      />
      <UploadModal 
        isOpen={showUploadModal}
        doc={selectedDoc}
        onClose={closeUploadModal}
        onUpload={handleUploadSigned}
        uploading={uploadingFile}
      />
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Reviewer Dashboard</h2>
        <p className="text-slate-500">
          Manage and review employee document submissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-6 rounded-xl shadow-lg shadow-orange-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">Pending</p>
            <h3 className="text-3xl font-bold">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <ClockIcon />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg shadow-green-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">Approved</p>
            <h3 className="text-3xl font-bold">{approvedCount}</h3>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <CheckCircleIcon />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white p-6 rounded-xl shadow-lg shadow-red-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">Declined</p>
            <h3 className="text-3xl font-bold">{declinedCount}</h3>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <XIcon />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Processed</p>
            <h3 className="text-3xl font-bold text-slate-800">{archiveCount}</h3>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <ArchiveIcon />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <ClockIcon />
              Pending Review
              {pendingCount > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full text-xs">
                  {pendingCount}
                </span>
              )}
            </button>
          </nav>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p>Loading documents...</p>
          </div>
        ) : activeTab === 'pending' ? (
          pendingDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 mb-4 opacity-50">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p className="text-lg font-medium text-slate-600">No pending documents</p>
              <p className="text-sm">All caught up!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-6 py-3">Document</th>
                    <th className="px-6 py-3">Date Submitted</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingDocs.map(doc => renderDocumentRow(doc, false))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          archivedDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 mb-4 opacity-50">
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
              <p className="text-lg font-medium text-slate-600">No archived documents</p>
              <p className="text-sm">Approved or declined documents will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-3">Employee</th>
                    <th className="px-6 py-3">Document</th>
                    <th className="px-6 py-3">Date Processed</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {archivedDocs.map(doc => renderDocumentRow(doc, true))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ReviewerDashboard;