"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Login failed");
        return;
      }

      // 🔐 check SUPER_ADMIN
      if (data.user.role !== "SUPER_ADMIN") {
        setError("Access denied. Admin only.");
        return;
      }

      // 💾 store token
      localStorage.setItem("token", data.token);

      // 🚀 redirect to admin dashboard
      router.push("/admin/dashboard");
    } catch (err) {
      setError("Something went wrong");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-white text-2xl font-bold">TiBizPro Admin</h1>
          <p className="text-slate-400 text-sm mt-1">
            Sign in to manage subscriptions & users
          </p>
        </div>

        {/* Email */}
        <label className="text-slate-300 text-sm">Email</label>
        <input
          type="email"
          className="w-full mt-2 mb-4 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="admin@tibizpro.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <label className="text-slate-300 text-sm">Password</label>
        <input
          type="password"
          className="w-full mt-2 mb-4 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Error */}
        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-5">
          Secure admin access only
        </p>
      </div>
    </div>
  );
}
