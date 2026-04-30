import React, { useState } from "react";

export default function LoginForm({ onLogin }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, password })
      });

      const result = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(result.user));
        onLogin(result.user);
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-start font-sans">
      <div className="absolute inset-0">
        <img src="/images/Login Page.png" alt="Background" className="w-full h-full object-cover" />
      </div>

      <div className="absolute inset-0 bg-black/30 z-0"></div>

      {/* Main scrollable area that safely handles overflow if the card slides out on a small screen */}
      <div className="relative z-10 w-full h-full overflow-x-auto overflow-y-hidden">
        <div className="min-w-max min-h-full flex items-center px-4 lg:px-32 py-8">
          
          {/* Relative wrapper keeps both cards anchored to the same spot */}
          <div className="relative flex items-stretch w-full max-w-md sm:w-[28rem]">
            
            {/* Main Login Card (Foreground) */}
            <div className="w-full min-h-[32rem] bg-black/40 border border-white/20 shadow-2xl rounded-2xl p-10 sm:p-12 flex flex-col items-center justify-center backdrop-blur-md relative z-10">
              <div className="mb-6 flex items-center gap-3 p-4 rounded-xl w-full justify-center">
                <img src="/images/logo.gif" alt="Logo" className="w-20 h-20 object-contain" />
                <div>
                  <h2 className="text-3xl font-bold text-white leading-tight text-center">DICT-EAAS</h2>
                  <p className="text-sm text-white font-bold text-center">Employee Attendance and Accomplishment System</p>
                </div>
              </div>

              {error && (
                <div className={`mb-4 text-center font-bold py-2 px-4 rounded w-full text-sm ${
                  error.toLowerCase().includes('invalid credentials') 
                    ? 'bg-red-500/20 border border-red-500 text-red-200 animate-pulse' 
                    : 'bg-white/90 text-red-600'
                }`}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 w-full">
                <div className="relative">
                  <label className="block text-sm font-bold text-white mb-1">User ID</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white/90 border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition duration-200 text-sm font-medium text-gray-900"
                      placeholder="Enter your User ID"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-white mb-1">Password</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-2.5 bg-white/90 border border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition duration-200 text-sm font-medium text-gray-900"
                      placeholder="Enter your password"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943-9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold shadow-lg">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </>
                  ) : "Login"}
                </button>
              </form>

              <div className="w-full mt-6 border-t border-white/20 pt-4 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setShowAbout(!showAbout)}
                  className="text-xs font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {showAbout ? "Hide About EAAS" : "What is EAAS?"}
                  <svg 
                    className={`w-3.5 h-3.5 transition-transform duration-500 ${showAbout ? '-rotate-90' : 'rotate-90'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* About Card (Background, smoothly slides out from behind) */}
            <div 
              className={`absolute top-0 left-0 w-full h-full bg-black/40 border border-white/20 shadow-2xl rounded-2xl p-10 flex flex-col justify-center backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-0 ${
                showAbout 
                  ? 'translate-x-[calc(100%+1.5rem)] opacity-100 pointer-events-auto' 
                  : 'translate-x-0 opacity-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-bold text-white">About EAAS</h3>
              </div>
              
              <div className="space-y-4 text-gray-200 text-sm leading-relaxed text-justify overflow-y-auto pr-2 custom-scrollbar">
                <p>
                  The <strong className="text-white">Employee Attendance and Accomplishment System (EAAS)</strong> is a website developed specifically to meet the needs of the Department of Information and Communications Technology (DICT). It was developed by interns from the University of La Salette, Santiago City.
                </p>
                <p>
                  EAAS aims to simplify the creation of Daily Time Records (DTR), Accomplishment Reports (AR), and other related documents by automating template filling and providing a centralized system for submitting and reviewing files.
                </p>
              </div>
              
              <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span>© {new Date().getFullYear()} DICT. All rights reserved.</span>
                <span>University of La Salette Interns</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        html, body, #__next {
          width: 100%;
          height: 100%;
          overflow: hidden;
          margin: 0;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}