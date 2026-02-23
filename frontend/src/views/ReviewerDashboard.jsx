import React, { useState, useEffect } from 'react';

const ReviewerDashboard = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchDocuments();
    }
  }, [user?.id]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/document/reviewer/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
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
        setDocuments(documents.filter(doc => doc.id !== docId));
        setShowApproveModal(false);
        setSelectedDoc(null);
        alert('Document approved successfully!');
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

  const handleDecline = async (docId) => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }
    
    setProcessing(docId);
    try {
      const formData = new FormData();
      formData.append('user_id', user.user_id);
      formData.append('action', 'decline');
      formData.append('reason', declineReason);
      
      const response = await fetch(`http://127.0.0.1:5000/api/document/review/${docId}`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== docId));
        setShowDeclineModal(false);
        setSelectedDoc(null);
        setDeclineReason('');
        alert('Document declined');
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

  const openDeclineModal = (doc) => {
    setSelectedDoc(doc);
    setShowDeclineModal(true);
  };

  const getEmployeeName = (doc) => {
    return doc.employee_name || `Employee #${doc.employee_id}`;
  };

  const getDocumentName = (doc) => {
    if (doc.file_path) {
      const parts = doc.file_path.split(/[/\\]/);
      return parts[parts.length - 1];
    }
    return `Document #${doc.id}`;
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

  const ApproveModal = () => {
    if (!showApproveModal) return null;
    
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
            {selectedDoc && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-sm"><strong>Document:</strong> {getDocumentName(selectedDoc)}</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => { setShowApproveModal(false); setSelectedDoc(null); }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => handleApprove(selectedDoc.id)}
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

  const DeclineModal = () => {
    if (!showDeclineModal) return null;
    
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
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
              rows="3"
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => { setShowDeclineModal(false); setSelectedDoc(null); setDeclineReason(''); }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDecline(selectedDoc.id)}
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

  const pendingCount = documents.filter(d => d.status === 'submitted').length;

  return (
    <div>
      <ApproveModal />
      <DeclineModal />
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Reviewer Dashboard</h2>
        <p className="text-slate-500">
          You have <strong className="text-slate-800">{pendingCount} document{pendingCount !== 1 ? 's' : ''}</strong> waiting for your approval.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg shadow-red-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-90 mb-1">Action Required</p>
            <h3 className="text-3xl font-bold">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Reviewed</p>
            <h3 className="text-3xl font-bold text-slate-800">{documents.filter(d => d.status === 'approved' || d.status === 'declined').length}</h3>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">My Team</p>
            <h3 className="text-3xl font-bold text-slate-800">--</h3>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50">
          <h3 className="font-bold text-red-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Pending Reviews
          </h3>
          <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">
            {pendingCount} pending
          </span>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p>Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 mb-4 opacity-50">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-lg font-medium text-slate-600">No pending reviews</p>
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
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                          {getEmployeeName(doc).charAt(0)}
                        </div>
                        {getEmployeeName(doc)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileIcon />
                        <span>{getDocumentName(doc).replace('.json', '')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{formatDate(doc.submitted_at)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openDeclineModal(doc)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewerDashboard;
