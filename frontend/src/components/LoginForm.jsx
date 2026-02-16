import React, { useState } from "react";

export default function LoginForm({ onLogin }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/login", {
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
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center font-sans">
      <div className="absolute inset-0 flex">
        <div className="flex-shrink-0 w-full h-full animate-marquee">
          <img src="/images/dict_banner.png" alt="Moving Banner" className="w-full h-full object-cover" />
        </div>
        <div className="flex-shrink-0 w-full h-full animate-marquee">
          <img src="/images/dict_banner.png" alt="Moving Banner" className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="absolute inset-0 bg-black/30 z-0"></div>
      <div className="relative z-10 w-full max-w-sm mx-4 bg-black/40 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-8 flex flex-col items-center justify-center">
        <div className="mb-6 flex items-center gap-3 bg-white p-4 rounded-xl shadow-md w-full justify-center">
          <img src="/images/loginlogo.gif" alt="Logo" className="w-14 h-14 object-contain" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight text-center">DICT-EAAS</h2>
            <p className="text-xs text-gray-800 font-bold text-center">Employee Attendance and Accomplishment System</p>
          </div>
        </div>

        {error && <p className="text-red-600 mb-4 text-center font-bold bg-white/90 py-2 rounded w-full">{error}</p>}

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
