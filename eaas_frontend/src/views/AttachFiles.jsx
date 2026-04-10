import { useState, useRef, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Icons
const Icon = ({ children, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

const UploadIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Icon>
);

const FileIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </Icon>
);

const XIcon = ({ className }) => (
  <Icon className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

const FilePlusIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </Icon>
);

const UserIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

const SendIcon = ({ className }) => (
  <Icon className={className}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </Icon>
);

export default function AttachFiles({ user, onSubmit, onClose }) {
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [loadingReviewers, setLoadingReviewers] = useState(true);
  const fileInputRef = useRef(null);

  // Fetch reviewers on component mount
  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/document/reviewers`);
        if (response.ok) {
          const data = await response.json();
          
          const filteredData = data.filter(r => r.id !== user?.id && r.user_id !== user?.user_id);
          setReviewers(filteredData);
          
          if (!selectedReviewerId) {
            const defaultReviewer = filteredData.find(r => r.office_location === user?.office_name);
            if (defaultReviewer) {
              setSelectedReviewerId(defaultReviewer.id.toString());
            } else if (filteredData.length === 1) {
              setSelectedReviewerId(filteredData[0].id.toString());
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch reviewers:", err);
      } finally {
        setLoadingReviewers(false);
      }
    };

    if (user) {
      fetchReviewers();
    }
  }, [user, selectedReviewerId]);

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length > 0) {
      setFiles([...files, ...newFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
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
      
      // FIX: Use the 'files[]' array syntax so PHP accepts multiple files
      files.forEach((file) => {
        formData.append('files[]', file);
      });

      const uploadResponse = await fetch(`${API_BASE_URL}/api/document/upload-attachments`, {
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
        setError('Server error: The server returned an invalid response.');
        return;
      }

      if (!uploadResponse.ok) {
        setError(uploadResult.error || 'Failed to convert files to PDF');
        return;
      }

      // Submit the auto-created document to the selected reviewer
      const submitFormData = new FormData();
      submitFormData.append('user_id', user.user_id);
      submitFormData.append('reviewer_id', selectedReviewerId);

      const submitResponse = await fetch(`${API_BASE_URL}/api/document/submit/${uploadResult.document.id}`, {
        method: 'POST',
        body: submitFormData
      });

      const submitResult = await submitResponse.json();

      if (submitResponse.ok) {
        const selectedReviewer = reviewers.find(r => r.id.toString() === selectedReviewerId);
        const reviewerName = selectedReviewer ? selectedReviewer.full_name : 'selected reviewer';
        
        onSubmit({
          file_path: uploadResult.file_path,
          document: uploadResult.document, // Pass the already created document
          message: `Successfully submitted to ${reviewerName}`
        });
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
      setError('Error: ' + errorMessage);
    } finally {
      setConverting(false);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileIcon className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileIcon className="w-5 h-5 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileIcon className="w-5 h-5 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <FileIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FilePlusIcon className="w-5 h-5 text-indigo-600" />
            Attach Files for Submission
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Attach multiple files (Excel, Word, images, etc.). They will be converted to a single PDF and submitted to your selected reviewer.
        </p>

        {/* File Drop Zone */}
        <div 
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center mb-4 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png,.pdf,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <UploadIcon className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p className="text-sm font-medium text-slate-600">
            Click to select files
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Supports: Excel, Word, Images, PDF, Text
          </p>
        </div>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-700 mb-2">
              Selected Files ({files.length}):
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.name)}
                    <div>
                      <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviewer Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
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
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-50 outline-none text-sm"
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
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConvertAndSubmit}
            disabled={files.length === 0 || converting || !selectedReviewerId || loadingReviewers}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            {converting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <SendIcon className="w-4 h-4" />
                Convert & Submit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}