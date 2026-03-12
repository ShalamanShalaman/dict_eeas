import React from "react";
import { LogOut, AlertCircle } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger", // 'danger' or 'primary'
  user = null, // Optional user object for personalization
}) {
  if (!isOpen) return null;

  // Handle ESC key
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter" && confirmVariant === "danger") {
      onConfirm();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose, onConfirm, confirmVariant]);

  return (
    // Backdrop overlay
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      {/* Semi-transparent backdrop with pulse animation */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Dialog box */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in slide-in-from-bottom-4 fade-in zoom-in-95 duration-300">
        {/* Decorative gradient top border */}
        <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-600 to-red-500" />
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${confirmVariant === 'danger' ? 'bg-red-100' : 'bg-blue-100'} animate-in pulse`}>
              {confirmVariant === 'danger' ? (
                <LogOut 
                  size={28} 
                  className="text-red-600" 
                />
              ) : (
                <AlertCircle 
                  size={28} 
                  className="text-blue-600" 
                />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              {user && (
                <p className="text-sm text-gray-500 mt-0.5">
                  Signing out {user.first_name} {user.last_name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-gray-600 text-base leading-relaxed">
            {message}
          </p>
          {confirmVariant === 'danger' && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>You'll need to sign in again to access your account.</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                       rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200
                       flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2
                       ${confirmVariant === 'danger' 
                         ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow' 
                         : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
          >
            {confirmVariant === 'danger' && <LogOut size={16} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
