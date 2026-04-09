import React, { useState, useEffect } from "react";
import PDFViewerModal from "./PDFViewerModal.jsx";


const Icon = ({ children, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

const FileIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </Icon>
);

const EyeIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </Icon>
);

const DownloadIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </Icon>
);

const UserIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </Icon>
);

const EditIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </Icon>
);

const TrashIcon = ({ className }) => (
  <Icon className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </Icon>
);

export default function SharedPDFList({ onUsePDF, refreshSharedPDFs }) {
  const [sharedPDFs, setSharedPDFs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    if (refreshSharedPDFs) {
      fetchSharedPDFs();
    }
  }, [refreshSharedPDFs]);

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const office = currentUser?.office_name || '';

  const formatDisplayName = (filePath, docId, displayName = '') => {
    if (displayName && displayName.trim()) return displayName.trim();
    const base = filePath ? filePath.split('/').pop() : '';
    if (!base) return `shared_${docId}.pdf`;
    // Remove generated prefixes like "shared_<id>_" or "<id>_"
    return base.replace(/^shared_[^_]+_/, '').replace(/^[^_]+_/, '');
  };

  useEffect(() => {
    if (office) {
      fetchSharedPDFs();
    }
  }, [office]);

  const fetchSharedPDFs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        user_id: String(currentUser?.user_id || ''),
        days: '0'
      });
      if (office) params.set('office', office);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/shared-pdf/list?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shared PDFs');
      }
      const data = await response.json();
      setSharedPDFs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUsePDF = async (doc) => {
    try {
      console.log('Using shared PDF:', doc);
      // Fetch the PDF blob as stream to preserve file integrity
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/document/view/${doc.id}`);
      if (!response.ok) throw new Error('Failed to load PDF');
      
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'type:', blob.type);
      
      if (!blob || blob.size === 0) {
        throw new Error('Empty PDF file received');
      }
      
      const fileName = formatDisplayName(doc.file_path, doc.id, doc.display_name);
      const file = new File([blob], fileName, { type: 'application/pdf' });
      
      // Callback to parent
      if (onUsePDF) {
        onUsePDF(file);
      }
    } catch (err) {
      console.error('Shared PDF error:', err);
      alert('Failed to load shared PDF: ' + err.message);
    }
  };

  const handleRename = async (doc) => {
    const currentName = formatDisplayName(doc.file_path, doc.id, doc.display_name);
    const nextName = window.prompt('Rename shared PDF:', currentName);
    if (!nextName) return;

    const trimmed = nextName.trim();
    if (!trimmed) return;
    if (trimmed === currentName) return;

    const renameConfirmed = window.confirm(`Rename "${currentName}" to "${trimmed}"?`);
    if (!renameConfirmed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/document/rename/${doc.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: trimmed,
          user_id: currentUser?.user_id
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Rename failed');

      fetchSharedPDFs();
    } catch (err) {
      alert('Failed to rename PDF: ' + err.message);
    }
  };

  const handleDelete = async (doc) => {
    const targetName = formatDisplayName(doc.file_path, doc.id, doc.display_name);
    const ok = window.confirm(`Delete "${targetName}"?\n\nThis cannot be undone.`);
    if (!ok) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/document/${doc.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser?.user_id })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Delete failed');

      fetchSharedPDFs();
    } catch (err) {
      alert('Failed to delete PDF: ' + err.message);
    }
  };

  const previewPDF = (doc) => {
    setSelectedDoc(doc);
    setShowViewer(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-500">
        Loading shared PDFs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">
        Error: {error}
        <button onClick={fetchSharedPDFs} className="ml-2 text-blue-600 hover:underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileIcon className="w-5 h-5 text-blue-600" />
          Shared Attendance PDFs ({sharedPDFs.length})
        </h3>
        <button 
          onClick={fetchSharedPDFs}
          className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700"
          title="Refresh list"
        >
          ↻
        </button>
      </div>

      {sharedPDFs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <FileIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p>No shared PDFs available for your office yet.</p>
          <p className="text-sm">Upload one using the drag & drop zone above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sharedPDFs.map((doc) => (
            <div key={doc.id} className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all overflow-hidden">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                  <FileIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate text-sm">{formatDisplayName(doc.file_path, doc.id, doc.display_name)}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <UserIcon className="w-3 h-3" />
                    Uploaded by {doc.employee_name || 'Unknown'}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => previewPDF(doc)}
                  className="flex-1 p-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center gap-1 group-hover:text-blue-600"
                  title="Preview PDF"
                >
                  <EyeIcon className="w-3 h-3 group-hover:text-blue-600" />
                  Preview
                </button>
                <button
                  onClick={() => handleUsePDF(doc)}
                  className="flex-1 p-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                  title="Use this PDF for attendance extraction"
                >
                  <DownloadIcon className="w-3 h-3" />
                  Use PDF
                </button>
                <button
                  onClick={() => handleRename(doc)}
                  className="p-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  title="Rename shared PDF"
                >
                  <EditIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(doc)}
                  className="p-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete shared PDF"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showViewer && (
        <PDFViewerModal
          isOpen={showViewer}
          onClose={() => setShowViewer(false)}
          documentId={selectedDoc?.id}
          title={selectedDoc?.file_path || 'Shared PDF'}
        />
      )}
    </div>
  );
}

