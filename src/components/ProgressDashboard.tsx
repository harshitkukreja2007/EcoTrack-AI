"use client";

import React, { useState } from "react";
import { useEco, HistoryEntry } from "@/context/EcoContext";
import { 
  LineChart, 
  Flame, 
  Trophy, 
  Lock, 
  Sparkles
} from "lucide-react";

export default function ProgressDashboard() {
  const { history, profile, badges } = useEco();
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Calculate month-over-month trend
  const getMoMTrend = () => {
    if (!history || history.length < 2) return null;
    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    if (!previous || previous.co2Output === 0) return null;
    
    const changePercent = ((current.co2Output - previous.co2Output) / previous.co2Output) * 100;
    return {
      percent: Math.abs(changePercent),
      isImprovement: changePercent < 0,
    };
  };

  const momTrend = getMoMTrend();

  // SVG Chart Layout Metrics
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  // Process history coordinates
  const renderChart = () => {
    if (!history || history.length === 0) return null;

    // Find min/max values for scaling
    const co2Values = history.map((h) => h.co2Output);
    const maxVal = Math.max(...co2Values, 12); // benchmark upper limit
    const minVal = Math.min(...co2Values, 0); // floor baseline

    const range = maxVal - minVal || 1;
    const points: { x: number; y: number; data: HistoryEntry }[] = [];

    history.forEach((entry, idx) => {
      const x = paddingX + (idx * (chartWidth - 2 * paddingX)) / Math.max(1, history.length - 1);
      const y = chartHeight - paddingY - ((entry.co2Output - minVal) * (chartHeight - 2 * paddingY)) / range;
      points.push({ x, y, data: entry });
    });

    // Create SVG Path line
    let linePath = "";
    let areaPath = "";

    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y}`;
      areaPath = `M ${points[0].x} ${chartHeight - paddingY} L ${points[0].x} ${points[0].y}`;

      for (let i = 1; i < points.length; i++) {
        linePath += ` L ${points[i].x} ${points[i].y}`;
        areaPath += ` L ${points[i].x} ${points[i].y}`;
      }

      areaPath += ` L ${points[points.length - 1].x} ${chartHeight - paddingY} Z`;
    }

    return { points, linePath, areaPath, minVal, maxVal };
  };

  const chartData = renderChart();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Historical Analytics & Chart Widget (2/3 width) */}
      <div className="xl:col-span-2 flex flex-col gap-6">
        
        {/* Carbon Trend SVG Chart */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-eco-green/5 blur-xl"></div>
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <LineChart className="h-5 w-5 text-eco-green" />
              <h3 className="text-lg font-bold text-white">Carbon Footprint Trend</h3>
              {momTrend && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  momTrend.isImprovement 
                    ? "bg-eco-green/15 text-eco-green-light border-eco-green/25"
                    : "bg-red-500/15 text-red-400 border-red-500/25"
                }`}>
                  {momTrend.isImprovement 
                    ? `🌱 ${momTrend.percent.toFixed(1)}% improvement vs last month` 
                    : `⚠️ +${momTrend.percent.toFixed(1)}% increase vs last month`}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              Unit: Tons CO2e/Yr
            </span>
          </div>

          {/* SVG Line Chart Container */}
          <div className="relative w-full overflow-hidden">
            {history.length > 0 ? (
              <div className="w-full overflow-x-auto scrollbar-none">
                <div className="min-w-[500px] aspect-[500/160]">
                  <svg 
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                    className="w-full h-full overflow-visible"
                  >
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                      </linearGradient>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>

                    {/* Chart Grid Lines */}
                    <line 
                      x1={paddingX} y1={paddingY} 
                      x2={chartWidth - paddingX} y2={paddingY} 
                      className="stroke-gray-800/40" strokeWidth="1" strokeDasharray="4 4" 
                    />
                    <line 
                      x1={paddingX} y1={(chartHeight) / 2} 
                      x2={chartWidth - paddingX} y2={(chartHeight) / 2} 
                      className="stroke-gray-800/40" strokeWidth="1" strokeDasharray="4 4" 
                    />
                    <line 
                      x1={paddingX} y1={chartHeight - paddingY} 
                      x2={chartWidth - paddingX} y2={chartHeight - paddingY} 
                      className="stroke-gray-800/60" strokeWidth="1" 
                    />

                    {chartData && (
                      <>
                        {/* Area Fill */}
                        <path d={chartData.areaPath} fill="url(#areaGradient)" />

                        {/* Trend Line */}
                        <path 
                          d={chartData.linePath} 
                          fill="transparent" 
                          stroke="url(#lineGradient)" 
                          strokeWidth="3" 
                          strokeLinecap="round" 
                        />

                        {/* Interactive Data Nodes */}
                        {chartData.points.map((pt, idx) => (
                          <g key={idx}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={hoveredPoint === idx ? "7" : "4.5"}
                              className={`${hoveredPoint === idx ? "fill-white stroke-eco-cyan" : "fill-eco-green stroke-eco-bg"} stroke-2 transition-all duration-150 cursor-pointer`}
                              onMouseEnter={() => setHoveredPoint(idx)}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                            {/* X Axis labels */}
                            <text
                              x={pt.x}
                              y={chartHeight - 4}
                              className="fill-gray-500 text-[9px] font-mono text-center"
                              textAnchor="middle"
                            >
                              {pt.data.date.split(" ")[0]}
                            </text>
                          </g>
                        ))}
                      </>
                    )}
                  </svg>
                </div>
              </div>
            ) : (
              <div className="h-44 w-full rounded-2xl border border-dashed border-gray-800 flex items-center justify-center text-sm text-gray-500">
                Audit logs are empty. Save your first carbon footprint calculator inputs to build statistics.
              </div>
            )}

            {/* Hover Tooltip Overlay */}
            {hoveredPoint !== null && chartData && (
              <div 
                className="absolute bg-eco-dark/95 border border-eco-cyan/35 rounded-xl p-3 shadow-xl pointer-events-none text-xs flex flex-col gap-1.5 animate-fadeIn"
                style={{ 
                  left: `${Math.min(chartWidth - 140, Math.max(20, chartData.points[hoveredPoint].x - 60))}px`,
                  top: `${Math.max(10, chartData.points[hoveredPoint].y - 75)}px` 
                }}
              >
                <div className="flex justify-between items-center gap-4">
                  <span className="font-bold text-white">{chartData.points[hoveredPoint].data.date}</span>
                  <span className="font-mono text-eco-cyan-light font-bold">Eco Score: {chartData.points[hoveredPoint].data.ecoScore}</span>
                </div>
                <div className="text-gray-400 font-medium">
                  Footprint: <span className="font-mono text-white font-bold">{chartData.points[hoveredPoint].data.co2Output} Tons CO2/yr</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gamified Achievements Box */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-eco-cyan" />
              <h3 className="text-lg font-bold text-white">Achievements & Badges</h3>
            </div>
            <span className="text-xs font-semibold text-eco-cyan bg-eco-cyan/15 rounded-full px-2.5 py-0.5 border border-eco-cyan/25">
              Unlocked: {badges.filter((b) => b.unlocked).length}/{badges.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`glass-panel rounded-2xl p-4 flex flex-col items-center text-center justify-between border relative overflow-hidden transition-all duration-300 ${
                  badge.unlocked
                    ? "bg-eco-green/5 border-eco-green/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "border-gray-800/80 bg-gray-900/10 opacity-50"
                }`}
              >
                {/* Lock indicator */}
                {!badge.unlocked && (
                  <div className="absolute top-2 right-2 text-gray-600">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                )}

                <span className="text-4xl block my-2 filter transition-all duration-300 group-hover:scale-110">
                  {badge.icon}
                </span>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-white block">{badge.name}</span>
                  <span className="text-[10px] text-gray-500 font-sans leading-tight block line-clamp-2">
                    {badge.description}
                  </span>
                </div>

                {badge.unlocked && badge.unlockedAt && (
                  <span className="text-[9px] font-mono text-eco-green mt-3 bg-eco-green/10 px-2 py-0.5 rounded border border-eco-green/10">
                    Unlocked: {badge.unlockedAt}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Gamification Stats Sidebar (1/3 width) */}
      <div className="flex flex-col gap-6">
        
        {/* Streak Flame Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center border-orange-500/25 relative overflow-hidden">
          
          {/* Flame ambient glow */}
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-orange-500/5 blur-2xl"></div>

          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest block mb-4">
            Active streak tracker
          </span>

          <div className="relative flex items-center justify-center h-28 w-28 bg-orange-500/5 border border-orange-500/10 rounded-full my-4 shadow-[0_0_20px_rgba(239,114,21,0.06)]">
            <Flame className="h-14 w-14 fill-orange-500 text-orange-500 animate-bounce" />
          </div>

          <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
            {profile.streak} <span className="text-base text-gray-500 font-sans font-medium">Days Active</span>
          </span>

          <div className="w-full border-t border-gray-800/80 mt-6 pt-4 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center text-gray-400">
              <span>Last Check-In</span>
              <span className="text-white font-semibold">{profile.lastActiveDate || "No data logged today"}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Cumulative CO2 Offset</span>
              <span className="text-eco-green font-semibold">{profile.totalCo2Saved.toLocaleString()} kg CO2e</span>
            </div>
          </div>
        </div>

        {/* Level Up Information Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <h4 className="text-sm font-mono text-gray-500 uppercase tracking-widest">
            Level Progress spec
          </h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Current Rank</span>
              <span className="text-xs font-bold text-white font-mono bg-eco-cyan/15 text-eco-cyan-light rounded px-2.5 py-0.5 border border-eco-cyan/25">
                Level {profile.level} Operator
              </span>
            </div>
            
            {/* XP progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-500">XP Progress</span>
                <span className="text-white font-bold">{profile.xp} / {profile.level * 100} XP</span>
              </div>
              <div className="h-2 w-full bg-gray-800/80 rounded-full overflow-hidden border border-gray-800">
                <div 
                  className="h-full bg-gradient-to-r from-eco-green to-eco-cyan rounded-full transition-all duration-500"
                  style={{ width: `${(profile.xp / (profile.level * 100)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 border border-gray-800/60 rounded-xl p-3.5 text-xs text-gray-400 leading-normal flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-eco-green shrink-0 mt-0.5" />
            <span>
              Logging daily habits or completing weekly challenges awards <b>XP</b>. Complete XP levels to scale up and unlock rank achievements.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
