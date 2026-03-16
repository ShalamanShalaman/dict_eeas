import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  User, Mail, Phone, Briefcase, MapPin, Shield, Key, Save, 
  AlertCircle, CheckCircle, Eye, EyeOff, UserCheck, Clock, 
  Calendar, Activity, Pencil, X, Smartphone, MessageSquare,
  RefreshCw, Camera
} from "lucide-react";

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

const ProfileAvatar = ({ firstName, lastName, size = "lg" }) => {
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  const sizeClasses = size === "sm" ? "w-12 h-12 text-sm" : size === "xl" ? "w-28 h-28 text-2xl" : "w-20 h-20 text-lg";
    
  const colors = [
    "bg-indigo-500", "bg-blue-500", "bg-teal-500", "bg-green-500", 
    "bg-yellow-500", "bg-orange-500", "bg-pink-500", "bg-purple-500"
  ];
  const colorIndex = ((firstName?.length || 0) + (lastName?.length || 0)) % colors.length;
    
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Cache buster for profile images
  const [imageHash, setImageHash] = useState(() => Date.now());

  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab");
    return tab === "personal" || tab === "security" || tab === "account" ? tab : "personal";
  });

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [uiModal, setUiModal] = useState({ show: false, type: '', title: '', message: '', onConfirm: null });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  
  // Replaced phoneVerified with emailVerified for the new email OTP flow
  const [emailVerified, setEmailVerified] = useState(true); 
  const [verifiedProfileOtp, setVerifiedProfileOtp] = useState(""); // Holds the OTP to pass on final save

  const [usingOtpForPassword, setUsingOtpForPassword] = useState(false);
  const [passwordResetOtp, setPasswordResetOtp] = useState("");
  const [resetOtpLoading, setResetOtpLoading] = useState(false);
  
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [pictureInputKey, setPictureInputKey] = useState(0);
  const [pictureMenuOpen, setPictureMenuOpen] = useState(false);
  const [deletePictureConfirm, setDeletePictureConfirm] = useState(false);
  const fileInputRef = useRef(null);
   
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
   
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    contact_no: "",
    password: "",
    old_password: "", 
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // Trigger verification requirement if they change their email
    if (field === "email" && profile && value !== profile.email) {
        setEmailVerified(false);
        setVerifiedProfileOtp(""); // Reset any previously verified OTP
    } else if (field === "email" && profile && value === profile.email) {
        // If they revert back to original email, it is automatically verified
        setEmailVerified(true);
        setVerifiedProfileOtp("");
    }
  };

  const closeUiModal = () => {
    setUiModal({ show: false, type: '', title: '', message: '', onConfirm: null });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setUsingOtpForPassword(false);
    setPasswordResetOtp("");
    setVerifiedProfileOtp("");
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        middle_name: profile.middle_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        contact_no: profile.contact_no || "",
        password: "",
        old_password: ""
      });
      setEmailVerified(true); 
    }
    setHasUnsavedChanges(false);
  };

  const confirmCancel = () => {
    resetForm();
    setShowCancelConfirm(false);
  };

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

  const handleSendOtp = async () => {
    if (!formData.email) {
        setUiModal({ show: true, type: 'error', title: 'Error', message: 'Please enter an email address first.' });
        return;
    }

    setOtpLoading(true);
    try {
        const response = await fetch('http://127.0.0.1:8000/api/profile/send-otp', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                user_id: profile.user_id,
                email: formData.email 
            })
        });

        let data;
        try {
            data = await response.json(); 
        } catch (parseError) {
            throw new Error(`Server Error (${response.status}): The backend returned HTML instead of JSON.`);
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || "Failed to send OTP"); 
        }
        
        setOtpModalOpen(true);
        
    } catch (err) {
        setUiModal({ show: true, type: 'error', title: 'Mail Error', message: err.message });
    } finally {
        setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    try {
        const response = await fetch('http://127.0.0.1:8000/api/profile/verify-otp', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                user_id: profile.user_id,
                otp: otpCode 
            })
        });

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            throw new Error(`Server Error (${response.status}): The backend returned HTML instead of JSON.`);
        }
        
        if (response.ok) {
            setEmailVerified(true);
            setVerifiedProfileOtp(otpCode); // Store to pass to handleSave
            setOtpModalOpen(false);
            setOtpCode("");
            setUiModal({ show: true, type: 'success', title: 'Verified', message: 'Email verified successfully! Don\'t forget to click Save Changes.' });
        } else {
            setUiModal({ show: true, type: 'error', title: 'Error', message: data.error || data.message || 'Invalid Code' });
        }
    } catch (err) {
        setUiModal({ show: true, type: 'error', title: 'Error', message: err.message || 'Verification failed.' });
    } finally {
        setOtpLoading(false);
    }
  };

  const handleStartPasswordReset = async () => {
      if (!profile.email) {
          setUiModal({ show: true, type: 'error', title: 'No Email', message: 'You need a registered email address to reset your password.' });
          return;
      }

      setResetOtpLoading(true);
      try {
          const response = await fetch('http://127.0.0.1:8000/api/profile/send-otp', {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
              },
              body: JSON.stringify({ 
                  user_id: profile.user_id,
                  email: profile.email 
              })
          });

          let data;
          try {
              data = await response.json(); 
          } catch (parseError) {
              throw new Error(`Server Error (${response.status}): The backend returned HTML instead of JSON.`);
          }

          if (!response.ok) {
              throw new Error(data.error || data.message || "Failed to send OTP");
          }
          
          setUsingOtpForPassword(true);
          setFormData(prev => ({ ...prev, old_password: "" }));
          
          setUiModal({ show: true, type: 'success', title: 'Code Sent', message: `Verification code sent to ${profile.email}.` });

      } catch (err) {
          setUiModal({ show: true, type: 'error', title: 'Mail Error', message: err.message });
      } finally {
          setResetOtpLoading(false);
      }
  };

  const handleCancelPasswordReset = () => {
      setUsingOtpForPassword(false);
      setPasswordResetOtp("");
  };

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
        const response = await fetch(`http://127.0.0.1:8000/api/profile/${publicId}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            throw new Error(`Server Error (${response.status}): Could not load profile.`);
        }

        if (!response.ok) throw new Error(data.error || data.message || "Failed to fetch profile");
        
        setProfile(data);
        
        setFormData({
            first_name: data.first_name || "",
            middle_name: data.middle_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            contact_no: data.contact_no || "",
            password: "",
            old_password: ""
        });
        setEmailVerified(true);
        setHasUnsavedChanges(false);
        setIsEditing(false); 
      } catch (err) {
        console.error(err);
        setUiModal({ show: true, type: 'error', title: 'Error', message: err.message || 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile) return;

    if (!emailVerified) {
        setUiModal({ show: true, type: 'error', title: 'Verification Required', message: 'Please verify your new email address before saving.' });
        return;
    }

    if (formData.password) {
        if (!usingOtpForPassword && !formData.old_password) {
            setUiModal({ show: true, type: 'error', title: 'Authentication Required', message: 'Please enter your old password or use the "Forgot Password" option.' });
            return;
        }
        if (usingOtpForPassword && !passwordResetOtp) {
             setUiModal({ show: true, type: 'error', title: 'Authentication Required', message: 'Please enter the verification code sent to your email.' });
             return;
        }
    }

    setSaving(true);
    try {
        const payload = {
            first_name: formData.first_name,
            middle_name: formData.middle_name,
            last_name: formData.last_name,
            email: formData.email,
            contact_no: formData.contact_no,
        };

        // Attach OTP if they verified an email change OR if they are resetting password
        if (verifiedProfileOtp) {
            payload.otp = verifiedProfileOtp;
        }

        if (formData.password) {
            payload.password = formData.password;
            
            if (usingOtpForPassword) {
                payload.otp = passwordResetOtp;
            } else {
                payload.old_password = formData.old_password;
            }
        }

        const response = await fetch(`http://127.0.0.1:8000/api/profile/${profile.public_id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        });

        let result;
        try {
            result = await response.json();
        } catch (parseError) {
             throw new Error(`Server Error (${response.status}): Failed to save changes.`);
        }

        if (!response.ok) {
            throw new Error(result.error || result.message || "Update failed");
        }

        setProfile(result.user);
        localStorage.setItem("user", JSON.stringify(result.user));
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: result.user }));
        
        setFormData(prev => ({ ...prev, password: "", old_password: "" }));
        setUsingOtpForPassword(false);
        setPasswordResetOtp("");
        setVerifiedProfileOtp("");
        setHasUnsavedChanges(false);
        setIsEditing(false);
        
        setUiModal({ 
            show: true, 
            type: 'success', 
            title: 'Success', 
            message: 'Profile updated successfully!',
            onConfirm: () => {
              closeUiModal();
              setIsEditing(false);
            }
        });
    } catch (err) {
        setUiModal({ 
            show: true, 
            type: 'error', 
            title: 'Error', 
            message: err.message,
            onConfirm: closeUiModal
        });
    } finally {
        setSaving(false);
    }
  };

  const handlePictureSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUiModal({ 
        show: true, 
        type: 'error', 
        title: 'File Too Large', 
        message: 'Profile picture must be less than 5MB.' 
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUiModal({ 
        show: true, 
        type: 'error', 
        title: 'Invalid File Type', 
        message: 'Only PNG, JPG, JPEG, GIF, and WEBP images are allowed.' 
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPicture = async (file) => {
    if (!file || !profile) return;

    setUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://127.0.0.1:8000/api/profile/${profile.public_id}/upload-picture`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: formData
      });

      let result;
      try {
          result = await response.json();
      } catch (parseError) {
          throw new Error(`Server Error (${response.status}): Failed to upload picture.`);
      }

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Upload failed');
      }

      setProfile(result.user);
      localStorage.setItem("user", JSON.stringify(result.user));
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: result.user }));
      setProfilePicturePreview(null);
      setSelectedFile(null);
      setPictureInputKey(prev => prev + 1);
      
      setImageHash(Date.now());
      
      setUiModal({
        show: true,
        type: 'success',
        title: 'Success',
        message: 'Profile picture uploaded successfully!'
      });
    } catch (err) {
      setUiModal({
        show: true,
        type: 'error',
        title: 'Upload Failed',
        message: err.message || 'Failed to upload profile picture'
      });
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!profile) return;

    setUploadingPicture(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/profile/${profile.public_id}/picture`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json'
        }
      });

      let result;
      try {
          result = await response.json();
      } catch (parseError) {
          throw new Error(`Server Error (${response.status}): Failed to delete picture.`);
      }

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Delete failed');
      }

      setProfile(result.user || profile);
      localStorage.setItem("user", JSON.stringify(result.user || profile));
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: result.user || profile }));
      setProfilePicturePreview(null);
      
      setImageHash(Date.now());
      
      setUiModal({
        show: true,
        type: 'success',
        title: 'Success',
        message: 'Profile picture deleted successfully!'
      });
    } catch (err) {
      setUiModal({
        show: true,
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Failed to delete profile picture'
      });
    } finally {
      setUploadingPicture(false);
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
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {profile.profile_picture ? (
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-indigo-200 shadow-lg bg-slate-100">
                <img
                  key={imageHash}
                  src={`http://127.0.0.1:8000/storage/profile_pictures/${profile.profile_picture}?t=${imageHash}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            ) : (
              <ProfileAvatar 
                firstName={profile.first_name} 
                lastName={profile.last_name} 
                size="xl" 
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {profile.full_name}
              </h2>
              <p className="text-slate-500">{profile.position_id || "Employee"}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge isActive={profile.is_active} />
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  {profile.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
            
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 bg-indigo-50 rounded-xl">
              <p className="text-xs text-indigo-500 font-semibold uppercase">User ID</p>
              <p className="text-sm font-mono font-bold text-indigo-700">{profile.user_id}</p>
            </div>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 space-y-4">
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
                  <p className="text-sm text-slate-700 font-medium">{profile.position_id || "N/A"}</p>
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

        <div className="lg:col-span-2">
          {activeTab === "personal" && (
            <form id="personal-info-form" onSubmit={handleSave} className="bg-white rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Personal Information
                </h3>
                <div className="flex items-center gap-2">
                  {hasUnsavedChanges && !isEditing && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Unsaved changes
                    </span>
                  )}
                  {!isEditing ? (
                    <button 
                      type="button"
                      onClick={handleEditClick}
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={handleCancelClick}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        form="personal-info-form"
                        disabled={saving || !hasUnsavedChanges}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                      >
                        {saving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-32">
                    {profilePicturePreview ? (
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-200 shadow-lg">
                        <img src={profilePicturePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : profile.profile_picture ? (
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-200 shadow-lg bg-slate-100">
                        <img 
                          key={imageHash}
                          src={`http://127.0.0.1:8000/storage/profile_pictures/${profile.profile_picture}?t=${imageHash}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-200 shadow-lg flex items-center justify-center bg-indigo-50">
                        <ProfileAvatar firstName={profile.first_name} lastName={profile.last_name} size="xl" />
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={uploadingPicture}
                      onClick={() => setPictureMenuOpen(!pictureMenuOpen)}
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white shadow-lg flex items-center justify-center transition-all hover:shadow-xl disabled:cursor-not-allowed"
                    >
                      <Camera className="w-5 h-5" />
                    </button>

                    {pictureMenuOpen && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border border-slate-200 z-50 w-48">
                        <label className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-2 border-b border-slate-200">
                          <Camera className="w-4 h-4" />
                          Upload From Device
                          <input 
                            ref={fileInputRef}
                            key={pictureInputKey}
                            type="file" 
                            disabled={uploadingPicture}
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              handlePictureSelect(e);
                              setPictureMenuOpen(false);
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletePictureConfirm(true);
                            setPictureMenuOpen(false);
                          }}
                          disabled={uploadingPicture || !profile.profile_picture}
                          className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors rounded-b-lg ${
                            profile.profile_picture
                              ? 'text-red-600 hover:bg-red-50 disabled:text-slate-300 disabled:cursor-not-allowed'
                              : 'text-slate-400 cursor-not-allowed bg-slate-50'
                          }`}
                        >
                          Remove Photo
                        </button>
                      </div>
                    )}

                    {pictureMenuOpen && (
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setPictureMenuOpen(false)}
                      />
                    )}
                  </div>

                  {profilePicturePreview && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={uploadingPicture}
                        onClick={() => {
                          if (selectedFile) {
                            handleUploadPicture(selectedFile);
                          }
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {uploadingPicture ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Picture
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={uploadingPicture}
                        onClick={() => {
                          setProfilePicturePreview(null);
                          setSelectedFile(null);
                          setPictureInputKey(prev => prev + 1);
                        }}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 text-center">Max 5MB • PNG, JPG, JPEG, GIF, WEBP</p>
                </div>
              </div>
                
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">First Name</label>
                  <input 
                    type="text"
                    required
                    id="first_name"
                    disabled={!isEditing}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${isEditing ? 'border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50' : 'border-slate-100 bg-slate-100 text-slate-500 cursor-not-allowed'}`}
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">Middle Name</label>
                  <input 
                    type="text"
                    id="middle_name"
                    disabled={!isEditing}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${isEditing ? 'border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50' : 'border-slate-100 bg-slate-100 text-slate-500 cursor-not-allowed'}`}
                    value={formData.middle_name}
                    onChange={(e) => handleInputChange("middle_name", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600">Last Name</label>
                  <input 
                    type="text"
                    required
                    id="last_name"
                    disabled={!isEditing}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${isEditing ? 'border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50' : 'border-slate-100 bg-slate-100 text-slate-500 cursor-not-allowed'}`}
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600 flex items-center justify-between">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
                    {isEditing && !emailVerified && formData.email && (
                        <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                            Unverified
                        </span>
                    )}
                    {emailVerified && formData.email && (
                         <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                    )}
                  </label>
                  <div className="relative flex gap-2">
                    <input
                      type="email"
                      required
                      id="email"
                      disabled={!isEditing}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${isEditing ? 'border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50' : 'border-slate-100 bg-slate-100 text-slate-500 cursor-not-allowed'}`}
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                    {isEditing && !emailVerified && formData.email && (
                         <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={otpLoading}
                            className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap"
                         >
                            {otpLoading ? "Sending..." : "Verify"}
                         </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Contact No.
                  </label>
                  <input 
                      type="text"
                      id="contact_no"
                      disabled={!isEditing}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${isEditing ? 'border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50' : 'border-slate-100 bg-slate-100 text-slate-500 cursor-not-allowed'}`}
                      value={formData.contact_no}
                      onChange={(e) => handleInputChange("contact_no", e.target.value)}
                      placeholder="09XX XXX XXXX"
                  />
                </div>

              </div>
            </form>
          )}

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
                    <p className="text-xs text-amber-700 mt-1">To change your password, you must verify your identity by entering your current password.</p>
                  </div>
                </div>
              </div>
                
              <div className="space-y-4 max-w-md">
                
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                         <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                            {usingOtpForPassword ? <Mail className="w-3 h-3"/> : <Key className="w-3 h-3" />}
                            {usingOtpForPassword ? "Email Verification Code" : "Current Password"}
                        </label>
                        {!usingOtpForPassword && (
                            <button 
                                type="button"
                                onClick={handleStartPasswordReset}
                                disabled={resetOtpLoading}
                                className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                            >
                                {resetOtpLoading ? "Sending Code..." : "Forgot Password?"}
                            </button>
                        )}
                        {usingOtpForPassword && (
                             <button 
                                type="button"
                                onClick={handleCancelPasswordReset}
                                className="text-xs text-slate-500 font-medium hover:text-slate-700 transition-colors"
                            >
                                Use Password Instead
                            </button>
                        )}
                    </div>

                    {!usingOtpForPassword ? (
                        <div className="relative animate-in fade-in zoom-in-95 duration-200">
                            <input 
                                type={showOldPassword ? "text" : "password"}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 pr-12"
                                value={formData.old_password}
                                onChange={(e) => handleInputChange("old_password", e.target.value)}
                                placeholder="Required to set new password"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    ) : (
                        <div className="relative animate-in fade-in zoom-in-95 duration-200">
                             <input 
                                type="text"
                                maxLength={6}
                                className="w-full border-2 border-indigo-100 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 outline-none transition-all bg-indigo-50/30 text-center font-mono tracking-widest font-bold text-indigo-700 placeholder-indigo-300"
                                value={passwordResetOtp}
                                onChange={(e) => setPasswordResetOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="000000"
                            />
                            <button
                                type="button"
                                onClick={handleStartPasswordReset}
                                disabled={resetOtpLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-400 hover:text-indigo-600 bg-white rounded-lg shadow-sm border border-indigo-100 hover:border-indigo-300 transition-all"
                                title="Resend Code"
                            >
                                <RefreshCw className={`w-4 h-4 ${resetOtpLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    <Key className="w-3 h-3" /> New Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 pr-12"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Leave blank to keep current"
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
              </div>

              <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
                <button 
                  type="submit"
                  disabled={saving || !formData.password}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {usingOtpForPassword ? "Reset & Update Password" : "Update Password"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "account" && (
            <div className="space-y-6">
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
                    <p className="text-sm font-medium text-slate-800">{profile.position_id || "N/A"}</p>
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

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelConfirm(false)} />
            
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100">
                  <AlertCircle size={24} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Discard Changes?</h3>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-gray-600 text-base leading-relaxed">
                You have unsaved changes. Are you sure you want to cancel? All changes will be lost.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              >
                Keep Editing
              </button>
              <button
                onClick={confirmCancel}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {otpModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOtpModalOpen(false)} />
             <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Enter Verification Code</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        We sent a 6-digit code to <strong>{formData.email}</strong>. 
                        <br/>
                    </p>
                    
                    <input 
                        type="text" 
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full text-center text-2xl tracking-widest font-bold border-2 border-slate-200 rounded-xl py-3 mb-6 focus:border-indigo-600 focus:ring-0 outline-none transition-colors"
                        placeholder="000000"
                        autoFocus
                    />
                    
                    <div className="flex gap-3">
                         <button
                            onClick={() => setOtpModalOpen(false)}
                            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleVerifyOtp}
                            disabled={otpLoading || otpCode.length !== 6}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {otpLoading ? "Verifying..." : "Verify"}
                        </button>
                    </div>
                </div>
             </div>
        </div>
      )}

      {deletePictureConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeletePictureConfirm(false)} />
            
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Remove Profile Picture?</h3>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-gray-600 text-base leading-relaxed">
                Are you sure you want to remove your profile picture? This action cannot be undone.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletePictureConfirm(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeletePicture();
                  setDeletePictureConfirm(false);
                }}
                disabled={uploadingPicture}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {uploadingPicture ? 'Removing...' : 'Remove Picture'}
              </button>
            </div>
          </div>
        </div>
      )}

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