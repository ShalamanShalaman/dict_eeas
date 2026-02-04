import React, { useState, useEffect } from "react";

// --- REUSING YOUR ICON PATTERN ---
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

export default function SavedProgress({ onResumeWork, onNewProgress, user }) {
  const [savedDocs, setSavedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch user's saved documents from backend
  const fetchDocs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:5000/api/document/user/${user.id}`);
      const result = await response.json();
      setSavedDocs(result || []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this progress?")) return;
    try {
      await fetch(`http://127.0.0.1:5000/api/document/${id}`, { method: "DELETE" });
      setSavedDocs(savedDocs.filter(doc => doc.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const filteredDocs = savedDocs.filter(doc => 
    doc.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto min-h-screen">
      {/* Header */}
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
            onClick={onNewProgress}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Icon className="w-4 h-4"><path d="M12 5v14M5 12h14" /></Icon>
            Save New Progress
          </button>

          <button
            onClick={fetchDocs}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh"
          >
            <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search files..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {loading ? (
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
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                   <Icon className="w-6 h-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></Icon>
                </div>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                  title="Delete Draft"
                >
                  <Trash2Icon className="w-5 h-5" />
                </button>
              </div>

              <h4 className="font-semibold text-slate-800 truncate mb-1" title={doc.filename}>
                {doc.filename.replace(".json", "")}
              </h4>
              
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                <span className="bg-slate-100 px-2 py-0.5 rounded uppercase font-bold tracking-wider">JSON</span>
                <span>•</span>
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
              </div>

              <button 
                onClick={() => onResumeWork(doc)}
                className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-700 py-2.5 rounded-lg font-medium transition-all group-hover:border-indigo-600"
              >
                <ExternalLinkIcon className="w-4 h-4" />
                Resume Work
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}