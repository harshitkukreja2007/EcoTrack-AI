"use client";

import React, { useState, useEffect } from "react";
import { useEco } from "@/context/EcoContext";
import { 
  Edit2, 
  Check, 
  Award,
  Leaf,
  Flame,
  Globe
} from "lucide-react";

const AVATAR_OPTIONS = [
  { id: "avatar-1", emoji: "🌱", label: "Eco Ranger" },
  { id: "avatar-2", emoji: "☀️", label: "Solar Wizard" },
  { id: "avatar-3", emoji: "💧", label: "Hydro Captain" },
  { id: "avatar-4", emoji: "🍃", label: "Carbon Ninja" },
  { id: "avatar-5", emoji: "🌍", label: "Planet Guardian" },
  { id: "avatar-6", emoji: "🔋", label: "Grid Architect" },
];

export default function UserProfileView() {
  const { profile, updateProfile, badges, carbonBreakdown, user } = useEco();
  const [usernameInput, setUsernameInput] = useState(profile.username);
  const [isEditing, setIsEditing] = useState(false);
  const [saveNotify, setSaveNotify] = useState(false);

  useEffect(() => {
    setUsernameInput(profile.username);
  }, [profile.username]);

  // Determine Level Rank Title
  const getRankTitle = (lvl: number) => {
    if (lvl <= 1) return "Green Cadet";
    if (lvl === 2) return "Eco Officer";
    if (lvl === 3) return "Carbon Eliminator";
    if (lvl === 4) return "Climate Sentinel";
    return "Earth Guardian";
  };

  const handleSaveProfile = () => {
    updateProfile(usernameInput, profile.avatar);
    setIsEditing(false);
    setSaveNotify(true);
    setTimeout(() => setSaveNotify(false), 2500);
  };

  const handleSelectAvatar = (avatarId: string) => {
    updateProfile(profile.username, avatarId);
  };

  const currentAvatarOption = AVATAR_OPTIONS.find((a) => a.id === profile.avatar) || AVATAR_OPTIONS[0];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Profile Editing & Customization (2/3 width) */}
      <div className="xl:col-span-2 flex flex-col gap-6">
        
        {/* Profile Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-eco-cyan/5 blur-3xl"></div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-gray-800/80">
            {/* Avatar representation */}
            <div className="h-24 w-24 rounded-3xl bg-[#0d1321] border border-eco-cyan/30 flex items-center justify-center text-5xl shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative">
              <span>{currentAvatarOption.emoji}</span>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-eco-cyan flex items-center justify-center text-[10px] text-eco-bg font-bold border border-eco-bg">
                {profile.level}
              </div>
            </div>

            {/* Profile detail settings */}
            <div className="flex-1 w-full text-center sm:text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                {isEditing ? (
                  <div className="flex gap-2 w-full max-w-sm">
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      maxLength={18}
                      className="bg-eco-dark/80 border border-eco-cyan/40 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-eco-cyan focus:ring-1 focus:ring-eco-cyan flex-1"
                    />
                    <button
                      onClick={handleSaveProfile}
                      className="p-2 bg-eco-cyan/20 border border-eco-cyan/40 hover:bg-eco-cyan/35 rounded-xl text-eco-cyan-light transition-all"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h3 className="text-2xl font-bold text-white tracking-tight">{profile.username}</h3>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 hover:bg-white/5 rounded-lg text-gray-500 hover:text-gray-300 transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs text-eco-cyan bg-eco-cyan/15 rounded-full px-3 py-1 border border-eco-cyan/25">
                  Rank: {getRankTitle(profile.level)}
                </span>
                <span className="text-xs text-gray-400">
                  {user ? `Member: ${user.email}` : "Saved locally on this device"}
                </span>
              </div>
            </div>
          </div>

          {/* Select Avatar Selection */}
          <div className="space-y-4">
            <span className="text-sm font-semibold text-gray-300 block">Select Avatar Persona</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectAvatar(opt.id)}
                  className={`glass-panel rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border transition-all duration-300 ${
                    profile.avatar === opt.id
                      ? "bg-eco-cyan/15 border-eco-cyan text-eco-cyan-light shadow-[0_0_15px_rgba(6,182,212,0.12)]"
                      : "border-transparent hover:border-gray-800 hover:bg-white/5"
                  }`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="text-[9px] font-bold text-center leading-tight whitespace-nowrap">{opt.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
          
          {saveNotify && (
            <div className="bg-eco-cyan/10 border border-eco-cyan/25 text-eco-cyan-light rounded-xl px-4 py-2.5 text-xs text-center font-semibold animate-pulse">
              Profile settings updated successfully.
            </div>
          )}
        </div>

      </div>

      {/* Operator Stats Sidebar (1/3 width) */}
      <div className="flex flex-col gap-6">
        
        {/* Cumulative Stats Summary */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border-eco-cyan/25 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-eco-cyan/5 blur-xl"></div>
          
          <h4 className="text-sm font-semibold text-gray-400">
            My Stats Summary
          </h4>

          <div className="space-y-4">
            {/* Stat 1: Total carbon saved */}
            <div className="flex items-center gap-4 bg-[#0d1321]/30 border border-gray-800/60 rounded-2xl p-4">
              <div className="h-10 w-10 rounded-xl bg-eco-green/10 flex items-center justify-center text-eco-green shrink-0">
                <Leaf className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">CO2 Saved</span>
                <span className="text-lg font-bold text-white">{profile.totalCo2Saved.toLocaleString()} kg</span>
              </div>
            </div>

            {/* Stat 2: Active streak */}
            <div className="flex items-center gap-4 bg-[#0d1321]/30 border border-gray-800/60 rounded-2xl p-4">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
                <Flame className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">Habits Streak</span>
                <span className="text-lg font-bold text-white">{profile.streak} Days</span>
              </div>
            </div>

            {/* Stat 3: Current footprint */}
            <div className="flex items-center gap-4 bg-[#0d1321]/30 border border-gray-800/60 rounded-2xl p-4">
              <div className="h-10 w-10 rounded-xl bg-eco-cyan/10 flex items-center justify-center text-eco-cyan shrink-0">
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">Current Footprint</span>
                <span className="text-lg font-bold text-white">{carbonBreakdown.total} t/yr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Badge Showcase cabinet */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-eco-cyan" />
            <h4 className="text-sm font-semibold text-gray-400">
              My Badges
            </h4>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {badges.filter((b) => b.unlocked).length > 0 ? (
              badges
                .filter((b) => b.unlocked)
                .map((badge) => (
                  <div
                    key={badge.id}
                    title={`${badge.name}: ${badge.description}`}
                    className="h-12 w-12 rounded-xl bg-eco-green/10 border border-eco-green/20 flex items-center justify-center text-2xl hover:scale-105 transition-transform duration-200 cursor-help"
                  >
                    {badge.icon}
                  </div>
                ))
            ) : (
              <span className="text-xs text-gray-500 font-medium">Unlock badges by adopting green habits or completing challenges.</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
