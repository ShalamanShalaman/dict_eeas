import React, { useState, useEffect } from "react";
import { 
  User, Mail, Phone, Briefcase, MapPin, Shield, Key, Save, 
  AlertCircle, CheckCircle, Eye, EyeOff, UserCheck, Clock, 
  Calendar, Activity
} from "lucide-react";

// --- HELPER COMPONENTS ---

// Tab Button Component
const TabButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-indigo-600 text-white shadow-md"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

// Status Badge Component
const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
    isActive 
      ? "bg-green-100 text-green-700" 
      : "bg-red-100 text-red-700"
  }`}>
    <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
    {isActive ? "Active" : "Inactive"}
  </span>
);

// Avatar Component with initials
const ProfileAvatar = ({ firstName, lastName, size = "lg" }) => {
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  const sizeClasses = size === "sm" ? "w-12 h-12 text-sm" : size === "xl" ? "w-28 h-28 text-2xl" : "w-20 h-20 text-lg";
  
  // Generate consistent color based on name
  const colors = [
    "bg-indigo-500", "bg-blue-500", "bg-teal-500", "bg-green-500", 
    "bg-yellow-500", "bg-orange-500", "bg-pink-500", "bg-purple-500"
  ];
  const colorIndex = (firstName?.length || 0 + lastName?.length || 0) % colors.length;
  
  return (
    <div className={`${sizeClasses} rounded-full flex items-center justify-center text-white font-bold shadow-lg ${colors[colorIndex]}`}>
      {initials || "U"}
    </div>
  );
};

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState("personal");
  const [showPassword, setShowPassword] = useState(false);
  const [uiModal, setUiModal] = useState({ show: false, type: '', title: '', message: '', onConfirm: null });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Edit Form State
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    contact_no: "",
    password: "",
  });

  // Helper to handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const closeUiModal = () => {
    setUiModal({ show: false, type: '', title: '', message: '', onConfirm: null });
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "N/A";
    }
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

  // Warn on unsaved changes when leaving page
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
        localStorage.setItem("user", JSON.stringify(result.user));
        
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
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">Loading Profile...</p>
          </div>
        </div>
      );
  }

  if (!profile) {
      return (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Please log in to view your profile.</p>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 p-4 md:p-6">
      {/* Header Card with Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ProfileAvatar 
              firstName={profile.first_name} 
              lastName={profile.last_name} 
              size="xl" 
            />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {profile.full_name}
              </h2>
              <p className="text-slate-500">{profile.position_name || "Employee"}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge isActive={profile.is_active} />
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  {profile.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 bg-indigo-50 rounded-xl">
              <p className="text-xs text-indigo-500 font-semibold uppercase">User ID</p>
              <p className="text-sm font-mono font-bold text-indigo-700">{profile.user_id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        <TabButton 
          icon={User} 
          label="Personal Info" 
          active={activeTab === "personal"} 
          onClick={() => setActiveTab("personal")} 
        />
        <TabButton 
          icon={Shield} 
          label="Security" 
          active={activeTab === "security"} 
          onClick={() => setActiveTab("security")} 
        />
        <TabButton 
          icon={Activity} 
          label="Account" 
          active={activeTab === "account"} 
          onClick={() => setActiveTab("account")} 
        />
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Quick Info Cards */}
        <div className="lg:col-span-1 space-y-4">
          {/* Contact Information Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <Mail className="w-4 h-4 text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm text-slate-700 font-medium truncate">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <Phone className="w-4 h-4 text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="text-sm text-slate-700 font-medium">{profile.contact_no || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400">Office</p>
                  <p className="text-sm text-slate-700 font-medium truncate">{profile.office_name || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Work Information Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Work Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400">Position</p>
                  <p className="text-sm text-slate-700 font-medium">{profile.position_name || "N/A"}</p>
                </div>
              </div>
              {profile.provincial_officer && (
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400">Reviewing Officer</p>
                    <p className="text-sm text-slate-700 font-medium truncate">{profile.provincial_officer}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Tab Content */}
        <div className="lg:col-span-2">
          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Personal Information
                </h3>
                {hasUnsavedChanges && (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    Unsaved changes
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">First Name</label>
                  <input 
                    type="text"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">Middle Name</label>
                  <input 
                    type="text"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50"
                    value={formData.middle_name}
                    onChange={(e) => handleInputChange("middle_name", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">Last Name</label>
                  <input 
                    type="text"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Contact No.
                  </label>
                  <input 
                    type="text"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50"
                    value={formData.contact_no}
                    onChange={(e) => handleInputChange("contact_no", e.target.value)}
                    placeholder="09XX XXX XXXX"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button 
                  type="submit"
                  disabled={saving || !hasUnsavedChanges}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-lg border border-white/50 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Security Settings
              </h3>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Password Security</p>
                    <p className="text-xs text-amber-700 mt-1">Leave the password field blank if you don't want to change it.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1 max-w-md">
                <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                  <Key className="w-3 h-3" /> New Password
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 pr-12"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Update Password
                </button>
              </div>
            </form>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-6">
              {/* Account Status Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-white/50 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Account Status
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <UserCheck className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Account Status</span>
                    </div>
                    <StatusBadge isActive={profile.is_active} />
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">Member Since</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDate(profile.created_at)}
                    </p>
                  </div>

                  
                </div>
              </div>

              {/* Account Info Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-white/50 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  Account Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Employee ID</p>
                    <p className="text-sm font-mono font-bold text-slate-800">{profile.user_id}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Role</p>
                    <p className="text-sm font-bold text-slate-800 capitalize">{profile.role}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Position</p>
                    <p className="text-sm font-medium text-slate-800">{profile.position_name || "N/A"}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Office</p>
                    <p className="text-sm font-medium text-slate-800">{profile.office_name || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------------- UI FEEDBACK MODAL ---------------- */}
      {uiModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
                <div className={`p-8 flex flex-col items-center text-center ${uiModal.type === 'error' ? 'bg-red-50' : uiModal.type === 'success' ? 'bg-green-50' : 'bg-white'}`}>
                    {uiModal.type === 'success' && <CheckCircle className="w-16 h-16 text-green-500 mb-4" />}
                    {uiModal.type === 'error' && <AlertCircle className="w-16 h-16 text-red-500 mb-4" />}
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{uiModal.title}</h3>
                    <p className="text-sm text-gray-600 mb-6">{uiModal.message}</p>
                    
                    <button 
                        onClick={uiModal.onConfirm || closeUiModal} 
                        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 font-medium transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
