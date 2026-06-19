"use client";

import React, { useState, useEffect } from "react";
import { useEco } from "@/context/EcoContext";
import { 
  Globe, 
  HelpCircle, 
  TrendingDown, 
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Thermometer,
  Waves,
  Loader2,
  Calendar,
  Sparkles
} from "lucide-react";

interface GeminiRecommendation {
  title: string;
  description: string;
  offset: number;
  action: string;
  category: string;
}

interface GeminiWeeklyPlan {
  day: string;
  action: string;
}

interface GeminiResponse {
  culpritExplanation: string;
  recommendations: GeminiRecommendation[];
  weeklyPlan: GeminiWeeklyPlan[];
  confidence: number;
  reasoning: string;
}

export default function AIInsights() {
  const { calculatorData, carbonBreakdown } = useEco();
  
  const [aiData, setAiData] = useState<GeminiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adopting, setAdopting] = useState<Record<string, boolean>>({});
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;

    async function fetchInsights() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/insights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            calculatorData,
            carbonBreakdown,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          
          // Validate response schema to catch invalid or malformed responses
          if (
            !data || 
            data.error || 
            typeof data.culpritExplanation !== "string" || 
            !Array.isArray(data.recommendations) || 
            !Array.isArray(data.weeklyPlan) || 
            typeof data.confidence !== "number" || 
            typeof data.reasoning !== "string"
          ) {
            throw new Error("Invalid response format or schema from insights API");
          }

          if (active) {
            setAiData(data);
          }
        } else {
          if (active) {
            setError("AI insights are temporarily unavailable. Please try again later.");
          }
        }
      } catch (err) {
        console.error("Failed to load Gemini insights:", err);
        if (active) {
          setError("AI insights are temporarily unavailable. Please try again later.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchInsights();

    return () => {
      active = false;
    };
  }, [calculatorData, carbonBreakdown]);

  const handleAdopt = (id: string) => {
    setAdopting((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAdopting((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const toggleDay = (day: string) => {
    setCompletedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  // 3. "What if everyone lived like you?" metrics (kept same)
  const earthsNeeded = Math.max(1.0, parseFloat((carbonBreakdown.total / 2.0).toFixed(1)));
  const globalTempRise = Math.max(1.2, parseFloat((1.5 + (carbonBreakdown.total / 12.0) * 1.5).toFixed(1)));
  const annualGlobalCO2 = parseFloat((carbonBreakdown.total * 8.15).toFixed(1)); // 8.15 Billion population
  const seaLevelRiseRate = parseFloat((3.4 + (carbonBreakdown.total / 6.0) * 1.5).toFixed(1));

  if (loading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 items-stretch">
        <div className="xl:col-span-2 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-10 w-10 text-eco-green animate-spin mb-4" />
          <span className="text-sm font-mono text-gray-400 animate-pulse">
            Gemini AI analyzing carbon parameters and generating custom recommendations...
          </span>
        </div>
        <div className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-eco-cyan animate-spin mb-3" />
          <span className="text-xs font-mono text-gray-500">Recalculating planetary impact limits...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 items-stretch">
        <div className="xl:col-span-2 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center border-red-500/25">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-2">Service Unavailable</h3>
          <p className="text-sm text-gray-400 max-w-md">{error}</p>
        </div>
        <div className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center border-red-500/25">
          <AlertTriangle className="h-8 w-8 text-red-500/80 mb-3" />
          <span className="text-xs font-mono text-gray-500">Simulation blocked: API inactive</span>
        </div>
      </div>
    );
  }

  const data = aiData!;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* AI Insights & Recommendations (2/3 width) */}
      <div className="xl:col-span-2 flex flex-col gap-6">
        
        {/* Culprit Warning Card */}
        <div className="glass-panel rounded-3xl p-6 border-eco-green/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-eco-green/5 blur-xl"></div>
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-2xl bg-eco-green/15 border border-eco-green/30 flex items-center justify-center text-eco-green shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Primary Carbon Source Analysis</span>
              <h3 className="text-xl font-bold text-white">Major Emission Source</h3>
              <p className="text-sm text-gray-400 leading-relaxed mt-2">{data.culpritExplanation}</p>
            </div>
          </div>
        </div>

        {/* AI Recommendations Dashboard */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-eco-cyan" />
            <h3 className="text-lg font-bold text-white">Personalized Recommendations</h3>
          </div>

          <div className="space-y-4">
            {data.recommendations.map((rec, idx) => {
              const isDone = adopting[rec.title];
              return (
                <div 
                  key={idx} 
                  className="glass-panel glass-panel-hover rounded-2xl p-5 border-gray-800/60 hover:border-eco-cyan/20 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1.5 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{rec.title}</span>
                      <span className="text-[10px] font-mono font-semibold bg-eco-green/10 text-eco-green-light border border-eco-green/15 px-2 py-0.5 rounded-full">
                        -{rec.offset} Tons CO2/yr
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{rec.description}</p>
                    <span className="text-[10px] text-gray-500 block font-mono">Category: {rec.category}</span>
                  </div>

                  <button
                    onClick={() => handleAdopt(rec.title)}
                    disabled={isDone}
                    className={`rounded-xl px-5 py-2.5 text-xs font-bold shrink-0 transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      isDone 
                        ? "bg-eco-cyan/15 text-eco-cyan-light border border-eco-cyan/20 animate-checkmark-pop" 
                        : "bg-eco-cyan/10 border border-eco-cyan/15 text-eco-cyan hover:bg-eco-cyan/20 hover:border-eco-cyan/35"
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Goal Active</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>{rec.action || "Adopt Goal"}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Behavior Plan Section */}
        {data.weeklyPlan && data.weeklyPlan.length > 0 && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-eco-green" />
              <h3 className="text-lg font-bold text-white">Your Weekly AI Action Plan</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.weeklyPlan.map((plan, idx) => {
                const isCompleted = completedDays[plan.day];
                return (
                  <button
                    key={idx}
                    type="button"
                    role="checkbox"
                    aria-checked={isCompleted}
                    aria-label={`${plan.day}: ${plan.action}`}
                    onClick={() => toggleDay(plan.day)}
                    className={`glass-panel rounded-2xl p-4 border cursor-pointer select-none transition-all duration-300 flex items-start text-left w-full gap-3 ${
                      isCompleted 
                        ? "bg-eco-green/5 border-eco-green/20 text-eco-green-light" 
                        : "border-gray-800/60 text-gray-400 hover:border-gray-700/60 hover:bg-white/5 hover:-translate-y-0.5"
                    }`}
                  >
                    <div className={`h-5 w-5 rounded border flex items-center justify-center transition-all duration-200 mt-0.5 shrink-0 ${
                      isCompleted ? "border-eco-green bg-eco-green text-eco-bg animate-checkmark-pop" : "border-gray-600"
                    }`}>
                      {isCompleted && <CheckCircle className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-eco-cyan-light">
                        {plan.day}
                      </span>
                      <p className={`text-xs mt-1 leading-normal ${isCompleted ? "text-gray-300 line-through opacity-75" : "text-white"}`}>
                        {plan.action}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* AI Confidence Gauge & Planetary Impact Simulation (1/3 width) */}
      <div className="flex flex-col gap-6">
        
        {/* AI Confidence Rating */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border-eco-cyan/25 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-eco-cyan/5 blur-xl"></div>
          
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-eco-cyan" />
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest block">
              Confidence Engine
            </span>
          </div>

          <div className="flex items-center gap-4 py-2">
            {/* Numeric Badge */}
            <div className="h-16 w-16 rounded-2xl bg-eco-cyan/15 border border-eco-cyan/35 flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-extrabold text-white font-mono">{data.confidence}%</span>
              <span className="text-[8px] text-gray-500 uppercase font-mono">Rating</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Gemini Confidence Score</span>
              <p className="text-[10px] text-gray-400 leading-normal">{data.reasoning}</p>
            </div>
          </div>
        </div>

        {/* "What If Everyone Lived Like You" Visualizer */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-eco-cyan/25 relative overflow-hidden">
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-eco-cyan/5 blur-3xl"></div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-eco-cyan" />
              <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest">
                Global Impact Simulation
              </h3>
            </div>

            <h4 className="text-lg font-bold text-white mb-2 leading-tight">
              What if everyone lived like you?
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              If all 8.1 Billion humans adopted your lifestyle footprint parameters, global planetary capacity limits would shift dramatically:
            </p>

            {/* Planet Earths Gauge */}
            <div className="flex flex-col items-center text-center my-6 py-6 border-y border-gray-800/50">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest block mb-2">Planets Required</span>
              
              {/* Visual Earth illustration */}
              <div className="relative flex items-center justify-center mb-4">
                <div className="absolute h-24 w-24 rounded-full border border-dashed border-eco-cyan/20 animate-orbit-slow"></div>
                <div className="absolute h-32 w-32 rounded-full border border-dashed border-eco-green/10 animate-orbit-reverse"></div>
                
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-eco-bg to-[#0b1b36] border border-eco-cyan/35 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)] relative">
                  <Globe className="h-10 w-10 text-eco-cyan-light animate-pulse" />
                </div>
              </div>

              <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                {earthsNeeded} <span className="text-base text-gray-500 font-sans font-medium">Earths</span>
              </span>
              <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-mono">
                vs. 1.0 Sustainable Capacity
              </span>
            </div>

            {/* Impact Stats Grid */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#0d1321]/30 border border-gray-800/60 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-gray-400 font-semibold">Projected Temp Rise</span>
                </div>
                <span className="text-sm font-extrabold text-white font-mono">+{globalTempRise}°C</span>
              </div>

              <div className="flex justify-between items-center bg-[#0d1321]/30 border border-gray-800/60 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-eco-cyan-light" />
                  <span className="text-xs text-gray-400 font-semibold">Global CO2 Output</span>
                </div>
                <span className="text-sm font-extrabold text-white font-mono">{annualGlobalCO2}B Tons/yr</span>
              </div>

              <div className="flex justify-between items-center bg-[#0d1321]/30 border border-gray-800/60 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Waves className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-400 font-semibold">Sea Level Rise Rate</span>
                </div>
                <span className="text-sm font-extrabold text-white font-mono">{seaLevelRiseRate} mm/yr</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-[10px] text-gray-500 leading-normal border-t border-gray-800/50 pt-4 flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-eco-green shrink-0" />
            <span>
              Computed using localized carbon scenarios. Reduce emissions to get closer to <b>1 Earth</b> capability.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
