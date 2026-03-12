import React, { useState, useEffect, useRef } from "react";
import SuccessModal from "../components/SuccessModal";

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

const CheckCircleIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Icon>
);

const AlertCircleIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </Icon>
);

const UserIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

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
              src={`http://127.0.0.1:8000/api/document/view/${documentId}`}
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

export default function SubmitForApproval({ user, onNavigate }) {
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [loadingReviewers, setLoadingReviewers] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [viewPdfModal, setViewPdfModal] = useState({ isOpen: false, docId: null, title: '' });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [convertedDocumentId, setConvertedDocumentId] = useState(null);
  const [convertedFilePath, setConvertedFilePath] = useState(null);
  const [convertedFileName, setConvertedFileName] = useState(null);
  const [customFileName, setCustomFileName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successReviewerName, setSuccessReviewerName] = useState('');
  
  const fileInputRef = useRef(null);

  const CACHE_KEY = `submitForApproval_${user?.user_id || 'default'}`;

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.convertedDocumentId) {
          setCurrentStep(parsed.currentStep || 2);
          setConvertedDocumentId(parsed.convertedDocumentId);
          setConvertedFilePath(parsed.convertedFilePath);
          setConvertedFileName(parsed.convertedFileName);
          if (parsed.customFileName) setCustomFileName(parsed.customFileName);
          if (parsed.selectedReviewerId) setSelectedReviewerId(parsed.selectedReviewerId);
        }
      } catch (e) {
        console.error("Failed to parse cache", e);
      }
    }
  }, [user?.user_id]);

  useEffect(() => {
    if (convertedDocumentId) {
      const cacheData = {
        currentStep,
        convertedDocumentId,
        convertedFilePath,
        convertedFileName,
        customFileName,
        selectedReviewerId
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    }
  }, [currentStep, convertedDocumentId, convertedFilePath, convertedFileName, customFileName, selectedReviewerId, CACHE_KEY]);

  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/document/reviewers', {
          headers: { 'Accept': 'application/json' }
        });
        const contentType = response.headers.get('content-type');
        if (response.ok && contentType && contentType.includes('application/json')) {
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

  const handleJsonResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response from server:', text);
      throw new Error('Server returned an unexpected response format. Check the browser console.');
    }
    return await response.json();
  };

  const handleConvertToPDF = async () => {
    if (files.length === 0) {
      setError("Please attach at least one file");
      return;
    }

    setConverting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('user_id', user.user_id);
      
      files.forEach((file) => {
        formData.append('files[]', file);
      });

      const uploadResponse = await fetch('http://127.0.0.1:8000/api/document/upload-attachments', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      const uploadResult = await handleJsonResponse(uploadResponse);

      if (!uploadResponse.ok) {
        setError(uploadResult.message || uploadResult.error || 'Failed to convert files to PDF');
        return;
      }

      setConvertedDocumentId(uploadResult.document.id);
      setConvertedFilePath(uploadResult.file_path);
      setConvertedFileName(uploadResult.file_path.split(/[/\\]/).pop());
      setCurrentStep(2);
      setSuccessMessage("Files successfully merged and converted to PDF.");
      
    } catch (err) {
      console.error("Full error:", err);
      let errorMessage = err.message;
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        errorMessage = 'Failed to connect to the server. Please ensure the backend is running.';
      }
      setError('Error: ' + errorMessage);
    } finally {
      setConverting(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!selectedReviewerId) {
      setError("Please select a reviewer");
      return;
    }

    if (!convertedDocumentId) {
      setError("No document to submit. Please convert files first.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const submitFormData = new FormData();
      submitFormData.append('user_id', user.user_id);
      submitFormData.append('reviewer_id', selectedReviewerId);

      const submitResponse = await fetch(`http://127.0.0.1:8000/api/document/submit/${convertedDocumentId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: submitFormData
      });

      const submitResult = await handleJsonResponse(submitResponse);

      if (submitResponse.ok) {
        const selectedReviewer = reviewers.find(r => r.id.toString() === selectedReviewerId);
        const reviewerName = selectedReviewer ? selectedReviewer.full_name : 'selected reviewer';
        
        setSuccessReviewerName(reviewerName);
        setShowSuccessModal(true);
        resetForm();
      } else {
        setError(submitResult.message || submitResult.error || 'Failed to submit document to reviewer');
      }
    } catch (err) {
      console.error("Full error:", err);
      let errorMessage = err.message;
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        errorMessage = 'Failed to connect to the server. Please ensure the backend is running.';
      }
      setError('Error: ' + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setCurrentStep(1);
    setConvertedDocumentId(null);
    setConvertedFilePath(null);
    setConvertedFileName(null);
    setCustomFileName('');
    setSelectedReviewerId('');
    const defaultReviewer = reviewers.find(r => r.office_location === user?.office_name);
    if (defaultReviewer) {
      setSelectedReviewerId(defaultReviewer.id.toString());
    } else if (reviewers.length === 1) {
      setSelectedReviewerId(reviewers[0].id.toString());
    }
    setError(null);
    setSuccessMessage(null);
    sessionStorage.removeItem(CACHE_KEY);
  };

  const handleRenameFile = async () => {
    if (!customFileName.trim()) {
      setError("Please enter a filename");
      return;
    }

    setRenaming(true);
    setError(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/document/rename/${convertedDocumentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          filename: customFileName.trim(),
          user_id: user.user_id
        })
      });

      const result = await handleJsonResponse(response);

      if (response.ok) {
        const newFilename = result.document.file_path.split(/[/\\]/).pop();
        const newFilePath = result.file_path;
        setConvertedFileName(newFilename);
        setConvertedFilePath(newFilePath);
        setSuccessMessage("File renamed successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.message || result.error || 'Failed to rename file');
      }
    } catch (err) {
      console.error("Rename Error:", err);
      setError('Failed to rename file. ' + err.message);
    } finally {
      setRenaming(false);
    }
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setError(null);
    sessionStorage.removeItem(CACHE_KEY);
    setConvertedDocumentId(null);
    setConvertedFilePath(null);
    setConvertedFileName(null);
    setFiles([]);
  };

  const handleViewPDF = () => {
    if (convertedDocumentId) {
      setViewPdfModal({
        isOpen: true,
        docId: convertedDocumentId,
        title: convertedFileName ? convertedFileName.replace('.json', '') : 'Document Viewer'
      });
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

  const FileCheckIcon = ({ className }) => (
    <Icon className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <polyline points="9 15 12 18 15 15" />
      <line x1="12" y1="12" x2="12" y2="18" />
    </Icon>
  );

  const EyeIcon = ({ className }) => (
    <Icon className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );

  const ArrowLeftIcon = ({ className }) => (
    <Icon className={className}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </Icon>
  );

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center">
        <div className={`flex items-center ${currentStep >= 1 ? 'text-indigo-600' : 'text-slate-300'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
            {currentStep > 1 ? '✓' : '1'}
          </div>
          <span className="ml-2 text-sm font-medium">Attach Files</span>
        </div>
        
        <div className={`w-16 h-0.5 mx-2 ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        
        <div className={`flex items-center ${currentStep >= 2 ? 'text-indigo-600' : 'text-slate-300'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
            2
          </div>
          <span className="ml-2 text-sm font-medium">Submit for Approval</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
          <SendIcon className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Submit for Approval</h2>
        <p className="text-slate-500 text-sm mt-1">
          {currentStep === 1 
            ? "Step 1: Attach files and convert to PDF" 
            : "Step 2: Review the PDF and submit to reviewer"}
        </p>
      </div>

      <StepIndicator />

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        
        {currentStep === 1 && (
          <>
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <UploadIcon className="w-5 h-5 text-indigo-500" />
                Attach Files
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Attach multiple files. They will be merged into a single PDF.
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

            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}

            <div className="p-6 border-t border-slate-100">
              <button
                onClick={handleConvertToPDF}
                disabled={files.length === 0 || converting}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
              >
                {converting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Converting to PDF...
                  </>
                ) : (
                  <>
                    <FileCheckIcon className="w-5 h-5" />
                    Convert to PDF
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            {successMessage && (
              <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  {successMessage}
                </p>
              </div>
            )}

            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <FileCheckIcon className="w-5 h-5 text-green-500" />
                Converted PDF
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Review your converted PDF file before submitting to your reviewer.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileTextIcon className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{convertedFileName}</p>
                      <p className="text-xs text-slate-400">PDF Document</p>
                    </div>
                  </div>
                  <button
                    onClick={handleViewPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View PDF
                  </button>
                </div>
              </div>

              {/* Rename File Section */}
              <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-sm font-medium text-indigo-700 mb-2">Rename PDF File (Optional)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter new filename..."
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                  />
                  <button 
                    onClick={handleRenameFile}
                    disabled={!customFileName.trim() || renaming}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    {renaming ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Renaming...
                      </>
                    ) : (
                      'Rename'
                    )}
                  </button>
                </div>
                <p className="text-xs text-indigo-500 mt-2">The .pdf extension will be added automatically</p>
              </div>

              <button
                onClick={handleBackToStep1}
                className="mt-4 text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to attach different files
              </button>
            </div>

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

            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}

            <div className="p-6 border-t border-slate-100">
              <button
                onClick={handleSubmitForApproval}
                disabled={!selectedReviewerId || submitting}
                className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <SendIcon className="w-5 h-5" />
                    Submit for Approval
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <p className="text-center text-xs text-slate-400">
        {currentStep === 1 
          ? "Step 1 of 2: Convert your files to PDF first" 
          : "Step 2 of 2: Review the PDF and submit to your reviewer"}
      </p>
      
      <PDFViewerModal
        isOpen={viewPdfModal.isOpen}
        onClose={() => setViewPdfModal({ isOpen: false, docId: null, title: '' })}
        documentId={viewPdfModal.docId}
        title={viewPdfModal.title}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        message="Successfully submitted to the designated reviewer"
        subMessage={successReviewerName ? `Submitted to: ${successReviewerName}` : undefined}
        onClose={() => setShowSuccessModal(false)}
        autoClose={true}
        autoCloseDelay={4000}
      />
    </div>
  );
}