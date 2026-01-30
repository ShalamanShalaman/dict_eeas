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
    <div className="flex max-w-4xl h-100 mx-auto mt-24 bg-white rounded-xl shadow-md">
        <div className="w-1/2 bg-blue-600 flex items-center justify-center text-white text-3xl font-bold rounded-l-xl">
        AMONG US
        </div>
        <div className="w-1/2 p-8">
        <img src="../public/images/dict-logo.png"></img>
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
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
