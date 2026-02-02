import { useState } from "react";

export default function LoginForm({ onLogin }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, password })
      });

      const result = await res.json();

      if (res.ok) {
        onLogin(result.user); // pass user info up to parent
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="flex max-w-6xl h-150 mx-auto bg-white rounded-xl shadow-md">
        <div className="w-1/2 relative rounded-l-xl overflow-hidden">
            <img 
            src="/images/dict_banner.jpg" 
            alt="Banner" 
            className="w-full h-full object-cover"
            />
        </div>
        <div className="w-80 mx-auto mb-4">
        <img src="../public/images/loginlogo.gif"></img>
        <h2 className="text-2xl font-bold mb-6 text-center">LOGIN</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block text-sm font-medium">User ID</label>
            <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                required
            />
            </div>
            <div>
            <label className="block text-sm font-medium">Password</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                required
            />
            </div>
            <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
            Login
            </button>
        </form>
        </div>
    </div>
  );
}
