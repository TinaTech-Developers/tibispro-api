"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    if (!token) {
      setMessage("Invalid reset token.");
      return;
    }

    if (!password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Unable to reset password.");
        return;
      }

      setMessage("Password reset successfully.");

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 m">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-900">Reset Password</h2>

          <p className="text-sm text-slate-500 mt-2">
            Enter your new password below
          </p>
        </div>

        {/* New Password */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            New Password
          </label>

          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full
              px-4
              py-3
              rounded-xl
              border
              border-slate-300
              outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:border-blue-500
              transition
              text-slate-900
            "
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="
              w-full
              px-4
              py-3
              rounded-xl
              border
              border-slate-300
              outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:border-blue-500
              transition
              text-slate-900
            "
          />
        </div>

        {/* Button */}
        <button
          onClick={handleReset}
          disabled={loading}
          className="
            w-full
            py-3
            rounded-xl
            bg-blue-600
            hover:bg-blue-700
            disabled:bg-blue-400
            text-white
            font-semibold
            transition
            shadow-lg
            shadow-blue-600/30
          "
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {/* Message */}
        {message && (
          <div
            className={`
              mt-6
              text-center
              text-sm
              font-medium
              ${message.includes("success") ? "text-green-600" : "text-red-600"}
            `}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
