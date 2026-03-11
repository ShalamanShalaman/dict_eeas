import React, { useEffect, useState } from 'react';

const Checkmark = ({ className = '', isAnimating = false }) => (
  <svg viewBox="0 0 52 52" className={className}>
    <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(16,185,129,0.12)" strokeWidth="6" />
    <path
      d="M14 27l6 6 18-18"
      fill="none"
      stroke="#10B981"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="checkmark-path"
      style={{
        strokeDasharray: 56,
        strokeDashoffset: isAnimating ? 0 : 56,
        transition: 'stroke-dashoffset 420ms cubic-bezier(.2,.9,.2,1) 100ms, transform 420ms ease'
      }}
    />
  </svg>
);

export default function SuccessModal({ isOpen, message, subMessage, onClose, autoClose = true, autoCloseDelay = 5000 }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) setIsAnimating(true);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && autoClose) {
      const t = setTimeout(() => handleClose(), autoCloseDelay);
      return () => clearTimeout(t);
    }
  }, [isOpen, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose && onClose(), 300);
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isAnimating ? 'opacity-100' : 'opacity-0'} transition-opacity`}> 
      <div className="absolute inset-0 bg-black/12 backdrop-blur-sm" onClick={handleClose} />

      <div className={`relative bg-white/95 border border-transparent/20 rounded-2xl shadow-[0_8px_30px_rgba(2,6,23,0.08)] p-4 max-w-xs w-full mx-4 transform transition-all ${isAnimating ? 'scale-100 opacity-100' : 'scale-98 opacity-0'}`}>
        <div className="flex flex-col items-center gap-1">
          <div className={`w-16 h-16 flex items-center justify-center rounded-full bg-white border border-slate-100 ${isAnimating ? 'scale-100 animate-pop' : 'scale-96'} transition-transform`}> 
            <Checkmark className="w-9 h-9" isAnimating={isAnimating} />
          </div>

          <h3 className={`text-sm font-normal text-slate-900 mt-1 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'} transition-all`}>{message}</h3>

          {subMessage && (
            <p className={`text-xs font-normal text-slate-500 mt-0.5 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'} transition-all`}>{subMessage}</p>
          )}
        </div>

        <style>{`
          @keyframes pop {
            0% { transform: scale(0.85); }
            60% { transform: scale(1.08); }
            100% { transform: scale(1); }
          }
          .animate-pop { animation: pop 360ms cubic-bezier(.2,.9,.2,1); }
        `}</style>
      </div>
    </div>
  );
}