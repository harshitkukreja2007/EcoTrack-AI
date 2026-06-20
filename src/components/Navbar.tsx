"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEco } from "@/context/EcoContext";
import { Leaf, Flame, ShieldCheck, RefreshCw, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const pathname = usePathname();
  const { profile, resetAllData, user } = useEco();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDashboard = pathname?.startsWith("/dashboard");
  const nextLvlXp = profile.level * 100;
  const xpPercentage = Math.round((profile.xp / nextLvlXp) * 100);

  const [xpPulse, setXpPulse] = useState(false);
  const [streakPulse, setStreakPulse] = useState(false);
  const [prevXp, setPrevXp] = useState(profile.xp);
  const [prevStreak, setPrevStreak] = useState(profile.streak);

  useEffect(() => {
    if (profile.xp > prevXp) {
      setXpPulse(true);
      const timer = setTimeout(() => setXpPulse(false), 500);
      setPrevXp(profile.xp);
      return () => clearTimeout(timer);
    } else if (profile.xp < prevXp) {
      setPrevXp(profile.xp);
    }
  }, [profile.xp, prevXp]);

  useEffect(() => {
    if (profile.streak > prevStreak) {
      const isMilestone = [3, 7, 14, 30, 50, 100].includes(profile.streak);
      if (isMilestone) {
        setStreakPulse(true);
        const timer = setTimeout(() => setStreakPulse(false), 900);
        setPrevStreak(profile.streak);
        return () => clearTimeout(timer);
      }
      setPrevStreak(profile.streak);
    } else if (profile.streak < prevStreak) {
      setPrevStreak(profile.streak);
    }
  }, [profile.streak, prevStreak]);

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all your progress, profile level, streaks, and calculator records? This cannot be undone.")) {
      resetAllData();
      window.location.href = "/";
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-eco-green/10 bg-eco-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-eco-green/10 border border-eco-green/20">
              <Leaf className="h-5 w-5 text-eco-green" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white">
                EcoTrack <span className="text-eco-green">AI</span>
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest -mt-1 font-mono">
                Carbon Tracker & Goals
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-24 bg-gray-800/40 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-eco-green/10 bg-eco-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-eco-green/10 border border-eco-green/20 group-hover:border-eco-green/45 transition-all duration-300">
              <Leaf className="h-5 w-5 text-eco-green group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-eco-green transition-colors duration-300">
                EcoTrack <span className="text-eco-green">AI</span>
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest -mt-1 font-mono">
                Carbon Tracker & Goals
              </span>
            </div>
          </Link>
        </div>

        {/* Dynamic Center/Right Section */}
        <div className="flex items-center gap-4 sm:gap-6">
          {isDashboard && user ? (
            <>
              {/* Streak */}
              <div className={`flex items-center gap-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-sm font-medium text-orange-400 transition-all duration-300 ${
                streakPulse ? "animate-streak-glow border-orange-500/50 scale-105" : ""
              }`}>
                <Flame className={`h-4 w-4 fill-orange-500 text-orange-500 ${streakPulse ? "animate-bounce" : "animate-pulse"}`} />
                <span>{profile.streak} Day{profile.streak !== 1 && "s"}</span>
              </div>

              {/* Total Saved */}
              <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-eco-green/10 border border-eco-green/20 px-3 py-1 text-sm font-medium text-eco-green-light">
                <Leaf className="h-4 w-4" />
                <span>Saved: {profile.totalCo2Saved.toLocaleString()} kg</span>
              </div>

              {/* Level Progress */}
              <div className={`flex flex-col items-end gap-1 transition-all duration-300 ${
                xpPulse ? "scale-105" : ""
              }`}>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <span className="font-bold text-white mr-1.5 hidden md:inline">{profile.username}</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-eco-cyan" />
                  <span className="font-semibold text-white">Lvl {profile.level}</span>
                  <span className={`text-gray-400 hidden sm:inline transition-all ${
                    xpPulse ? "text-eco-green-light font-bold animate-pulse-scale" : ""
                  }`}>({profile.xp}/{nextLvlXp} XP)</span>
                </div>
                <div className="h-1.5 w-24 sm:w-32 overflow-hidden rounded-full bg-[#0a1114] border border-gray-800/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-eco-green to-eco-cyan transition-all duration-500"
                    style={{ width: `${xpPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Reset Data icon */}
              <button
                onClick={handleReset}
                title="Reset All Data"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:border-red-500/40 transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-800 bg-[#0d1321]/30 text-gray-400 hover:text-white hover:bg-[#0d1321]/80 hover:border-gray-700 transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : !isDashboard ? (
            <>
              <Link
                href="/dashboard"
                className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan p-0.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-eco-green hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300"
              >
                <span className="relative rounded-[10px] bg-[#0d1321] px-5 py-2 transition-all duration-200 group-hover:bg-opacity-0">
                  Launch App
                </span>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
