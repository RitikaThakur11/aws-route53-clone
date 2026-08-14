"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Shield, Key, Loader2, Info, Lock } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Missing credentials", "Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      success("Authenticated", "Signed in to AWS Route 53 Management Console.");
    } catch (err: any) {
      error("Sign-in failed", err.message || "Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f3f3] flex flex-col justify-between">
      {/* AWS Simple Header */}
      <header className="w-full bg-[#232f3e] h-12 flex items-center px-6 text-white border-b border-[#161e2e]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 bg-[#ec7211] rounded text-white font-black text-xs tracking-tighter">
            AWS
          </div>
          <span className="font-bold text-sm tracking-tight">Amazon Web Services</span>
        </div>
      </header>

      {/* Main Sign-In Card Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md border border-[#eaeded] p-8 space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-bold text-[#16191f] tracking-tight">
              Sign in
            </h1>
            <p className="text-xs text-[#545b64]">
              AWS Route 53 Management Console
            </p>
          </div>

          {/* Mock IAM Notice */}
          <div className="p-3 bg-[#f1faff] border border-[#0972d3]/30 rounded text-xs text-[#16191f] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#0972d3]">
              <Info className="w-4 h-4 shrink-0" />
              <span>Mock Authentication Ready</span>
            </div>
            <p className="text-[11px] text-[#545b64]">
              Use the credentials below to sign in:
            </p>
            <div className="bg-white p-2 rounded border border-[#eaeded] font-mono text-[11px] space-y-0.5">
              <p>Email: <strong className="text-[#16191f]">admin@example.com</strong></p>
              <p>Password: <strong className="text-[#16191f]">password123</strong></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Root / IAM user */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#16191f]">
                Root user email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#16191f]">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-[#ec7211] hover:bg-[#eb5f07] rounded transition-colors shadow-xs disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#eaeded] text-center text-[11px] text-[#545b64]">
            <p className="flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-[#037f0c]" />
              Secured with Route 53 JWT Session Authentication
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[#545b64] border-t border-[#eaeded] bg-white">
        © 2026, Amazon Web Services, Inc. or its affiliates. (Route 53 Clone)
      </footer>
    </div>
  );
}
