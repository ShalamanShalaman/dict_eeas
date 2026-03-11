import { useState, useEffect } from "react";

const Icon = ({ children, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

const XIcon = ({ className }) => (
  <Icon className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

const FileIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </Icon>
);

export default function PDFViewerModal({ isOpen, onClose, documentId, title }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
    }
  }, [isOpen, documentId]);

  if (!isOpen) return null;

  const pdfUrl = `http://127.0.0.1:8000/api/document/view/${documentId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FileIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">View Document</h3>
              <p className="text-sm text-slate-500">{title || `Document #${documentId}`}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-slate-100">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <FileIcon className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg font-medium">Unable to load document</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="PDF Viewer"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError("Failed to load document. The file may not exist or is in an unsupported format.");
              }}
            />
          )}
          
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-500">Loading document...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
          <p className="text-sm text-slate-500">
            Viewing: {title || `Document #${documentId}`}
          </p>
          <div className="flex items-center gap-2">
            <a
              href={`http://127.0.0.1:8000/api/document/download/${documentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Download
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}