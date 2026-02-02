import React, { useState, useRef, useEffect } from "react";

// --- INLINE ICONS ---
const Icon = ({ children, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
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

const FileTextIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </Icon>
);

const DownloadIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Icon>
);

const Trash2Icon = ({ className }) => (
  <Icon className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </Icon>
);

const Edit3Icon = ({ className }) => (
  <Icon className={className}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </Icon>
);

const UserIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

const BriefcaseIcon = ({ className }) => (
  <Icon className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Icon>
);

const MapPinIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

const LayersIcon = ({ className }) => (
  <Icon className={className}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </Icon>
);

const BadgeCheckIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

const CalendarIcon = ({ className }) => (
  <Icon className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Icon>
);

const ListIcon = ({ className }) => (
    <Icon className={className}>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </Icon>
);

const CheckIcon = ({ className }) => (
    <Icon className={className}>
        <polyline points="20 6 9 17 4 12" />
    </Icon>
);

const SaveIcon = ({ className }) => (
    <Icon className={className}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </Icon>
);

export default function UploadAttendance() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [viewMode, setViewMode] = useState("dtr");
  const [isDragging, setIsDragging] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Track if we are editing an existing saved draft (for Autosave logic)
  const [savedDocId, setSavedDocId] = useState(null);

  const [arMeta, setArMeta] = useState({
    name: "",
    position: "",
    office: "",
    project: "",
    approver: "",
    approverTitle: "PROVINCIAL OFFICER, ISABELA - CAUAYAN II",
    periodFormat: "full",
    tasks: {}, 
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        setCurrentUser(userData);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
       setArMeta(prev => ({
           ...prev,
           name: prev.name || currentUser.full_name || "", 
           position: prev.position || currentUser.position_name || "",
           office: prev.office || currentUser.office_name || "",
           approver: prev.approver || currentUser.provincial_officer || ""
       }));
    }
  }, [currentUser]);

  // --- HANDLE FILE DROPPED/SELECTED ---
  const handleFile = (f) => {
    if (!f) return;
    
    // Check if it's a JSON State file (Resume Work)
    if (f.type === "application/json" || f.name.endsWith(".json")) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const stateData = JSON.parse(e.target.result);
                // Restore State
                if (stateData.employees) setEmployees(stateData.employees);
                if (stateData.arMeta) setArMeta(stateData.arMeta);
                if (stateData.selectedEmployee) setSelectedEmployee(stateData.selectedEmployee);
                if (stateData.viewMode) setViewMode(stateData.viewMode);
                alert("Progress Restored Successfully!");
            } catch (err) {
                alert("Failed to load saved state: " + err.message);
            }
        };
        reader.readAsText(f);
        return;
    }

    // Default PDF Handling
    if (f.type === "application/pdf") {
        setFile(f);
    }
  };

  // --- SAVE PROGRESS (TO BACKEND) ---
  const saveProgress = async () => {
    if (!currentUser) {
        alert("Please log in to save your progress.");
        return;
    }

    setLoading(true);
    try {
        // 1. Bundle State
        const stateData = JSON.stringify({
            employees,
            selectedEmployee,
            arMeta,
            viewMode
        });
        
        // 2. Create File Object
        const blob = new Blob([stateData], { type: "application/json" });
        const filename = `attendance_save_${selectedEmployee || 'draft'}_${Date.now()}.json`;
        const fileObj = new File([blob], filename);

        const formData = new FormData();
        formData.append("file", fileObj);
        formData.append("user_id", currentUser.user_id); 

        // 3. Determine URL (Upload new or Update existing)
        // Note: For simplicity, we use Upload for now to create a new record history.
        // If you strictly want overwrite, we'd use the autosave route with savedDocId.
        let url = "http://127.0.0.1:5000/api/document/upload";
        if (savedDocId) {
             url = `http://127.0.0.1:5000/api/document/autosave/${savedDocId}`;
        }

        const response = await fetch(url, { method: "POST", body: formData });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        setSavedDocId(result.document.id); // Store ID for future autosaves
        alert("Progress Saved to Dashboard!");

    } catch (err) {
        alert("Failed to save progress: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("attendanceFile", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/upload-attendance", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textText = await response.text();
        console.error("Backend Error:", textText);
        throw new Error(`Server returned ${response.status} ${response.statusText}. Check console for HTML error details.`);
      }

      const result = await response.json();

      if (response.ok) {
        setEmployees(result.data || {});
        const first = Object.keys(result.data || {})[0] || "";
        setSelectedEmployee(first);
        setSavedDocId(null); // Reset doc ID on new PDF upload
        
        setArMeta(prev => ({
            ...prev,
            name: currentUser?.full_name || first,
            position: currentUser?.position_name || "",
            office: currentUser?.office_name || "",
            approver: currentUser?.provincial_officer || "",
            project: prev.project || "",
            periodFormat: "full",
            tasks: {}
        }));
      } else {
        alert(result.error || "Failed to process PDF.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    setFile(null);
    setEmployees({});
    setSelectedEmployee("");
    setSavedDocId(null);
    setArMeta({ 
        name: currentUser?.full_name || "", 
        position: currentUser?.position_name || "", 
        office: currentUser?.office_name || "", 
        approver: currentUser?.provincial_officer || "",
        approverTitle: "PROVINCIAL OFFICER, ISABELA - CAUAYAN II",
        project: "", 
        periodFormat: "full",
        tasks: {} 
    });
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const getPeriodText = () => {
      if (!selectedEmployee || !employees[selectedEmployee]) return "";
      
      const { month_name, year } = employees[selectedEmployee];
      if (!month_name || !year) return "";

      switch (arMeta.periodFormat) {
          case "1-15":
              return `${month_name} 1-15, ${year}`;
          case "16-end":
              return `${month_name} 16-31, ${year}`;
          default:
              return `${month_name} ${year}`;
      }
  };

  const handleDtrUpdate = (day, field, value) => {
    setEmployees((prev) => ({
      ...prev,
      [selectedEmployee]: {
        ...prev[selectedEmployee],
        [day]: {
          ...prev[selectedEmployee][day],
          [field]: value,
        },
      },
    }));
  };

  const handleBatchUpdate = (daysToUpdate, field, value) => {
    setEmployees((prev) => {
      const updatedEmployeeData = { ...prev[selectedEmployee] };
      daysToUpdate.forEach(day => {
        updatedEmployeeData[day] = {
            ...updatedEmployeeData[day],
            [field]: value
        };
      });

      return {
        ...prev,
        [selectedEmployee]: updatedEmployeeData
      };
    });
  };

  const downloadExcel = async () => {
    if (!selectedEmployee) return;

    try {
      const finalName = arMeta.name || selectedEmployee;
      const finalPeriod = getPeriodText();

      const response = await fetch("http://127.0.0.1:5000/api/download-dtr", {
        method: "POST",
        mode: 'cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_name: finalName,
          employee_data: employees[selectedEmployee],
          approver: arMeta.approver,
          period_text: finalPeriod
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || (!contentType.includes("application/json") && !contentType.includes("application/vnd"))) {
          if (!response.ok) {
             const text = await response.text();
             console.error("DTR Download Error:", text);
             throw new Error(`Server returned ${response.status}. See console.`);
          }
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename = finalName.replace(/\s+/g, '_');
        a.download = `DTR_${filename}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const err = await response.json();
        alert("Error downloading DTR: " + err.error);
      }
    } catch (error) {
      alert("Download failed: " + error.message);
    }
  };

  const downloadAR = async () => {
    if (!selectedEmployee) return;

    try {
      const finalName = arMeta.name || selectedEmployee;
      const finalPeriod = getPeriodText();

      const response = await fetch("http://127.0.0.1:5000/api/generate-ar", {
        method: "POST",
        mode: 'cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_name: finalName,
          employee_data: employees[selectedEmployee],
          position: arMeta.position,
          office: arMeta.office,
          project: arMeta.project,
          period_text: finalPeriod,
          overrides: {
            name: finalName, 
            position: arMeta.position,
            office: arMeta.office,
            project: arMeta.project,
            tasks: arMeta.tasks,
            approved_by: arMeta.approver,
            approver_title: arMeta.approverTitle
          }
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || (!contentType.includes("application/json") && !contentType.includes("application/vnd"))) {
          if (!response.ok) {
             const text = await response.text();
             console.error("AR Generation Error:", text);
             throw new Error(`Server returned ${response.status}. See console.`);
          }
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename = finalName.replace(/\s+/g, '_');
        a.download = `AR_${filename}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const err = await response.json();
        alert("Error downloading AR: " + err.error);
      }
    } catch (error) {
      alert("Download failed: " + error.message);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto min-h-screen">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FileTextIcon className="w-6 h-6 text-blue-600" />
          Attendance Processor
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`md:col-span-2 rounded-xl h-48 flex flex-col items-center justify-center border-2 border-dashed transition-colors ${
              isDragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 bg-slate-50 hover:bg-slate-100"
            }`}
          >
            <div className="text-center p-4">
              <UploadIcon className={`w-8 h-8 mx-auto mb-3 ${file ? "text-green-500" : "text-gray-400"}`} />
              <div className="font-semibold text-gray-700">{file ? file.name : "Drag PDF Here"}</div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.json" // Added .json support
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
                id="attendanceUpload"
              />
              <label
                htmlFor="attendanceUpload"
                className="mt-2 inline-block text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-medium"
              >
                {file ? "Change File" : "Upload PDF or Saved JSON"}
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-3 justify-center">
            {/* --- NEW SAVE BUTTON --- */}
            <button
              onClick={saveProgress}
              disabled={!selectedEmployee} // Only enable if working on something
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg shadow-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <SaveIcon className="w-4 h-4" /> Save Progress
            </button>

            <button
              onClick={handleUpload}
              disabled={!file || loading || (file && file.type === "application/json")} // Disable extract if it's a JSON file
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UploadIcon className="w-4 h-4" /> Extract PDF
                </>
              )}
            </button>

            <button
              onClick={handleClearAll}
              className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Trash2Icon className="w-4 h-4" /> Clear
            </button>

            {Object.keys(employees).length > 0 && (
                <div className="mt-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Select Log Source</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                        {Object.keys(employees).map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                        </select>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {selectedEmployee && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Toggle Switch */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
              <button
                onClick={() => setViewMode("dtr")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "dtr"
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Daily Time Record
              </button>
              <button
                onClick={() => setViewMode("ar")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "ar"
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Accomplishment Report
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                    {viewMode === "dtr" ? "Edit Attendance Log" : "Edit Accomplishment Report"}
                </h3>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Edit3Icon className="w-4 h-4" />
                    Editable Preview
                </div>
            </div>
            
            {/* --- SHARED FORM FIELDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 mb-6 border-b border-gray-100">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><UserIcon className="w-3 h-3"/> Employee Name</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. Juan Dela Cruz"
                        value={arMeta.name}
                        onChange={(e) => setArMeta({ ...arMeta, name: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><BriefcaseIcon className="w-3 h-3"/> Position</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. Project Officer I"
                        value={arMeta.position}
                        onChange={(e) => setArMeta({ ...arMeta, position: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><MapPinIcon className="w-3 h-3"/> Office</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. Cauayan Office"
                        value={arMeta.office}
                        onChange={(e) => setArMeta({ ...arMeta, office: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><BadgeCheckIcon className="w-3 h-3"/> Approved By</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Provincial Officer Name"
                        value={arMeta.approver}
                        onChange={(e) => setArMeta({ ...arMeta, approver: e.target.value })}
                    />
                </div>
                {/* --- Approver Title Input --- */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><BadgeCheckIcon className="w-3 h-3"/> Approver Title</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. PROVINCIAL OFFICER..."
                        value={arMeta.approverTitle}
                        onChange={(e) => setArMeta({ ...arMeta, approverTitle: e.target.value })}
                    />
                </div>
                {/* --- Period Coverage Selector --- */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> Period Coverage</label>
                    <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={arMeta.periodFormat}
                        onChange={(e) => setArMeta({ ...arMeta, periodFormat: e.target.value })}
                    >
                        <option value="full">Full Month</option>
                        <option value="1-15">1st Quincena (1-15)</option>
                        <option value="16-end">2nd Quincena (16-End)</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto border rounded-lg bg-gray-50/50">
                {viewMode === "dtr" ? (
                <DTRTable 
                    data={employees[selectedEmployee]} 
                    onUpdate={handleDtrUpdate} 
                    onBatchUpdate={handleBatchUpdate}
                />
                ) : (
                <AccomplishmentTable
                    attendance={employees[selectedEmployee]}
                    arMeta={arMeta}
                    setArMeta={setArMeta}
                />
                )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
              {viewMode === "dtr" ? (
                <button
                  onClick={downloadExcel}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" /> Download DTR (Excel)
                </button>
              ) : (
                <button
                  onClick={downloadAR}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" /> Generate AR (Word)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- SUB COMPONENTS --- */

function DTRTable({ data, onUpdate, onBatchUpdate }) {
  // Generate Days 1-31
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [batchReason, setBatchReason] = useState("Work Suspension");
  const [customReason, setCustomReason] = useState("");

  const toggleDay = (day) => {
    const newSelected = new Set(selectedDays);
    if (newSelected.has(day)) {
        newSelected.delete(day);
    } else {
        newSelected.add(day);
    }
    setSelectedDays(newSelected);
  };

  const toggleAll = () => {
    if (selectedDays.size === days.length) {
        setSelectedDays(new Set());
    } else {
        setSelectedDays(new Set(days));
    }
  };

  const applyBatch = () => {
      const reasonToApply = batchReason === "Others" ? customReason : batchReason;
      onBatchUpdate(Array.from(selectedDays), "remarks", reasonToApply);
      // Optional: Clear selection after apply
      // setSelectedDays(new Set());
  };

  const InputCell = ({ day, field, value }) => (
    <input 
        type="text" 
        value={value || ""}
        onChange={(e) => onUpdate(day, field, e.target.value)}
        className="w-full bg-transparent border-0 p-1 text-center focus:ring-1 focus:ring-blue-500 focus:bg-white rounded text-gray-700 font-mono text-sm"
        placeholder={field === "remarks" ? "..." : "--:--"}
    />
  );

  return (
    <div>
        {/* Batch Action Toolbar */}
        {selectedDays.size > 0 && (
            <div className="bg-blue-50 p-3 border-b flex items-center justify-between gap-4 sticky top-0 z-10">
                <div className="text-sm text-blue-800 font-medium">
                    {selectedDays.size} days selected
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 font-semibold uppercase">Merge/Set Reason:</span>
                    <select 
                        value={batchReason}
                        onChange={(e) => setBatchReason(e.target.value)}
                        className="text-sm border-gray-300 rounded px-2 py-1"
                    >
                        <option>Saturday</option>
                        <option>Sunday</option>
                        <option>Work Suspension</option>
                        <option>Holiday</option>
                        <option>Sick Leave</option>
                        <option>Vacation Leave</option>
                        <option>Others</option>
                    </select>
                    
                    {batchReason === "Others" && (
                        <input 
                            placeholder="Type reason..."
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            className="text-sm border-gray-300 rounded px-2 py-1"
                        />
                    )}

                    <button 
                        onClick={applyBatch}
                        className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700"
                    >
                        Apply to Selected
                    </button>
                </div>
            </div>
        )}

        <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-600 font-semibold uppercase text-xs">
            <tr>
            <th className="px-3 py-3 border-b w-10">
                <input 
                    type="checkbox" 
                    checked={selectedDays.size === days.length && days.length > 0}
                    onChange={toggleAll}
                />
            </th>
            <th className="px-4 py-3 border-b">Day</th>
            <th className="px-2 py-3 border-b text-center">AM IN</th>
            <th className="px-2 py-3 border-b text-center">AM OUT</th>
            <th className="px-2 py-3 border-b text-center">PM IN</th>
            <th className="px-2 py-3 border-b text-center">PM OUT</th>
            <th className="px-2 py-3 border-b text-center text-red-500">UT (HRS)</th>
            <th className="px-2 py-3 border-b text-center text-red-500">UT (MIN)</th>
            <th className="px-2 py-3 border-b text-center w-40">Remarks / Reason</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
            {days.map((day) => {
                const rowData = data?.[day] || {};
                const hasRemark = !!rowData.remarks;

                return (
                <tr key={day} className={`hover:bg-blue-50/50 transition-colors group ${selectedDays.has(day) ? "bg-blue-50" : ""}`}>
                    <td className="px-3 py-2 border-r text-center">
                        <input 
                            type="checkbox" 
                            checked={selectedDays.has(day)}
                            onChange={() => toggleDay(day)}
                        />
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-500 bg-gray-50 border-r w-16 text-center">{day}</td>
                    
                    {/* Time Columns or Merged Remark */}
                    {hasRemark ? (
                        <td colSpan={4} className="border-r px-2 py-1 text-center font-medium text-gray-600 italic bg-gray-50/50">
                            {rowData.remarks}
                        </td>
                    ) : (
                        <>
                            <td className="border-r min-w-[80px]">
                                <InputCell day={day} field="am_in" value={rowData.am_in} />
                            </td>
                            <td className="border-r min-w-[80px]">
                                <InputCell day={day} field="am_out" value={rowData.am_out} />
                            </td>
                            <td className="border-r min-w-[80px]">
                                <InputCell day={day} field="pm_in" value={rowData.pm_in} />
                            </td>
                            <td className="border-r min-w-[80px]">
                                <InputCell day={day} field="pm_out" value={rowData.pm_out} />
                            </td>
                        </>
                    )}

                    <td className={`border-r min-w-[60px] bg-red-50/30 ${hasRemark ? 'opacity-40' : ''}`}>
                        <InputCell day={day} field="undertime_hrs" value={rowData.undertime_hrs} />
                    </td>
                    <td className={`min-w-[60px] bg-red-50/30 border-r ${hasRemark ? 'opacity-40' : ''}`}>
                        <InputCell day={day} field="undertime_min" value={rowData.undertime_min} />
                    </td>
                    
                    {/* Remarks Column */}
                    <td className="min-w-[150px] bg-yellow-50/30">
                        <InputCell day={day} field="remarks" value={rowData.remarks} />
                    </td>
                </tr>
                );
            })}
        </tbody>
        </table>
    </div>
  );
}

function AccomplishmentTable({ attendance, arMeta, setArMeta }) {
  // Only show rows for days that exist in the parsed attendance data (or should we show all? usually AR is daily)
  // Keeping it to parsed days + any manually added tasks for now, or just 1-31 like DTR?
  // Usually AR is only for days present. Let's stick to days present + valid inputs.
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));

  const addBullet = (day) => {
    const currentText = arMeta.tasks[day] || "";
    setArMeta({
        ...arMeta,
        tasks: { 
            ...arMeta.tasks, 
            [day]: currentText + (currentText ? "\n• " : "• ") 
        }
    });
  };

  return (
    <div className="p-4 space-y-6">
        {/* Project Input (others are now shared above) */}
        <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><LayersIcon className="w-3 h-3"/> Project</label>
            <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g. Free Wifi Project"
            value={arMeta.project}
            onChange={(e) => setArMeta({ ...arMeta, project: e.target.value })}
            />
        </div>

      {/* Task List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-semibold text-gray-600 px-2">
            <span>Date</span>
            <span className="flex-1 ml-4">Task Accomplished</span>
        </div>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {days.map((day) => {
                // Determine if we should show this day (if it has data or is active)
                const hasAttendance = attendance && attendance[day] && (
                    attendance[day].am_in ||
                    attendance[day].am_out ||
                    attendance[day].pm_in ||
                    attendance[day].pm_out
                );

                return (
                    <div key={day} className={`flex gap-4 p-3 border rounded-lg hover:shadow-sm transition-shadow items-start ${hasAttendance ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
                        <div className={`w-12 h-10 flex flex-col items-center justify-center font-bold rounded-md shrink-0 ${hasAttendance ? "bg-green-100 text-green-700" : "bg-indigo-50 text-indigo-700"}`}>
                            {day}
                            {hasAttendance && <CheckIcon className="w-3 h-3 mt-0.5" />}
                        </div>
                        <div className="flex-1 relative">
                            <textarea
                                className="w-full min-h-[80px] bg-transparent border border-gray-200 rounded p-2 text-sm text-gray-700 placeholder-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-y"
                                placeholder={hasAttendance ? "Type accomplished task here..." : "No attendance log for this day..."}
                                value={arMeta.tasks[day] || ""}
                                onChange={(e) =>
                                setArMeta({
                                    ...arMeta,
                                    tasks: { ...arMeta.tasks, [day]: e.target.value },
                                })
                                }
                            />
                            <button 
                                onClick={() => addBullet(day)}
                                className="absolute right-2 bottom-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded flex items-center gap-1"
                                title="Add Bullet Point"
                            >
                                <ListIcon className="w-3 h-3" /> Bullet
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}