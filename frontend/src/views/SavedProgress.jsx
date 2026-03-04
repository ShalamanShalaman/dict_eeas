import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

const SendIcon = ({ className }) => (
  <Icon className={className}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
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

const CheckCircleIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Icon>
);

export default function SavedProgress({ onResumeWork, onNewProgress, user: propUser }) {
  const [savedDocs, setSavedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(propUser || null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState([]);
  const [markedIds, setMarkedIds] = useState([]);
  const [markMode, setMarkMode] = useState(false);
  const [pinnedIds, setPinnedIds] = useState([]);
  const navigate = useNavigate();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [reviewers, setReviewers] = useState([]);
  const [loadingReviewers, setLoadingReviewers] = useState(false);
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        setLoadingReviewers(true);
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

    if (showSubmitModal) {
      fetchReviewers();
    }
  }, [showSubmitModal]);

  const fetchDocs = async () => {
    if (!currentUser) return;
    
    const userId = currentUser.user_id || currentUser.id;

    if (!userId) {
        console.error("User object found, but no ID present:", currentUser);
        return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:5000/api/document/user/${userId}`);
      
      if (!response.ok) {
         throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      
      const drafts = (result || []).filter(doc => doc.is_draft || doc.status === 'draft');
      
      const sorted = drafts.sort((a, b) => {
          const dateA = new Date(b.updated_at || b.created_at);
          const dateB = new Date(a.updated_at || a.created_at);
          return dateA - dateB;
      });
      
      setSavedDocs(sorted);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
        fetchDocs();
    }
  }, [currentUser]);

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

  const markAll = () => setMarkedIds(savedDocs.map(d => d.id));
  const unmarkAll = () => setMarkedIds([]);

  const confirmDelete = async () => {
    if (!deleteTargetIds || deleteTargetIds.length === 0) return;

    const userId = currentUser?.user_id || currentUser?.id;
    try {
      const responses = await Promise.all(
        deleteTargetIds.map((id) => fetch(`http://127.0.0.1:5000/api/document/${id}?user_id=${userId}`, { method: "DELETE" }))
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

  const handleOpenSubmitModal = () => {
    if (markedIds.length === 0) {
      alert("Please select at least one draft to submit.");
      return;
    }
    setShowSubmitModal(true);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleSubmitForApproval = async () => {
    if (!selectedReviewerId) {
      setSubmitError("Please select a reviewer");
      return;
    }

    if (markedIds.length === 0) {
      setSubmitError("Please select at least one draft");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      let submittedCount = 0;
      let failedCount = 0;

      for (const docId of markedIds) {
        const contentResponse = await fetch(`http://127.0.0.1:5000/api/document/content/${docId}?user_id=${currentUser.user_id}`);
        
        if (!contentResponse.ok) {
          console.error(`Failed to get content for doc ${docId}`);
          failedCount++;
          continue;
        }

        const stateData = await contentResponse.json();
        
        const employeeName = stateData.arMeta?.name || currentUser.full_name || "Employee";
        const selectedMonth = stateData.selectedMonth || "";
        
        const finalName = employeeName;
        const finalPeriod = selectedMonth;
        const filteredData = stateData.employees?.[Object.keys(stateData.employees)[0]]?.[selectedMonth] || {};

        const dtrResponse = await fetch("http://127.0.0.1:5000/api/download-dtr", {
          method: "POST",
          mode: 'cors',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee_name: finalName,
            employee_data: filteredData,
            approver: stateData.arMeta?.approver || "",
            period_text: finalPeriod,
            period_format: stateData.arMeta?.periodFormat || "full"
          }),
        });

        if (!dtrResponse.ok) {
          console.error(`Failed to generate DTR for doc ${docId}`);
          failedCount++;
          continue;
        }

        const dtrBlob = await dtrResponse.blob();
        const dtrFile = new File([dtrBlob], `${finalName.replace(/\s+/g, '_')}_DTR.xlsx`, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        const formData = new FormData();
        formData.append('user_id', currentUser.user_id);
        formData.append('files', dtrFile);

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
          failedCount++;
          continue;
        }

        if (!uploadResponse.ok) {
          console.error(`Failed to convert DTR to PDF for doc ${docId}`, uploadResult.error);
          failedCount++;
          continue;
        }

        const defaultFileName = `${currentUser.last_name}, ${currentUser.first_name}.pdf`;
        
        const createDocFormData = new FormData();
        createDocFormData.append('user_id', currentUser.user_id);
        createDocFormData.append('filename', defaultFileName);
        
        const fileResponse = await fetch(`/static/${uploadResult.file_path}`);
        const fileBlob = await fileResponse.blob();
        const convertedFile = new File([fileBlob], defaultFileName, { type: 'application/pdf' });
        createDocFormData.append('file', convertedFile);

        const createDocResponse = await fetch('/api/document/upload', {
          method: 'POST',
          body: createDocFormData
        });

        if (!createDocResponse.ok) {
          console.error(`Failed to create document for doc ${docId}`);
          failedCount++;
          continue;
        }

        const createDocResult = await createDocResponse.json();
        const newDocId = createDocResult.document.id;

        const submitFormData = new FormData();
        submitFormData.append('user_id', currentUser.user_id);
        submitFormData.append('reviewer_id', selectedReviewerId);

        const submitResponse = await fetch(`/api/document/submit/${newDocId}`, {
          method: 'POST',
          body: submitFormData
        });

        if (submitResponse.ok) {
          submittedCount++;
          setSavedDocs(prev => prev.filter(doc => String(doc.id) !== String(docId)));
        } else {
          failedCount++;
        }
      }

      if (submittedCount > 0) {
        setSubmitSuccess(true);
        setMarkedIds([]);
        setMarkMode(false);
        
        setTimeout(() => {
          setShowSubmitModal(false);
          setSubmitSuccess(false);
        }, 2000);
      }

      if (failedCount > 0) {
        setSubmitError(`${failedCount} submission(s) failed. Please try again.`);
      }

    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError("Failed to submit: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getDisplayFilename = (doc) => {
      if (doc.file_path) {
          const parts = doc.file_path.split(/[/\\]/);
          return parts[parts.length - 1];
      }
      return doc.filename || "Untitled Document";
  };

  const filteredDocs = savedDocs.filter(doc => {
    const filename = getDisplayFilename(doc).toLowerCase();
    return filename.endsWith('.json') && filename.toLowerCase().includes(search.toLowerCase());
  });

  const displayedDocs = [...filteredDocs].sort((a, b) => {
    const aPinned = pinnedIds.find(x => String(x) === String(a.id)) ? 1 : 0;
    const bPinned = pinnedIds.find(x => String(x) === String(b.id)) ? 1 : 0;
    return bPinned - aPinned;
  });

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FolderIcon className="w-7 h-7 text-indigo-600" />
            Saved Progress
          </h2>
          <p className="text-slate-500 text-sm">Manage and resume your previous attendance drafts.</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            <Icon className="w-4 h-4"><path d="M12 5v14M5 12h14" /></Icon>
            New Draft
          </button>

          <button
            onClick={fetchDocs}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh List"
          >
            <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center gap-3">
            <div>
              <button
                onClick={() => { if (markMode) setMarkedIds([]); setMarkMode(prev => !prev); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${markMode ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
                title="Select drafts"
              >
                Select
              </button>
            </div>

            {markMode && (
              <>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                  <button
                    onClick={markAll}
                    className="text-xs px-2.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition-colors font-medium"
                    title="Mark all visible drafts"
                  >
                    All
                  </button>
                  <button
                    onClick={unmarkAll}
                    className="text-xs px-2.5 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded hover:bg-slate-200 transition-colors font-medium"
                    title="Clear all marks"
                  >
                    None
                  </button>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => pinMarked()}
                    disabled={markedIds.length === 0}
                    title="Pin selected drafts"
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="sr-only">Pin</span>
                  </button>
                  <button
                    onClick={handleOpenSubmitModal}
                    disabled={markedIds.length === 0}
                    title="Submit selected drafts for approval"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SendIcon className="w-4 h-4" />
                    Submit
                  </button>
                  <button
                    onClick={() => { if (markedIds.length) { setDeleteTargetIds(markedIds); setShowDeleteConfirm(true); } }}
                    disabled={markedIds.length === 0}
                    title="Delete selected drafts"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span className="sr-only">Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 text-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

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
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <FolderIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No saved progress found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            When you save your work in the Attendance Processor, it will appear here for you to resume later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedDocs.map((doc) => {
            const isMarked = markedIds.find(x => String(x) === String(doc.id)) ? true : false;
            const isPinned = pinnedIds.find(x => String(x) === String(doc.id)) ? true : false;
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
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 flex items-center gap-2">
                   <Icon className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></Icon>
                   {!markMode && isPinned && (
                     <svg className="w-4 h-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                     </svg>
                   )}
                </div>
                <div className="flex items-center gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                        doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                        doc.status === 'declined' ? 'bg-red-100 text-red-700' :
                        doc.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                        {doc.status}
                    </span>
                    {!markMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePin(doc.id); }}
                      className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                      title={isPinned ? 'Unpin' : 'Pin'}
                    >
                      {isPinned ? (
                        <svg className="w-4 h-4 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      )}
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
                onClick={(e) => { e.stopPropagation(); navigate(`/upload?doc_id=${doc.id}`); }}
                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-700 py-2.5 rounded-lg font-medium transition-all"
              >
                <ExternalLinkIcon className="w-4 h-4" />
                Resume Work
              </button>
            </div>
            );
          })}
        </div>
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

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !submitting && setShowSubmitModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
            
            {submitSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Submitted Successfully!
                </h3>
                <p className="text-gray-600">
                  Your documents have been submitted for approval.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SendIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Submit for Approval
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {markedIds.length} draft(s) selected
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-indigo-500" />
                    Select Reviewer <span className="text-red-500">*</span>
                  </label>
                  {loadingReviewers ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
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

                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircleIcon className="w-4 h-4" />
                      {submitError}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitForApproval}
                    disabled={submitting || !selectedReviewerId}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <SendIcon className="w-4 h-4" />
                        Submit
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}