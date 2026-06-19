"use client";

import React from "react";
import { useEco } from "@/context/EcoContext";
import { 
  Trophy, 
  CheckCircle2, 
  Zap,
  CheckCircle,
  Info
} from "lucide-react";

export default function EcoChallenges() {
  const { habits, toggleHabit, challenges, acceptChallenge, completeChallenge, challengesWeekStart, challengesWeekEnd } = useEco();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getDaysRemaining = (endDateStr: string | null) => {
    if (!endDateStr) return 7;
    const end = new Date(endDateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const totalCount = challenges.length;
  const completedCount = challenges.filter(c => c.status === "completed").length;
  const activeCount = challenges.filter(c => c.status === "active").length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const daysRemaining = getDaysRemaining(challengesWeekEnd);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Daily Habits Checklist (2/3 width) */}
      <div className="xl:col-span-2 flex flex-col gap-6">
        
        {/* Habits Checklist Panel */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-eco-green" />
              <h3 className="text-lg font-bold text-white">Daily Eco Habits</h3>
            </div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              Resets Daily
            </span>
          </div>

          <div className="space-y-3">
            {habits.map((habit) => (
              <div 
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`glass-panel rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all duration-300 flex items-center justify-between gap-4 select-none ${
                  habit.completed
                    ? "bg-eco-green/10 border-eco-green text-eco-green-light"
                    : "border-gray-800/80 text-gray-400 hover:border-gray-700/80 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-6 w-6 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0 ${
                    habit.completed
                      ? "border-eco-green bg-eco-green text-eco-bg"
                      : "border-gray-600"
                  }`}>
                    {habit.completed && <CheckCircle2 className="h-4 w-4" />}
                  </div>

                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold transition-all ${habit.completed ? "text-white line-through opacity-85" : "text-gray-200"}`}>
                      {habit.name}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5 uppercase tracking-wide">
                      Category: {habit.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono font-bold bg-eco-cyan/10 border border-eco-cyan/20 text-eco-cyan-light px-2.5 py-0.5 rounded-full">
                    +{habit.xpReward} XP
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-eco-green/15 border border-eco-green/25 text-eco-green-light px-2.5 py-0.5 rounded-full hidden sm:inline">
                    -{habit.co2Saved} kg CO2
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-800/40 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-gray-400 leading-normal">
            <Info className="h-4 w-4 text-eco-cyan shrink-0 mt-0.5" />
            <span>
              Checking off daily habits records immediate carbon savings directly to your cumulative stats, maintains your active day streak, and grants XP to raise your operator rank.
            </span>
          </div>
        </div>

      </div>

      {/* Weekly Challenges Panel (1/3 width) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col gap-6 border-eco-cyan/25 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-eco-cyan/5 blur-2xl"></div>

        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-eco-cyan" />
          <h3 className="text-lg font-bold text-white">Active Challenges</h3>
        </div>

        {/* Weekly Challenge Summary Card (NEW) */}
        <div className="bg-[#0d1321]/40 border border-gray-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 pb-2 border-b border-gray-800/50">
            <span>Start: {formatDate(challengesWeekStart)}</span>
            <span>End: {formatDate(challengesWeekEnd)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500 block text-[9px] uppercase font-mono">Active/Total</span>
              <span className="text-xs font-bold text-white font-mono">{activeCount} / {totalCount}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[9px] uppercase font-mono">Completed</span>
              <span className="text-xs font-bold text-eco-green font-mono">{completedCount}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[9px] uppercase font-mono">Completion Rate</span>
              <span className="text-xs font-bold text-eco-cyan font-mono">{completionRate}%</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[9px] uppercase font-mono">Time Left</span>
              <span className="text-xs font-bold text-yellow-500 font-mono">{daysRemaining} Day{daysRemaining !== 1 && "s"}</span>
            </div>
          </div>

          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-eco-green to-eco-cyan transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Challenges list */}
        <div className="space-y-4 flex-1">
          {challenges.map((challenge) => {
            const isCompleted = challenge.status === "completed";
            const isActive = challenge.status === "active";
            
            const progressPct = isCompleted ? 100 : isActive ? 50 : 0;
            const progressColor = isCompleted ? "bg-eco-green" : "bg-eco-cyan";
            
            const difficultyLabel = challenge.difficulty || "medium";
            const diffColorClass = difficultyLabel === "easy" 
              ? "bg-eco-green/10 border-eco-green/20 text-eco-green-light" 
              : difficultyLabel === "hard"
              ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
              : "bg-eco-cyan/10 border-eco-cyan/20 text-eco-cyan-light";

            return (
              <div 
                key={challenge.id}
                className={`glass-panel rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between min-h-52 ${
                  isCompleted
                    ? "bg-eco-green/5 border-eco-green/20"
                    : isActive
                    ? "border-eco-cyan/30 bg-[#0d1321]/30 shadow-[0_0_15px_rgba(6,182,212,0.06)]"
                    : "border-gray-800/80 bg-gray-900/10"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm font-bold text-white leading-tight">
                      {challenge.name}
                    </span>
                    <span className="text-[9px] font-mono bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700/60 uppercase shrink-0">
                      {challenge.duration}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {challenge.description}
                  </p>

                  <div className="flex gap-2.5 pt-1 items-center">
                    <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${diffColorClass}`}>
                      {difficultyLabel}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">
                      {challenge.category}
                    </span>
                  </div>
                </div>

                {/* Challenge Progress */}
                <div className="space-y-1 my-3">
                  <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                    <span>Progress</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${progressColor} transition-all duration-300`}
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats Rewards */}
                <div className="border-t border-gray-800/50 pt-3 my-2 flex justify-between items-center text-[10px] font-mono font-bold">
                  <span className="text-eco-green-light">-{challenge.co2Saved} kg CO2e</span>
                  <span className="text-eco-cyan-light">+{challenge.xpReward} XP</span>
                </div>

                {/* Actions */}
                {challenge.status === "available" && (
                  <button
                    onClick={() => acceptChallenge(challenge.id)}
                    className="w-full py-2 bg-eco-cyan/10 hover:bg-eco-cyan/20 border border-eco-cyan/25 hover:border-eco-cyan/50 text-eco-cyan-light text-xs font-bold rounded-xl transition-all duration-300"
                  >
                    Accept Mission
                  </button>
                )}

                {challenge.status === "active" && (
                  <button
                    onClick={() => completeChallenge(challenge.id)}
                    className="w-full py-2 bg-gradient-to-r from-eco-green to-eco-cyan hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] text-white text-xs font-bold rounded-xl transition-all duration-300"
                  >
                    Verify Completion
                  </button>
                )}

                {isCompleted && (
                  <div className="flex items-center justify-center gap-1.5 py-2 bg-eco-green/10 border border-eco-green/20 rounded-xl text-[11px] font-bold text-eco-green-light select-none">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Mission Accomplished</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
