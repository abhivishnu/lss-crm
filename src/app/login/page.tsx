"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-gold/20 rounded-2xl mb-4">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              className="text-brand-gold"
            >
              <path
                d="M18 2L32 10V26L18 34L4 26V10L18 2Z"
                fill="#8A8A8A"
                opacity="0.3"
              />
              <path
                d="M18 2L32 10V26L18 34L4 26V10L18 2Z"
                stroke="#8A8A8A"
                strokeWidth="1"
                fill="none"
              />
              <rect x="8" y="22" width="8" height="4" rx="0.5" fill="#E8A838" />
              <rect
                x="12"
                y="18"
                width="8"
                height="4"
                rx="0.5"
                fill="#E8A838"
              />
              <rect
                x="16"
                y="14"
                width="8"
                height="4"
                rx="0.5"
                fill="#E8A838"
              />
              <rect
                x="20"
                y="10"
                width="8"
                height="4"
                rx="0.5"
                fill="#F0C060"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-brand-gold tracking-tight">
            Lone Star Scholars
          </h1>
          <p className="text-brand-gold/60 mt-1 text-sm font-medium tracking-widest uppercase">
            College Prep CRM
          </p>
        </div>

        {/* Login Card */}
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Sign in to manage your pipeline
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="abhi@lonestarscholars.com"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Default: abhi@lonestarscholars.com / admin123
          </p>
        </form>
      </div>
    </div>
  );
}
