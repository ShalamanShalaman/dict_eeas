import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useBlocker, useNavigate } from "react-router-dom";

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

const FileSignatureIcon = ({ className }) => (
    <Icon className={className}>
        <path d="M20 19v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8" />
        <path d="M18 13.5L21.5 10l-4.5-4.5L13.5 9" />
        <path d="M13.5 9L10 12.5V16h3.5L17 12.5" />
    </Icon>
);

const FileWarningIcon = ({ className }) => (
    <Icon className={className}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </Icon>
);

const PlusIcon = ({ className }) => (
  <Icon className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Icon>
);

export default function UploadAttendance({ onNavigate }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [viewMode, setViewMode] = useState("dtr");
  const [isDragging, setIsDragging] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [savedDocId, setSavedDocId] = useState(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); 
  const [targetNavigatePath, setTargetNavigatePath] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [draftName, setDraftName] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  const [arMeta, setArMeta] = useState({
    name: "",
    adjustmentName: "",
    position: "",
    office: "",
    project: "",
    approver: "",
    approverTitle: "PROVINCIAL OFFICER, ISABELA - CAUAYAN II",
    periodFormat: "full",
    tasks: {}, 
    employeeNo: "",
    controlNo: "",
    filingDate: "",
    adjustmentReason: "",
    adjustmentDetails: "",
    obWith: "",
    obAt: "",
    adjustmentRows: Array(5).fill({ date: "", am_in: "", am_out: "", pm_in: "", pm_out: "", evening_in: "", evening_out: "" })
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showConfirmDialog && e.key === 'Enter') {
        e.preventDefault();
        handleConfirmSave();
      }
    };

    if (showConfirmDialog) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showConfirmDialog]);

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
           adjustmentName: prev.adjustmentName || "",
           position: prev.position || currentUser.position_name || "",
           office: prev.office || currentUser.office_name || "",
           approver: prev.approver || currentUser.provincial_officer || ""
       }));
    }
  }, [currentUser]);

  useEffect(() => {
    const docId = searchParams.get('doc_id');
    
    if (docId && currentUser && docId !== savedDocId) {
        loadSavedDocument(docId);
    }
  }, [currentUser, searchParams]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (blocker.state === "blocked") {
      setPendingAction('navigate');
      setShowConfirmDialog(true);
    }
  }, [blocker]);

  const loadSavedDocument = async (docId) => {
    setLoading(true);
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/document/content/${docId}?user_id=${currentUser.user_id}`);
        
        if (response.status === 403 || response.status === 404) {
             setSearchParams({}); 
             setLoading(false);
             return; 
        }

        if (!response.ok) {
            throw new Error(`Failed to load document: ${response.status}`);
        }

        const stateData = await response.json();
        
        if (stateData.employees) setEmployees(stateData.employees);
        if (stateData.arMeta) setArMeta(stateData.arMeta);
        if (stateData.selectedEmployee) setSelectedEmployee(stateData.selectedEmployee);
        if (stateData.viewMode) setViewMode(stateData.viewMode);
        
        setSavedDocId(docId);
    } catch (err) {
        console.error("Load Error:", err);
        alert("Failed to load saved document: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleFile = (f) => {
    if (!f) return;
    
    if (f.type === "application/json" || f.name.endsWith(".json")) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const stateData = JSON.parse(e.target.result);
                if (stateData.employees) setEmployees(stateData.employees);
                if (stateData.arMeta) setArMeta(stateData.arMeta);
                if (stateData.selectedEmployee) setSelectedEmployee(stateData.selectedEmployee);
                if (stateData.viewMode) setViewMode(stateData.viewMode);
                alert("Progress Restored from File!");
            } catch (err) {
                alert("Failed to load saved state: " + err.message);
            }
        };
        reader.readAsText(f);
        return;
    }

    if (f.type === "application/pdf") {
        setFile(f);
    }
  };

  const openSaveModal = () => {
    if (!currentUser) {
        alert("Please log in to save your progress.");
        return;
    }
    const defaultName = `attendance_${selectedEmployee || 'draft'}`;
    setDraftName(defaultName);
    setShowNameModal(true);
  };

const handleSaveConfirmed = async () => {
    let finalFilename = draftName.trim();
    if (!finalFilename) {
        alert("Filename cannot be empty.");
        return;
    }

    if (!finalFilename.toLowerCase().endsWith(".json")) {
        finalFilename += ".json";
    }

    setLoading(true);
    try {
        const stateData = JSON.stringify({
            employees,
            selectedEmployee,
            arMeta,
            viewMode
        });
        
        const blob = new Blob([stateData], { type: "application/json" });
        const fileObj = new File([blob], finalFilename);

        const formData = new FormData();
        formData.append("file", fileObj);
        formData.append("user_id", currentUser.user_id); 

        let url = "http://127.0.0.1:5000/api/document/upload";
        if (savedDocId) {
             url = `http://127.0.0.1:5000/api/document/autosave/${savedDocId}`;
        }

        const response = await fetch(url, { method: "POST", body: formData });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        
        setShowNameModal(false);
        alert("Progress Saved to Cloud!");

        if (pendingAction === 'navigate' && blocker.state === "blocked") {
             blocker.proceed();
        } else {
             setSavedDocId(result.document.id); 
             setSearchParams({ doc_id: result.document.id });
             setHasUnsavedChanges(false);
             
             if (pendingAction === 'clear') {
                  handleClearAll();
             }
        }
        setPendingAction(null);

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
        setSavedDocId(null); 
        setSearchParams({}); 
        
        setArMeta(prev => ({
            ...prev,
            name: currentUser?.full_name || first,
            adjustmentName: "",
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

  const handleClearClick = () => {
    if (hasUnsavedChanges) {
      setPendingAction('clear');
      setShowConfirmDialog(true);
    } else {
      handleClearAll();
    }
  };

  const handleTabChange = (newMode) => {
    setViewMode(newMode);
  };

  const handleConfirmSave = () => {
    setShowConfirmDialog(false);
    openSaveModal(); 
  };

  const handleConfirmDiscard = () => {
    setShowConfirmDialog(false);
    setHasUnsavedChanges(false);
    
    if (pendingAction === 'clear') {
      handleClearAll();
    } else if (pendingAction === 'navigate' && blocker.state === "blocked") {
      blocker.proceed();
    } else {
      setHasUnsavedChanges(false);
    }
    setPendingAction(null);
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    if (pendingAction === 'navigate' && blocker.state === "blocked") {
      blocker.reset();
    }
    setPendingAction(null);
  };

  const handleClearAll = () => {
    setFile(null);
    setEmployees({});
    setSelectedEmployee("");
    setSavedDocId(null);
    setHasUnsavedChanges(false);
    setArMeta({ 
        name: currentUser?.full_name || "", 
        adjustmentName: "",
        position: currentUser?.position_name || "", 
        office: currentUser?.office_name || "", 
        approver: currentUser?.provincial_officer || "",
        approverTitle: "PROVINCIAL OFFICER, ISABELA - CAUAYAN II",
        project: "", 
        periodFormat: "full",
        tasks: {} 
    });
    if (fileInputRef.current) fileInputRef.current.value = null;
    setSearchParams({});
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
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  };

  const getFilteredPayload = () => {
    const fullData = employees[selectedEmployee] || {};
    const fullTasks = arMeta.tasks || {};
    
    if (arMeta.periodFormat === "full") {
        return { filteredData: fullData, filteredTasks: fullTasks };
    }

    const start = arMeta.periodFormat === "1-15" ? 1 : 16;
    const end = arMeta.periodFormat === "1-15" ? 15 : 31;
    
    const filteredData = { ...fullData };
    const filteredTasks = {};
    
    Object.keys(filteredData).forEach(key => {
        if (key === 'month_name' || key === 'year') return;
        const day = parseInt(key);
        if (!isNaN(day) && (day < start || day > end)) {
            delete filteredData[key];
        }
    });
    
    Object.keys(fullTasks).forEach(key => {
        const day = parseInt(key);
        if (!isNaN(day) && (day >= start && day <= end)) {
            filteredTasks[key] = fullTasks[key];
        }
    });
    
    return { filteredData, filteredTasks };
  };

  const downloadExcel = async () => {
    if (!selectedEmployee) return;

    try {
      const finalName = arMeta.name || selectedEmployee;
      const finalPeriod = getPeriodText();
      const { filteredData } = getFilteredPayload();

      const response = await fetch("http://127.0.0.1:5000/api/download-dtr", {
        method: "POST",
        mode: 'cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_name: finalName,
          employee_data: filteredData,
          approver: arMeta.approver,
          period_text: finalPeriod,
          period_format: arMeta.periodFormat
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || (!contentType.includes("application/json") && !contentType.includes("application/vnd") && !contentType.includes("application/pdf"))) {
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
      const { filteredData, filteredTasks } = getFilteredPayload();

      const response = await fetch("http://127.0.0.1:5000/api/generate-ar", {
        method: "POST",
        mode: 'cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_name: finalName,
          employee_data: filteredData,
          position: arMeta.position,
          office: arMeta.office,
          project: arMeta.project,
          period_text: finalPeriod,
          approver: arMeta.approver,
          approver_title: arMeta.approverTitle,
          tasks: filteredTasks,
          overrides: {
            name: finalName, 
            position: arMeta.position,
            office: arMeta.office,
            project: arMeta.project,
            tasks: filteredTasks,
            approved_by: arMeta.approver,
            approver_title: arMeta.approverTitle
          }
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || (!contentType.includes("application/json") && !contentType.includes("application/vnd") && !contentType.includes("application/pdf"))) {
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

  const downloadMerged = async () => {
    if (!selectedEmployee) return;

    try {
      const finalName = arMeta.name || selectedEmployee;
      const finalPeriod = getPeriodText();
      const { filteredData, filteredTasks } = getFilteredPayload();

      const response = await fetch("http://127.0.0.1:5000/api/generate-merged-report", {
        method: "POST",
        mode: 'cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_name: finalName,
          employee_data: filteredData,
          position: arMeta.position,
          office: arMeta.office,
          project: arMeta.project,
          period_text: finalPeriod,
          approver: arMeta.approver,
          overrides: {
            name: finalName, 
            position: arMeta.position,
            office: arMeta.office,
            project: arMeta.project,
            tasks: filteredTasks,
            approved_by: arMeta.approver,
            approver_title: arMeta.approverTitle
          }
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || (!contentType.includes("application/json") && !contentType.includes("application/vnd"))) {
          if (!response.ok) {
             const text = await response.text();
             console.error("Merged Report Generation Error:", text);
             throw new Error(`Server returned ${response.status}. See console.`);
          }
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename = finalName.replace(/\s+/g, '_');
        a.download = `Merged_Report_${filename}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const err = await response.json();
        alert("Error downloading Merged Report: " + err.error);
      }
    } catch (error) {
      alert("Download failed: " + error.message);
    }
  };

  const downloadDtrAdjustment = async () => {
    try {
      const finalName = arMeta.name || selectedEmployee || currentUser?.full_name;

      const response = await fetch("http://127.0.0.1:5000/api/generate-dtr-adjustment", {
        method: "POST",
        mode: 'cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overrides: {
            name: finalName,
            adjustment_name: arMeta.adjustmentName,
            employee_no: arMeta.employeeNo,
            control_no: arMeta.controlNo,
            filing_date: arMeta.filingDate,
            reason: arMeta.adjustmentReason,
            ob_with: arMeta.adjustmentReason === 'ob' ? arMeta.obWith : '',
            ob_at: arMeta.adjustmentReason === 'ob' ? arMeta.obAt : '',
            personal_details: arMeta.adjustmentReason === 'personal' ? arMeta.adjustmentDetails : '',
            other_details: arMeta.adjustmentReason === 'other' ? arMeta.adjustmentDetails : '',
            adjustment_rows: arMeta.adjustmentRows,
            approver: arMeta.approver
          }
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `DTR_ADJUSTMENT_${finalName.replace(/\s+/g, '_')}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const err = await response.json().catch(() => ({ error: "An unknown error occurred." }));
        alert("Error downloading Adjustment Slip: " + (err.error || "Unknown error"));
      }
    } catch (error) {
      alert("Download failed: " + error.message);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto min-h-screen">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FileTextIcon className="w-6 h-6 text-blue-600" />
          Attendance Processor
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
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
                accept=".pdf,.json" 
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

          <div className="flex flex-col gap-3 justify-center">
            <button
              onClick={openSaveModal}
              disabled={!selectedEmployee} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg shadow-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <SaveIcon className="w-4 h-4" /> Save Progress
            </button>

            <button
              onClick={handleUpload}
              disabled={!file || loading || (file && file.type === "application/json")} 
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
              onClick={handleClearClick}
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
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
            <button
                onClick={() => handleTabChange("dtr")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "dtr"
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Daily Time Record
              </button>
              <button
                onClick={() => handleTabChange("ar")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "ar"
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Accomplishment Report
              </button>
              <button
                onClick={() => handleTabChange("dtr_adjustment")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "dtr_adjustment"
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                DTR Adjustment Slip
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                    {viewMode === "dtr" ? "Edit Attendance Log" : "Edit Accomplishment Report"}
                    {viewMode === "dtr_adjustment" && "DTR Adjustment Slip Details"}
                </h3>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Edit3Icon className="w-4 h-4" />
                    Editable Preview
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 mb-6 border-b border-gray-100">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><UserIcon className="w-3 h-3"/> Employee Name</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. Juan Dela Cruz"
                        value={arMeta.name}
                        onChange={(e) => { setArMeta({ ...arMeta, name: e.target.value }); setHasUnsavedChanges(true); }}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><BriefcaseIcon className="w-3 h-3"/> Position</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. Project Officer I"
                        value={arMeta.position}
                        onChange={(e) => { setArMeta({ ...arMeta, position: e.target.value }); setHasUnsavedChanges(true); }}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><MapPinIcon className="w-3 h-3"/> Office</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. Cauayan Office"
                        value={arMeta.office}
                        onChange={(e) => { setArMeta({ ...arMeta, office: e.target.value }); setHasUnsavedChanges(true); }}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><BadgeCheckIcon className="w-3 h-3"/> Approved By</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Provincial Officer Name"
                        value={arMeta.approver}
                        onChange={(e) => { setArMeta({ ...arMeta, approver: e.target.value }); setHasUnsavedChanges(true); }}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><BadgeCheckIcon className="w-3 h-3"/> Approver Title</label>
                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. PROVINCIAL OFFICER..."
                        value={arMeta.approverTitle}
                        onChange={(e) => { setArMeta({ ...arMeta, approverTitle: e.target.value }); setHasUnsavedChanges(true); }}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> Period Coverage</label>
                    <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={arMeta.periodFormat}
                        onChange={(e) => { setArMeta({ ...arMeta, periodFormat: e.target.value }); setHasUnsavedChanges(true); }}
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
                    periodFormat={arMeta.periodFormat}
                />
                ) : viewMode === "ar" ? (
                <AccomplishmentTable
                    attendance={employees[selectedEmployee]}
                    arMeta={arMeta}
                    setArMeta={setArMeta}
                    periodFormat={arMeta.periodFormat}
                />
                ) : (
                <DTRAdjustmentSlip
                    arMeta={arMeta}
                    setArMeta={setArMeta}
                    setHasUnsavedChanges={setHasUnsavedChanges}
                    currentUser={currentUser}
                />
                )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-gray-100 gap-3">
              {viewMode === 'dtr' && (
                <button
                  onClick={downloadExcel}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-md font-medium transition-all flex items-center gap-2 text-sm"
                >
                  <DownloadIcon className="w-4 h-4" /> Download DTR
                </button>
              )}

              {viewMode === 'ar' && (
                <button
                  onClick={downloadAR}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md font-medium transition-all flex items-center gap-2 text-sm"
                >
                  <DownloadIcon className="w-4 h-4" /> Download AR
                </button>
              )}

              {viewMode === 'dtr_adjustment' && (
                <button
                  onClick={downloadDtrAdjustment}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg shadow-md font-medium transition-all flex items-center gap-2 text-sm"
                >
                  <FileWarningIcon className="w-4 h-4" /> Download Adjustment Slip
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleCancelConfirm}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">Unsaved Changes</h3>
              <p className="text-gray-600 mb-6">Want to save changes to this attendance?</p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCancelConfirm}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDiscard}
                  className="flex-1 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  Don't Save
                </button>
                <button
                  onClick={handleConfirmSave}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNameModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Save Draft</h3>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Draft Name</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => { 
                    if (e.key === 'Enter') {
                    e.preventDefault(); 
                    handleSaveConfirmed(); 
                     }
                   }}
                   autoFocus
                />
            </div>
            <div className="flex justify-end gap-3">
                <button 
                    onClick={() => setShowNameModal(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSaveConfirmed}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Save
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DTRAdjustmentSlip({ arMeta, setArMeta, setHasUnsavedChanges, currentUser }) {
  const handleFieldChange = (field, value) => {
    setArMeta(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...arMeta.adjustmentRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setArMeta(prev => ({ ...prev, adjustmentRows: newRows }));
    setHasUnsavedChanges(true);
  };

  const addRow = () => {
    setArMeta(prev => ({
        ...prev,
        adjustmentRows: [...prev.adjustmentRows, { date: "", am_in: "", am_out: "", pm_in: "", pm_out: "", evening_in: "", evening_out: "" }]
    }));
    setHasUnsavedChanges(true);
  };

  const removeRow = (index) => {
    const newRows = arMeta.adjustmentRows.filter((_, i) => i !== index);
    setArMeta(prev => ({ ...prev, adjustmentRows: newRows }));
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    if (currentUser) {
        setArMeta(prev => {
            const newName = prev.name || currentUser.full_name || "";
            const newApprover = prev.approver || currentUser.provincial_officer || "";
            if (prev.name !== newName || prev.approver !== newApprover) {
                return { ...prev, name: newName, approver: newApprover };
            }
            return prev;
        });
    }
  }, [currentUser, setArMeta]);

  return (
    <div className="p-4 bg-gray-50 overflow-x-auto">
      <div className="bg-white border-2 border-black text-black max-w-6xl mx-auto shadow-lg">
        
        <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black p-2 flex items-center gap-2">
                <span className="font-bold text-sm whitespace-nowrap">Employee No.:</span>
                <input 
                    className="flex-1 min-w-0 border-b border-gray-300 focus:border-blue-500 outline-none px-1 text-sm bg-transparent"
                    value={arMeta.employeeNo}
                    onChange={(e) => handleFieldChange('employeeNo', e.target.value)}
                />
            </div>
            <div className="flex-1 p-2 flex items-center gap-2">
                <span className="font-bold text-sm whitespace-nowrap">Control No.:</span>
                <input 
                    className="flex-1 min-w-0 border-b border-gray-300 focus:border-blue-500 outline-none px-1 text-sm bg-transparent"
                    value={arMeta.controlNo}
                    onChange={(e) => handleFieldChange('controlNo', e.target.value)}
                />
            </div>
        </div>

        <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black p-2">
                <div className="font-bold text-sm mb-1">Name:</div>
                <input 
                    className="w-full min-w-0 border-b border-gray-300 focus:border-blue-500 outline-none px-1 text-sm font-medium bg-transparent"
                    value={arMeta.adjustmentName}
                    onChange={(e) => handleFieldChange('adjustmentName', e.target.value)}
                    placeholder="LAST, FIRST M.I."
                />
            </div>
            <div className="flex-1 p-2">
                <div className="font-bold text-sm mb-1">Date/Time of Filing:</div>
                <input 
                    type="datetime-local"
                    className="w-full min-w-0 border-b border-gray-300 focus:border-blue-500 outline-none px-1 text-sm bg-transparent"
                    value={arMeta.filingDate}
                    onChange={(e) => handleFieldChange('filingDate', e.target.value)}
                />
            </div>
        </div>

        <div className="text-center font-bold border-b border-black py-1 bg-gray-200 text-sm">
            DETAILS OF DTR ADJUSTMENT
        </div>

        <div className="border-b border-black">
          <table className="w-full text-sm text-center border-collapse">
            <thead>
              <tr>
                <th className="border-r border-b border-black px-1 py-1 w-[15%]">DATES</th>
                <th colSpan="2" className="border-r border-b border-black px-1 py-1 w-[25%]">AM</th>
                <th colSpan="2" className="border-r border-b border-black px-1 py-1 w-[25%]">PM</th>
                <th colSpan="2" className="border-b border-black px-1 py-1 w-[35%]">EVENING</th>
                <th className="border-b border-black w-8"></th>
              </tr>
              <tr>
                <th className="border-r border-b border-black px-1 py-1 h-8"></th>
                <th className="border-r border-b border-black px-1 py-1">IN</th>
                <th className="border-r border-b border-black px-1 py-1">OUT</th>
                <th className="border-r border-b border-black px-1 py-1">IN</th>
                <th className="border-r border-b border-black px-1 py-1">OUT</th>
                <th className="border-r border-b border-black px-1 py-1">IN</th>
                <th className="border-b border-black px-1 py-1"></th>
                <th className="border-b border-black"></th>
              </tr>
            </thead>
            <tbody>
              {arMeta.adjustmentRows.map((row, idx) => (
                <tr key={idx} className="border-b border-black last:border-0">
                  <td className="border-r border-black p-0"><input type="date" className="w-full min-w-0 text-xs border-0 text-center focus:ring-0 h-8 p-0 bg-transparent" value={row.date} onChange={(e) => handleRowChange(idx, 'date', e.target.value)} /></td>
                  <td className="border-r border-black p-0"><input type="text" placeholder="--:--" className="w-full min-w-0 text-xs border-0 text-center focus:ring-0 h-8 p-0 bg-transparent font-mono" value={row.am_in} onChange={(e) => handleRowChange(idx, 'am_in', e.target.value)} /></td>
                  <td className="border-r border-black p-0"><input type="text" placeholder="--:--" className="w-full min-w-0 text-xs border-0 text-center focus:ring-0 h-8 p-0 bg-transparent font-mono" value={row.am_out} onChange={(e) => handleRowChange(idx, 'am_out', e.target.value)} /></td>
                  <td className="border-r border-black p-0"><input type="text" placeholder="--:--" className="w-full min-w-0 text-xs border-0 text-center focus:ring-0 h-8 p-0 bg-transparent font-mono" value={row.pm_in} onChange={(e) => handleRowChange(idx, 'pm_in', e.target.value)} /></td>
                  <td className="border-r border-black p-0"><input type="text" placeholder="--:--" className="w-full min-w-0 text-xs border-0 text-center focus:ring-0 h-8 p-0 bg-transparent font-mono" value={row.pm_out} onChange={(e) => handleRowChange(idx, 'pm_out', e.target.value)} /></td>
                  <td className="border-r border-black p-0"><input type="text" placeholder="--:--" className="w-full min-w-0 text-xs border-0 text-center focus:ring-0 h-8 p-0 bg-transparent font-mono" value={row.evening_in} onChange={(e) => handleRowChange(idx, 'evening_in', e.target.value)} /></td>
                  <td className="p-0"><input type="text" placeholder="--:--" className="w-full min-w-0 text-xs border-0 text-center focus:ring-0 h-8 p-0 bg-transparent font-mono" value={row.evening_out} onChange={(e) => handleRowChange(idx, 'evening_out', e.target.value)} /></td>
                  <td className="p-0 text-center bg-gray-50">
                    <button 
                        onClick={() => removeRow(idx)}
                        disabled={arMeta.adjustmentRows.length <= 1}
                        className="text-red-500 hover:text-red-700 disabled:opacity-30"
                    >
                        <Trash2Icon className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-gray-100 p-1 flex justify-center border-t border-black">
              <button onClick={addRow} className="text-xs flex items-center gap-1 text-blue-600 font-bold hover:underline">
                  <PlusIcon className="w-3 h-3" /> Add Row
              </button>
          </div>
        </div>

        <div className="border-b border-black p-2">
            <div className="font-bold text-sm mb-2">REASON FOR ADJUSTMENT:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 pr-2">
             <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="adjustmentReason" 
                checked={arMeta.adjustmentReason === 'fingerprint'} 
                onChange={() => handleFieldChange('adjustmentReason', 'fingerprint')}
                className="w-4 h-4 text-black focus:ring-black"
              />
              <span className="text-sm">Fingerprint not recognized</span>
             </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="adjustmentReason" 
                  checked={arMeta.adjustmentReason === 'ob'} 
                  onChange={() => handleFieldChange('adjustmentReason', 'ob')}
                  className="w-4 h-4 text-black focus:ring-black"
                />
                <span className="text-sm">On Official Business / Pass Slip</span>
              </label>
              {arMeta.adjustmentReason === 'ob' && (
                <div className="pl-6 mt-1 space-y-2 pr-2">
                    <input 
                      className="w-full min-w-0 border border-gray-300 rounded px-2 py-1 text-sm bg-transparent" 
                      placeholder="With..." 
                      value={arMeta.obWith}
                      onChange={(e) => handleFieldChange('obWith', e.target.value)}
                    />
                    <input 
                      className="w-full min-w-0 border border-gray-300 rounded px-2 py-1 text-sm bg-transparent" 
                      placeholder="At..." 
                      value={arMeta.obAt}
                      onChange={(e) => handleFieldChange('obAt', e.target.value)}
                    />
                </div>
              )}
             </div>

             <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="adjustmentReason" checked={arMeta.adjustmentReason === 'personal'} onChange={() => handleFieldChange('adjustmentReason', 'personal')} className="w-4 h-4 text-black focus:ring-black" />
                <span className="text-sm">Personal Reason</span>
              </label>
              {arMeta.adjustmentReason === 'personal' && (
                <div className="pl-6 mt-1 pr-2">
                    <textarea 
                        rows="2"
                        className="w-full min-w-0 border border-gray-300 rounded px-2 py-1 text-sm resize-y bg-transparent" 
                        placeholder="Specify reason..." 
                        value={arMeta.adjustmentDetails} 
                        onChange={(e) => handleFieldChange('adjustmentDetails', e.target.value)} 
                    />
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="adjustmentReason" checked={arMeta.adjustmentReason === 'other'} onChange={() => handleFieldChange('adjustmentReason', 'other')} className="w-4 h-4 text-black focus:ring-black" />
                <span className="text-sm">Other reasons</span>
              </label>
              {arMeta.adjustmentReason === 'other' && (
                <div className="pl-6 mt-1 pr-2">
                    <textarea 
                        rows="2"
                        className="w-full min-w-0 border border-gray-300 rounded px-2 py-1 text-sm resize-y bg-transparent" 
                        placeholder="Specify reason..." 
                        value={arMeta.adjustmentDetails} 
                        onChange={(e) => handleFieldChange('adjustmentDetails', e.target.value)} 
                    />
                </div>
              )}
             </div>
            </div>
        </div>

        <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black p-2">
                <div className="font-bold text-sm mb-8">CERTIFIED TRUE AND CORRECT:</div>
                <div className="text-center font-bold uppercase underline">{arMeta.name || "Employee Name"}</div>
                <div className="text-center text-xs">SIGNATURE OF EMPLOYEE</div>
            </div>
            <div className="flex-1 p-2">
                <div className="font-bold text-sm mb-8">APPROVED BY:</div>
                <input 
                    className="w-full min-w-0 text-center font-bold uppercase underline border-none focus:ring-0 p-0 bg-transparent"
                    value={arMeta.approver || ""}
                    onChange={(e) => handleFieldChange('approver', e.target.value)}
                    placeholder="APPROVER NAME"
                />
                <div className="text-center text-xs">SIGNATURE OVER PRINTED NAME OF IMMEDIATE SUPERVISOR</div>
            </div>
        </div>
      </div>
    </div>
  );
}

const InputCell = ({ day, field, value, onUpdate }) => (
    <input 
        type="text" 
        value={value || ""}
        onChange={(e) => onUpdate(day, field, e.target.value)}
        className="w-full bg-transparent border-0 p-1 text-center focus:ring-1 focus:ring-blue-500 focus:bg-white rounded text-gray-700 font-mono text-sm"
        placeholder={field === "remarks" ? "..." : "--:--"}
    />
);

function DTRTable({ data, onUpdate, onBatchUpdate, periodFormat }) {
  let start = 1;
  let end = 31;
  if (periodFormat === "1-15") end = 15;
  if (periodFormat === "16-end") start = 16;
  const days = Array.from({ length: end - start + 1 }, (_, i) => String(start + i));
  
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
      setSelectedDays(new Set());
  };

  const clearBatchRemarks = () => {
      onBatchUpdate(Array.from(selectedDays), "remarks", "");
      setSelectedDays(new Set());
  };

  return (
    <div>
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

                    <button 
                        onClick={clearBatchRemarks}
                        className="bg-white border border-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-100 ml-2"
                        title="Remove remarks and restore time columns"
                    >
                        Clear Remarks
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
                    
                    {hasRemark ? (
                        <td colSpan={4} className="border-r px-2 py-1 text-center font-medium text-gray-600 italic bg-gray-50/50">
                            {rowData.remarks}
                        </td>
                    ) : (
                        <>
                            <td className="border-r min-w-[80px]">
                                <InputCell day={day} field="am_in" value={rowData.am_in} onUpdate={onUpdate} />
                            </td>
                            <td className="border-r min-w-[80px]">
                                <InputCell day={day} field="am_out" value={rowData.am_out} onUpdate={onUpdate} />
                            </td>
                            <td className="border-r min-w-[80px]">
                                <InputCell day={day} field="pm_in" value={rowData.pm_in} onUpdate={onUpdate} />
                            </td>
                            <td className="border-r min-w-[80px]">
                                <InputCell day={day} field="pm_out" value={rowData.pm_out} onUpdate={onUpdate} />
                            </td>
                        </>
                    )}

                    <td className={`border-r min-w-[60px] bg-red-50/30 ${hasRemark ? 'opacity-40' : ''}`}>
                        <InputCell day={day} field="undertime_hrs" value={rowData.undertime_hrs} onUpdate={onUpdate} />
                    </td>
                    <td className={`min-w-[60px] bg-red-50/30 border-r ${hasRemark ? 'opacity-40' : ''}`}>
                        <InputCell day={day} field="undertime_min" value={rowData.undertime_min} onUpdate={onUpdate} />
                    </td>
                    
                    <td className="min-w-[150px] bg-yellow-50/30">
                        <InputCell day={day} field="remarks" value={rowData.remarks} onUpdate={onUpdate} />
                    </td>
                </tr>
                );
            })}
        </tbody>
        </table>
    </div>
  );
}

function AccomplishmentTable({ attendance, arMeta, setArMeta, periodFormat }) {
  let start = 1;
  let end = 31;
  if (periodFormat === "1-15") end = 15;
  if (periodFormat === "16-end") start = 16;
  const days = Array.from({ length: end - start + 1 }, (_, i) => String(start + i));

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
        <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><LayersIcon className="w-3 h-3"/> Project</label>
            <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g. Free Wifi Project"
            value={arMeta.project}
            onChange={(e) => setArMeta({ ...arMeta, project: e.target.value })}
            />
        </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-semibold text-gray-600 px-2">
            <span>Date</span>
            <span className="flex-1 ml-4">Task Accomplished</span>
        </div>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {days.map((day) => {
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