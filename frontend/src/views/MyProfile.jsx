import React, { useState, useEffect } from "react";

// --- ICONS ---
const Icon = ({ children, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

const UserIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

const MailIcon = ({ className }) => (
  <Icon className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Icon>
);

const PhoneIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Icon>
);

const BriefcaseIcon = ({ className }) => (
  <Icon className={className}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Icon>
);

const MapPinIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

const ShieldIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </Icon>
);

const KeyIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </Icon>
);

const SaveIcon = ({ className }) => (
    <Icon className={className}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </Icon>
);

const AlertCircleIcon = ({ className }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </Icon>
);

const CheckCircleIcon = ({ className }) => (
  <Icon className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Icon>
);

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // UI Modal State
  const [uiModal, setUiModal] = useState({ show: false, type: '', title: '', message: '', onConfirm: null });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Edit Form State
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    contact_no: "",
    password: "", // Optional
  });

  // Helper to handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const closeUiModal = () => {
    setUiModal({ show: false, type: '', title: '', message: '', onConfirm: null });
  };

  // 1. Fetch User Data
  useEffect(() => {
    const fetchProfile = async () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setLoading(false);
        return; 
      }
      
      const localUser = JSON.parse(userStr);
      // We need public_id to fetch/update
      const publicId = localUser.public_id;

      if (!publicId) {
          setUiModal({ show: true, type: 'error', title: 'Error', message: 'User Public ID not found. Please re-login.' });
          return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:5000/api/profile/${publicId}`);
        if (!response.ok) throw new Error("Failed to fetch profile");
        
        const data = await response.json();
        setProfile(data);
        
        // Populate Form
        setFormData({
            first_name: data.first_name || "",
            middle_name: data.middle_name || "",
            last_name: data.last_name || "",
            contact_no: data.contact_no || "",
            password: ""
        });
        setHasUnsavedChanges(false);
      } catch (err) {
        console.error(err);
        setUiModal({ show: true, type: 'error', title: 'Error', message: 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Warn on unsaved changes when leaving page (browser level)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 2. Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
        const payload = {
            first_name: formData.first_name,
            middle_name: formData.middle_name,
            last_name: formData.last_name,
            contact_no: formData.contact_no,
        };

        // Only send password if user typed something
        if (formData.password) {
            payload.password = formData.password;
        }

        const response = await fetch(`http://127.0.0.1:5000/api/profile/${profile.public_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Update failed");

        const result = await response.json();
        setProfile(result.user);
        
        // Update local storage to reflect name changes immediately across app
        localStorage.setItem("user", JSON.stringify(result.user));
        
        // Clear password field
        setFormData(prev => ({ ...prev, password: "" }));
        setHasUnsavedChanges(false);
        
        setUiModal({ 
            show: true, 
            type: 'success', 
            title: 'Success', 
            message: 'Profile updated successfully!',
            onConfirm: closeUiModal
        });
    } catch (err) {
        setUiModal({ 
            show: true, 
            type: 'error', 
            title: 'Error', 
            message: "Error updating profile: " + err.message,
            onConfirm: closeUiModal
        });
    } finally {
        setSaving(false);
    }
  };

  if (loading) {
      return (
        <div className="flex h-64 items-center justify-center text-slate-400">
             <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3" />
             Loading Profile...
        </div>
      );
  }

  if (!profile) {
      return <div className="p-8 text-center text-gray-500">Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-indigo-600" />
                My Profile
            </h2>
            <p className="text-slate-500 text-sm">Manage your personal information and security settings.</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{profile.role}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Read-Only Info Card */}
        <div className="lg:col-span-1 space-y-6">
             <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                 <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
                   Account Details
                 </h3>
                 
                 <div className="space-y-4">
                     <div>
                         <label className="text-xs text-slate-400 font-semibold uppercase">Employee ID</label>
                         <div className="text-slate-800 font-mono font-medium">{profile.user_id}</div>
                     </div>
                     
                     <div>
                         <label className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1">
                             <MailIcon className="w-3 h-3" /> Email Address
                         </label>
                         <div className="text-slate-800 font-medium break-all">{profile.email}</div>
                     </div>

                     <div>
                         <label className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1">
                             <BriefcaseIcon className="w-3 h-3" /> Position
                         </label>
                         <div className="text-slate-800 font-medium">{profile.position_name || "N/A"}</div>
                     </div>

                     <div>
                         <label className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1">
                             <MapPinIcon className="w-3 h-3" /> Office / Unit
                         </label>
                         <div className="text-slate-800 font-medium">{profile.office_name || "N/A"}</div>
                     </div>
                     
                     {profile.provincial_officer && (
                        <div>
                            <label className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1">
                                <ShieldIcon className="w-3 h-3" /> Reviewing Officer
                            </label>
                            <div className="text-slate-800 font-medium text-sm">{profile.provincial_officer}</div>
                        </div>
                     )}
                 </div>
             </div>
        </div>

        {/* Right Column: Editable Form */}
        <div className="lg:col-span-2">
            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                 <h3 className="text-lg font-bold text-slate-800 mb-6">Edit Information</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                     <div className="space-y-1">
                         <label className="text-sm font-medium text-slate-600">First Name</label>
                         <input 
                            type="text"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.first_name}
                            onChange={(e) => handleInputChange("first_name", e.target.value)}
                         />
                     </div>
                     <div className="space-y-1">
                         <label className="text-sm font-medium text-slate-600">Middle Name</label>
                         <input 
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.middle_name}
                            onChange={(e) => handleInputChange("middle_name", e.target.value)}
                         />
                     </div>
                     <div className="space-y-1">
                         <label className="text-sm font-medium text-slate-600">Last Name</label>
                         <input 
                            type="text"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.last_name}
                            onChange={(e) => handleInputChange("last_name", e.target.value)}
                         />
                     </div>
                     <div className="space-y-1">
                         <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                             <PhoneIcon className="w-3 h-3" /> Contact No.
                         </label>
                         <input 
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.contact_no}
                            onChange={(e) => handleInputChange("contact_no", e.target.value)}
                            placeholder="09XX XXX XXXX"
                         />
                     </div>
                 </div>

                 <hr className="border-gray-100 mb-6" />
                 
                 <div className="mb-6">
                     <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                         <KeyIcon className="w-4 h-4 text-indigo-500" /> Change Password
                     </h4>
                     <p className="text-xs text-slate-500 mb-3">Leave blank if you do not want to change your password.</p>
                     
                     <div className="space-y-1 max-w-md">
                         <label className="text-sm font-medium text-slate-600">New Password</label>
                         <input 
                            type="password"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            placeholder="••••••••"
                         />
                     </div>
                 </div>

                 <div className="flex justify-end pt-4 gap-3">
                     <button 
                        type="submit"
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg shadow-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                     >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <SaveIcon className="w-4 h-4" />
                        )}
                        Save Changes
                     </button>
                 </div>
            </form>
        </div>
      </div>

      {/* ---------------- UI FEEDBACK MODAL ---------------- */}
      {uiModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                <div className={`p-6 flex flex-col items-center text-center ${uiModal.type === 'error' ? 'bg-red-50' : uiModal.type === 'success' ? 'bg-green-50' : 'bg-white'}`}>
                    {uiModal.type === 'success' && <CheckCircleIcon className="w-12 h-12 text-green-500 mb-3" />}
                    {uiModal.type === 'error' && <AlertCircleIcon className="w-12 h-12 text-red-500 mb-3" />}
                    {uiModal.type === 'confirm' && <AlertCircleIcon className="w-12 h-12 text-amber-500 mb-3" />}
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{uiModal.title}</h3>
                    <p className="text-sm text-gray-600 mb-6">{uiModal.message}</p>
                    
                    <div className="flex gap-3 w-full justify-center">
                        {uiModal.type === 'confirm' ? (
                            <>
                                <button 
                                    onClick={closeUiModal} 
                                    className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Continue Editing
                                </button>
                                <button 
                                    onClick={uiModal.onConfirm} 
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                                >
                                    Confirm
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={uiModal.onConfirm || closeUiModal} 
                                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
                            >
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}