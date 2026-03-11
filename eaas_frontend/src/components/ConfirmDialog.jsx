import React from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger", // 'danger' or 'primary'
}) {
  if (!isOpen) return null;

  return (
    // Backdrop overlay
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      {/* Semi-transparent backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog box */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${confirmVariant === 'danger' ? 'bg-red-100' : 'bg-blue-100'}`}>
              <AlertTriangle 
                size={24} 
                className={confirmVariant === 'danger' ? 'text-red-600' : 'text-blue-600'} 
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-gray-600 text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                       rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-offset-2
                       ${confirmVariant === 'danger' 
                         ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                         : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}