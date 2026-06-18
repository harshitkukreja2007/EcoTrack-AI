"use client";

import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Leaf, Mail, Lock, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";

export default function AuthView() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all input fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const authError = err as { code?: string; message?: string };
      console.error(authError);
      if (authError.code === "auth/email-already-in-use") {
        setError("This email address is already registered.");
      } else if (authError.code === "auth/invalid-credential") {
        setError("Invalid email address or password credentials.");
      } else if (authError.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(authError.message || "An authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      const authError = err as { code?: string; message?: string };
      console.error(authError);
      if (authError.code !== "auth/popup-closed-by-user") {
        setError(authError.message || "Failed to authenticate with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border-eco-cyan/20 relative overflow-hidden flex flex-col justify-between">
        
        {/* Top visual glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-eco-green via-eco-cyan to-eco-green"></div>
        <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-eco-cyan/10 blur-xl"></div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-eco-green/10 border border-eco-green/20 mb-3">
            <Leaf className="h-6 w-6 text-eco-green animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Access <span className="text-eco-green">EcoTrack AI</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Authenticate to sync your footprint metrics & daily streaks.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-[#0d1321]/40 border border-gray-800/80 rounded-xl p-1 mb-2">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                !isSignUp 
                  ? "bg-eco-green/10 text-eco-green-light border border-eco-green/20" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                isSignUp 
                  ? "bg-eco-green/10 text-eco-green-light border border-eco-green/20" 
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Register
            </button>
          </div>

          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@eco-grid.net"
                className="w-full bg-[#0d1321]/50 border border-gray-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-eco-cyan focus:ring-1 focus:ring-eco-cyan transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 block">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0d1321]/50 border border-gray-800/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-eco-cyan focus:ring-1 focus:ring-eco-cyan transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-2 text-xs text-red-400 animate-pulse">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] text-white text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isSignUp ? "Create Secure Account" : "Access Eco Workspace"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800/60"></div>
          </div>
          <span className="relative bg-eco-dark/60 backdrop-blur px-3 text-[10px] uppercase tracking-widest text-gray-500 font-mono">
            Social Authentication
          </span>
        </div>

        {/* Google SSO button */}
        <button
          onClick={handleGoogleAuth}
          type="button"
          disabled={loading}
          className="w-full py-3 rounded-xl border border-gray-800 bg-[#0d1321]/30 hover:bg-[#0d1321]/80 hover:border-gray-700 text-sm font-semibold text-gray-300 transition-all duration-300 flex items-center justify-center gap-2.5"
        >
          {/* Custom Google Color Icon */}
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.94 1 12 1 7.24 1 3.2 3.73 1.25 7.71l3.77 2.92C5.9 7.71 8.7 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.11 2.73-2.36 3.58l3.66 2.84c2.14-1.98 3.39-4.89 3.39-8.57z"
            />
            <path
              fill="#FBBC05"
              d="M5.02 10.63c-.24-.72-.38-1.5-.38-2.31 0-.81.14-1.59.38-2.31L1.25 3.09C.45 4.7.01 6.51.01 8.41c0 1.9.44 3.71 1.24 5.32l3.77-3.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.01.68-2.3 1.09-4.3 1.09-3.3 0-6.1-2.67-7.1-5.59L1.13 15.8C3.08 19.88 7.12 22.6 12 22.6z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

      </div>
    </div>
  );
}
