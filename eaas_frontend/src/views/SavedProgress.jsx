import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

const FolderIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </Icon>
);

const SearchIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);

const ExternalLinkIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </Icon>
);

const Trash2Icon = ({ className }) => (
  <Icon className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
);

const RefreshIcon = ({ className }) => (
  <Icon className={className}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
  </Icon>
);

const EyeIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

const PinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const XIcon = ({ className }) => (
  <Icon className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

const CheckSquareIcon = ({ className }) => (
  <Icon className={className}>
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </Icon>
);

const ChevronLeftIcon = ({ className }) => (
  <Icon className={className}>
    <polyline points="15 18 9 12 15 6" />
  </Icon>
);

const ChevronRightIcon = ({ className }) => (
  <Icon className={className}>
    <polyline points="9 18 15 12 9 6" />
  </Icon>
);

export default function SavedProgress({ user: propUser }) {
  const [savedDocs, setSavedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(propUser || null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState([]);
  const [markedIds, setMarkedIds] = useState([]);
  const [markMode, setMarkMode] = useState(false);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('attendance');
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const [viewPdfModal, setViewPdfModal] = useState({ isOpen: false, docId: null, title: '' });

  useEffect(() => {
    if (propUser) {
      setCurrentUser(propUser);
    } else {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    }
  }, [propUser]);

  const fetchDocs = async () => {
    if (!currentUser) return;
    
    const userId = currentUser.user_id || currentUser.id;

    if (!userId) {
        return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/document/user/${userId}`);
      
      if (!response.ok) {
         throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      
      const drafts = (result || []).filter(doc => {
          const isDraftStatus = doc.is_draft || doc.status === 'draft';
          const isJsonFile = doc.file_path && doc.file_path.toLowerCase().endsWith('.json');
          const isPdfFile = doc.file_path && doc.file_path.toLowerCase().endsWith('.pdf');
          return isDraftStatus && (isJsonFile || isPdfFile);
      });
      
      const sorted = drafts.sort((a, b) => {
          const dateA = new Date(b.updated_at || b.created_at);
          const dateB = new Date(a.updated_at || a.created_at);
          return dateA - dateB;
      });
      
      setSavedDocs(sorted);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
        fetchDocs();
    }
  }, [currentUser]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleDeleteClick = (id) => {
    setDeleteTargetIds([id]);
    setShowDeleteConfirm(true);
  };

  const toggleMark = (id) => {
    setMarkedIds(prev => {
      const exists = prev.find(x => String(x) === String(id));
      if (exists) return prev.filter(x => String(x) !== String(id));
      return [...prev, id];
    });
  };

  const togglePin = (id) => {
    setPinnedIds(prev => {
      const exists = prev.find(x => String(x) === String(id));
      if (exists) return prev.filter(x => String(x) !== String(id));
      return [id, ...prev];
    });
  };

  const pinMarked = () => {
    if (!markedIds || markedIds.length === 0) return;
    setPinnedIds(prev => {
      const set = new Set(prev.map(String));
      markedIds.forEach(id => set.add(String(id)));
      return Array.from(set);
    });
    setMarkedIds([]);
    setMarkMode(false);
  };

  const markAll = () => {
    const pageIds = currentDocs.map(d => d.id);
    setMarkedIds(prev => {
      const newSet = new Set(prev);
      pageIds.forEach(id => newSet.add(id));
      return Array.from(newSet);
    });
  };

  const unmarkAll = () => setMarkedIds([]);

  const confirmDelete = async () => {
    if (!deleteTargetIds || deleteTargetIds.length === 0) return;

    const userId = currentUser?.user_id || currentUser?.id;
    try {
      const responses = await Promise.all(
        deleteTargetIds.map((id) => fetch(`${import.meta.env.VITE_API_BASE_URL}/api/document/${id}?user_id=${userId}`, { method: "DELETE" }))
      );

      setSavedDocs(prev => prev.filter(doc => !deleteTargetIds.map(String).includes(String(doc.id))));

      const failed = responses.some(r => !r.ok);
      if (failed) {
        alert("Some deletes failed. Refresh the list to verify.");
      }
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTargetIds([]);
      setMarkedIds([]);
      setMarkMode(false);
    }
  };

  const handleViewPdf = (e, doc) => {
    e.stopPropagation();
    const filename = getDisplayFilename(doc);
    setViewPdfModal({
      isOpen: true,
      docId: doc.id,
      title: filename.replace('.json', '')
    });
  };

  const getDisplayFilename = (doc) => {
      if (doc.file_path) {
          const parts = doc.file_path.split(/[/\\]/);
          let name = parts[parts.length - 1];
          if (/^[a-f0-9]{13}_/.test(name)) {
              name = name.substring(14);
          }
          return name;
      }
      return doc.filename || "Untitled Document";
  };

  const isJsonDocument = (doc) => getDisplayFilename(doc).toLowerCase().endsWith('.json');

  const filteredDocs = savedDocs.filter(doc => {
    const filename = getDisplayFilename(doc).toLowerCase();
    return filename.toLowerCase().includes(search.toLowerCase());
  });

  const attendanceDocs = filteredDocs.filter(isJsonDocument);
  const pdfDocs = filteredDocs.filter(doc => !isJsonDocument(doc));

  const activeTabDocs = activeTab === 'attendance' ? attendanceDocs : pdfDocs;

  const displayedDocs = [...activeTabDocs].sort((a, b) => {
    const aPinned = pinnedIds.find(x => String(x) === String(a.id)) ? 1 : 0;
    const bPinned = pinnedIds.find(x => String(x) === String(b.id)) ? 1 : 0;
    return bPinned - aPinned;
  });

  const totalPages = Math.ceil(displayedDocs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocs = displayedDocs.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto min-h-screen">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FolderIcon className="w-7 h-7 text-indigo-600" />
            Saved Progress
          </h2>
          <p className="text-slate-500 text-sm">Manage and resume your previous attendance drafts.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/upload')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 h-[42px] rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
              >
                <Icon className="w-4 h-4"><path d="M12 5v14M5 12h14" /></Icon>
                New Draft
              </button>

              <button
                onClick={fetchDocs}
                disabled={loading}
                className="flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 w-[42px] h-[42px] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh List"
              >
                <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <div className="h-8 w-px bg-slate-200 mx-1"></div>

              <button
                onClick={() => {
                  if (markMode) setMarkedIds([]);
                  setMarkMode(prev => !prev);
                }}
                className={`flex items-center justify-center w-[42px] h-[42px] rounded-lg transition-colors ${
                  markMode 
                    ? 'bg-slate-700 hover:bg-slate-800 text-white' 
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
                title={markMode ? "Cancel selection" : "Select drafts"}
              >
                {markMode ? <XIcon className="w-5 h-5" /> : <CheckSquareIcon className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative w-full md:w-72 shrink-0">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search files..."
                className="pl-10 pr-4 w-full h-[42px] border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {markMode && (
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
              <span className="text-sm font-medium text-slate-500 mr-2">
                {markedIds.length} selected
              </span>
              <button
                onClick={markAll}
                className="text-xs px-3 h-[42px] bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg transition-colors font-medium whitespace-nowrap"
                title="Select All"
              >
                Select All
              </button>
              <button
                onClick={unmarkAll}
                className="text-xs px-3 h-[42px] bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-lg transition-colors font-medium whitespace-nowrap"
                title="Clear Selection"
              >
                Clear
              </button>
              <div className="h-8 w-px bg-slate-200 mx-1"></div>
              <button
                onClick={() => pinMarked()}
                disabled={markedIds.length === 0}
                className="flex items-center justify-center w-[42px] h-[42px] bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Pin Selected"
              >
                <PinIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => { if (markedIds.length) { setDeleteTargetIds(markedIds); setShowDeleteConfirm(true); } }}
                disabled={markedIds.length === 0}
                className="flex items-center justify-center w-[42px] h-[42px] bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete Selected"
              >
                <Trash2Icon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-6 mt-4">
        <button
          onClick={() => { setActiveTab('attendance'); setCurrentPage(1); setMarkedIds([]); setMarkMode(false); }}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'attendance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          Attendance Drafts <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{attendanceDocs.length}</span>
        </button>
        <button
          onClick={() => { setActiveTab('pdfs'); setCurrentPage(1); setMarkedIds([]); setMarkMode(false); }}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pdfs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
        >
          Ready to Submit <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{pdfDocs.length}</span>
        </button>
      </div>

      {!currentUser ? (
         <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center text-amber-800">
             <p className="font-semibold">You are not logged in.</p>
             <p className="text-sm mt-1">Please log in to view your saved documents.</p>
         </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Loading your library...</p>
        </div>
      ) : activeTabDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <FolderIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No documents found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            {activeTab === 'attendance' 
              ? "When you save your work in the Attendance Processor, it will appear here for you to resume later."
              : "When you convert attachments into a PDF, they will appear here waiting to be submitted to your reviewer."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentDocs.map((doc) => {
              const isMarked = markedIds.find(x => String(x) === String(doc.id)) ? true : false;
              const isPinned = pinnedIds.find(x => String(x) === String(doc.id)) ? true : false;
              const isJson = isJsonDocument(doc);

              return (
              <div 
                key={doc.id} 
                className={`bg-white rounded-xl p-5 hover:shadow-lg transition-all group relative cursor-pointer ${
                  markMode && isMarked 
                    ? 'border-2 border-blue-500 shadow-md' 
                    : 'border border-slate-200 hover:border-indigo-200'
                }`}
                onClick={() => markMode && toggleMark(doc.id)}
              >
                {markMode && isMarked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-blue-500/5 pointer-events-none">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-blue-500">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg flex items-center gap-2 ${isJson ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                     <Icon className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></Icon>
                     {!markMode && isPinned && (
                       <PinIcon className="w-4 h-4 text-yellow-500 fill-current" />
                     )}
                  </div>
                  <div className="flex items-center gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider bg-slate-100 text-slate-600`}>
                          DRAFT
                      </span>
                      {!markMode && (
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePin(doc.id); }}
                        className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                        title={isPinned ? 'Unpin' : 'Pin'}
                      >
                        {isPinned ? (
                          <PinIcon className="w-4 h-4 text-yellow-500 fill-current" />
                        ) : (
                          <PinIcon className="w-4 h-4" />
                        )}
                      </button>
                      )}
                      {!markMode && !isJson && (
                      <button 
                        onClick={(e) => handleViewPdf(e, doc)}
                        className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-md transition-colors"
                        title="View PDF"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      )}
                      {!markMode && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(doc.id); }}
                        className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete Draft"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                      )}
                  </div>
                </div>

                <h4 className="font-semibold text-slate-800 truncate mb-1" title={getDisplayFilename(doc)}>
                  {getDisplayFilename(doc).replace(".json", "")}
                </h4>
                
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                  <span>{new Date(doc.updated_at || doc.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{new Date(doc.updated_at || doc.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>

                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (isJson) {
                      navigate(`/upload?doc_id=${doc.id}`); 
                    } else {
                      navigate(`/submit-for-approval?step=2&docId=${doc.id}`);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-700 py-2.5 rounded-lg font-medium transition-all"
                >
                  <ExternalLinkIcon className="w-4 h-4" />
                  {isJson ? "Resume Work" : "Submit File"}
                </button>
              </div>
              );
            })}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
                    if (
                      number === 1 || 
                      number === totalPages || 
                      (number >= currentPage - 1 && number <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === number
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {number}
                        </button>
                      );
                    } else if (
                      number === currentPage - 2 || 
                      number === currentPage + 2
                    ) {
                      return <span key={number} className="w-8 h-8 flex items-center justify-center text-slate-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2Icon className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {deleteTargetIds.length > 1 ? `Delete ${deleteTargetIds.length} Drafts?` : 'Delete Draft?'}
              </h3>
              <p className="text-gray-600 mb-6">
                {deleteTargetIds.length > 1
                  ? 'Are you sure you want to delete these drafts? This action cannot be undone.'
                  : 'Are you sure you want to delete this draft? This action cannot be undone.'}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <PDFViewerModal
        isOpen={viewPdfModal.isOpen}
        onClose={() => setViewPdfModal({ isOpen: false, docId: null, title: '' })}
        documentId={viewPdfModal.docId}
        title={viewPdfModal.title}
      />
    </div>
  );
}