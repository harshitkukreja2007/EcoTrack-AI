"use client";

import React, { useState, useEffect } from "react";
import { useEco, CalculatorData } from "@/context/EcoContext";
import { calculateCarbonFootprint, calculateEcoScore } from "@/lib/carbonUtils";
import { 
  Sliders, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  Leaf, 
  AlertTriangle,
  BrainCircuit,
  CheckCircle,
  HelpCircle,
  Clock
} from "lucide-react";

interface ScenarioResponse {
  mostImpactfulChange: string;
  sustainabilityReasoning: string;
  implementationSteps: string[];
  longTermBenefits: string;
}

export default function WhatIfSimulator() {
  const { calculatorData, carbonBreakdown, ecoScore } = useEco();
  
  // Simulated inputs state initialized to user's actual calculator data
  const [simInputs, setSimInputs] = useState<CalculatorData>({ ...calculatorData });
  const [aiAnalysis, setAiAnalysis] = useState<ScenarioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  // Re-sync with actual data if it changes on other tabs (optional but good practice)
  useEffect(() => {
    setSimInputs({ ...calculatorData });
    setAiAnalysis(null);
    setError(null);
  }, [calculatorData]);

  // Run local carbon calculations instantly on state changes
  const simBreakdown = calculateCarbonFootprint(simInputs);
  const simEcoScore = calculateEcoScore(simBreakdown.total);

  // Metrics comparisons
  const co2Diff = parseFloat((simBreakdown.total - carbonBreakdown.total).toFixed(2));
  const isSaving = co2Diff < 0;
  const ecoScoreDiff = simEcoScore - ecoScore;
  const pctImprovement = carbonBreakdown.total > 0
    ? Math.round(((carbonBreakdown.total - simBreakdown.total) / carbonBreakdown.total) * 100)
    : 0;

  // Generate cache key representing the simulated state
  const getCacheKey = (inputs: CalculatorData) => {
    return `ecotrack_whatif_cache_${inputs.transportDistance}_${inputs.transportType}_${inputs.electricityUsage}_${inputs.renewableRatio}_${inputs.dietType}_${inputs.localFoodRatio}_${inputs.shoppingClothing}_${inputs.shoppingTech}_${inputs.wasteRecycling ? 1 : 0}_${inputs.wasteComposting ? 1 : 0}`;
  };

  const cacheKey = getCacheKey(simInputs);

  // Check if current simulation state exists in localStorage cache
  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setIsCached(true);
    } else {
      setIsCached(false);
      // Reset AI card when sliders change and there is no cache for the new state
      setAiAnalysis(null);
    }
  }, [cacheKey]);

  // Handle on-demand AI Scenario Generation
  const handleGenerateAI = async () => {
    setError(null);
    setLoading(true);

    try {
      // 1. Check local cache first
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setAiAnalysis(parsed);
        setLoading(false);
        return;
      }

      // 2. Cache miss: invoke server route
      const res = await fetch("/api/insights/scenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentInputs: calculatorData,
          simulatedInputs: simInputs,
          currentBreakdown: carbonBreakdown,
          simulatedBreakdown: simBreakdown,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Validate response structure
        if (
          !data || 
          data.error || 
          typeof data.mostImpactfulChange !== "string" || 
          typeof data.sustainabilityReasoning !== "string" || 
          !Array.isArray(data.implementationSteps) || 
          typeof data.longTermBenefits !== "string"
        ) {
          throw new Error("Invalid schema received from API");
        }

        // Cache the response locally
        localStorage.setItem(cacheKey, JSON.stringify(data));
        setAiAnalysis(data);
        setIsCached(true);
      } else {
        setError("AI insights are temporarily unavailable. Please try again later.");
      }
    } catch (err) {
      console.error("Failed to load scenario insights:", err);
      setError("AI insights are temporarily unavailable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (field: keyof CalculatorData, value: unknown) => {
    setSimInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper values for styling
  const diffColorClass = isSaving ? "text-eco-green" : co2Diff > 0 ? "text-red-400" : "text-gray-400";
  const diffBgClass = isSaving ? "bg-eco-green/10 border-eco-green/20" : co2Diff > 0 ? "bg-red-500/10 border-red-500/20" : "bg-gray-800/40 border-gray-700/40";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 items-stretch">
      
      {/* Left Column: Sliders & Adjustments */}
      <div className="xl:col-span-2 flex flex-col gap-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-eco-green" />
            <h3 className="text-lg font-bold text-white">Adjust Simulated Parameters</h3>
          </div>
          
          <div className="space-y-6">
            
            {/* 1. Transport Sector */}
            <div className="border-b border-gray-800/80 pb-5 space-y-4">
              <span className="text-xs font-mono font-bold text-eco-green uppercase tracking-wider block">Transportation</span>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Weekly Commute Distance</span>
                  <span className="text-white font-mono font-bold">{simInputs.transportDistance} km</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="800"
                  step="10"
                  value={simInputs.transportDistance}
                  onChange={(e) => handleSliderChange("transportDistance", Number(e.target.value))}
                  aria-label="Simulated Weekly Commute Distance"
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-eco-green focus:outline-none focus:ring-1 focus:ring-eco-green"
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs text-gray-400 block">Vehicle Specification</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "gasoline", name: "Gasoline" },
                    { id: "diesel", name: "Diesel" },
                    { id: "hybrid", name: "Hybrid" },
                    { id: "electric", name: "Electric" },
                    { id: "public", name: "Public Transit" },
                    { id: "bike_walk", name: "Walk/Bike" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleSliderChange("transportType", type.id)}
                      className={`py-2 text-[10px] sm:text-xs font-semibold rounded-xl border transition-all duration-200 glass-panel-hover cursor-pointer ${
                        simInputs.transportType === type.id
                          ? "bg-eco-green/5 border-eco-green/20 text-eco-green-light"
                          : "border-gray-800/60 bg-[#0d1321]/30 text-gray-400 hover:border-gray-750"
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Diet Sector */}
            <div className="border-b border-gray-800/80 pb-5 space-y-4">
              <span className="text-xs font-mono font-bold text-eco-green uppercase tracking-wider block">Dietary & Food</span>
              <div className="space-y-2">
                <span className="text-xs text-gray-400 block">Meal Plan Choice</span>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: "heavy_meat", name: "Heavy Meat" },
                    { id: "average_meat", name: "Avg Meat" },
                    { id: "pescatarian", name: "Pescatarian" },
                    { id: "vegetarian", name: "Vegetarian" },
                    { id: "vegan", name: "Vegan" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleSliderChange("dietType", type.id)}
                      className={`py-2 text-[9px] sm:text-xs font-semibold rounded-xl border transition-all duration-200 glass-panel-hover cursor-pointer ${
                        simInputs.dietType === type.id
                          ? "bg-eco-green/5 border-eco-green/20 text-eco-green-light"
                          : "border-gray-800/60 bg-[#0d1321]/30 text-gray-400 hover:border-gray-750"
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Sourced Locally (within 150km)</span>
                  <span className="text-white font-mono font-bold">{simInputs.localFoodRatio}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={simInputs.localFoodRatio}
                  onChange={(e) => handleSliderChange("localFoodRatio", Number(e.target.value))}
                  aria-label="Simulated Sourced Locally"
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-eco-green focus:outline-none focus:ring-1 focus:ring-eco-green"
                />
              </div>
            </div>

            {/* 3. Energy Grid Sector */}
            <div className="border-b border-gray-800/80 pb-5 space-y-4">
              <span className="text-xs font-mono font-bold text-eco-green uppercase tracking-wider block">Home Energy</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Electricity Usage</span>
                    <span className="text-white font-mono font-bold">{simInputs.electricityUsage} kWh/mo</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="20"
                    value={simInputs.electricityUsage}
                    onChange={(e) => handleSliderChange("electricityUsage", Number(e.target.value))}
                    aria-label="Simulated Electricity Usage"
                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-eco-green focus:outline-none focus:ring-1 focus:ring-eco-green"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Renewables Share</span>
                    <span className="text-white font-mono font-bold">{simInputs.renewableRatio}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={simInputs.renewableRatio}
                    onChange={(e) => handleSliderChange("renewableRatio", Number(e.target.value))}
                    aria-label="Simulated Renewables Share"
                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-eco-green focus:outline-none focus:ring-1 focus:ring-eco-green"
                  />
                </div>
              </div>
            </div>

            {/* 4. Consumption & Waste Sectors */}
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-eco-green uppercase tracking-wider block">Shopping & Recycling</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Apparel Shopping</span>
                    <span className="text-white font-mono font-bold">{simInputs.shoppingClothing} items/mo</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={simInputs.shoppingClothing}
                    onChange={(e) => handleSliderChange("shoppingClothing", Number(e.target.value))}
                    aria-label="Simulated Apparel Shopping"
                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-eco-green focus:outline-none focus:ring-1 focus:ring-eco-green"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Tech Hardware Upgrades</span>
                    <span className="text-white font-mono font-bold">{simInputs.shoppingTech} items/yr</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={simInputs.shoppingTech}
                    onChange={(e) => handleSliderChange("shoppingTech", Number(e.target.value))}
                    aria-label="Simulated Tech Hardware Upgrades"
                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-eco-green focus:outline-none focus:ring-1 focus:ring-eco-green"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSliderChange("wasteRecycling", !simInputs.wasteRecycling)}
                  className={`py-3 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 glass-panel-hover cursor-pointer ${
                    simInputs.wasteRecycling
                      ? "bg-eco-green/5 border-eco-green/20 text-eco-green-light"
                      : "border-gray-800/60 bg-[#0d1321]/30 text-gray-400 hover:border-gray-750"
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Segregates Recycling</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSliderChange("wasteComposting", !simInputs.wasteComposting)}
                  className={`py-3 text-xs font-semibold rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 glass-panel-hover cursor-pointer ${
                    simInputs.wasteComposting
                      ? "bg-eco-green/5 border-eco-green/20 text-eco-green-light"
                      : "border-gray-800/60 bg-[#0d1321]/30 text-gray-400 hover:border-gray-750"
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Composts Organics</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Right Column: Calculations, Comparisons & AI Analysis */}
      <div className="flex flex-col gap-6">
        
        {/* Footprint Comparison Dials */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col justify-between border-eco-green/25 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-eco-green via-eco-cyan to-eco-green"></div>
          
          <div>
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest block mb-4">
              Real-Time Projection
            </span>

            {/* Simulated vs Current Metric tons */}
            <div className="flex flex-col items-center text-center my-6 pb-6 border-b border-gray-800/50">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-1">Simulated Footprint</span>
              
              <div className="h-28 w-28 rounded-full border border-eco-green/25 bg-eco-green/5 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.06)] mb-3">
                <span className="text-3xl font-extrabold text-white font-mono tracking-tight">{simBreakdown.total}</span>
                <span className="text-[8px] text-gray-500 uppercase font-mono">Tons CO2/yr</span>
              </div>

              <div className="text-xs text-gray-400">
                Baseline: <span className="font-mono text-white font-semibold">{carbonBreakdown.total} Tons</span>
              </div>
            </div>

            {/* Difference & Delta Cards */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* CO2 savings metric */}
              <div className={`rounded-xl p-3 border flex flex-col items-center justify-center text-center ${
                isSaving ? "bg-eco-green/5 border-eco-green/15" : co2Diff > 0 ? "bg-red-500/5 border-red-500/15" : "bg-gray-800/20 border-gray-700/20"
              }`}>
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block mb-1">Net CO2 Change</span>
                <div className="flex items-center gap-1">
                  {isSaving ? <TrendingDown className="h-3.5 w-3.5 text-eco-green" /> : co2Diff > 0 ? <TrendingUp className="h-3.5 w-3.5 text-red-400" /> : null}
                  <span className={`text-base font-extrabold font-mono ${diffColorClass}`}>
                    {co2Diff > 0 ? `+${co2Diff}` : co2Diff} Tons
                  </span>
                </div>
              </div>

              {/* Eco Score shift metric */}
              <div className={`rounded-xl p-3 border flex flex-col items-center justify-center text-center ${
                ecoScoreDiff > 0 
                  ? "bg-eco-green/5 border-eco-green/15" 
                  : ecoScoreDiff < 0 
                    ? "bg-red-500/5 border-red-500/15" 
                    : "bg-gray-800/20 border-gray-700/20"
              }`}>
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block mb-1">Score Shift</span>
                <span className={`text-base font-extrabold font-mono ${
                  ecoScoreDiff > 0 ? "text-eco-green" : ecoScoreDiff < 0 ? "text-red-400" : "text-gray-400"
                }`}>
                  {ecoScoreDiff > 0 ? `+${ecoScoreDiff}` : ecoScoreDiff === 0 ? "0" : ecoScoreDiff} Pts
                </span>
              </div>

            </div>

            {/* Global scale projection */}
            {isSaving && pctImprovement > 0 && (
              <div className="mt-4 bg-eco-green/5 border border-eco-green/15 rounded-xl p-3 text-[10px] text-gray-400 leading-normal flex items-start gap-2">
                <Leaf className="h-4 w-4 text-eco-green shrink-0 mt-0.5" />
                <span>
                  Adjusting to this lifestyle improves your sustainability efficiency by <b>{pctImprovement}%</b> compared to your baseline.
                </span>
              </div>
            )}

          </div>
        </div>

        {/* AI Scenario Review Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border-eco-green/25 relative overflow-hidden flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-eco-green" />
              <span className="text-xs font-mono text-gray-400 uppercase tracking-widest block font-bold">AI Scenario Analysis</span>
            </div>
            {isCached && !loading && (
              <div className="flex items-center gap-1 text-[8px] font-mono text-gray-500 uppercase bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                <Clock className="h-2.5 w-2.5" />
                <span>Cached</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse flex-1 flex flex-col justify-center py-6">
              <div className="h-4 bg-gray-800 rounded w-2/3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-800 rounded w-full"></div>
                <div className="h-3 bg-gray-800 rounded w-5/6"></div>
              </div>
              <div className="h-10 bg-gray-800 rounded-xl w-full"></div>
            </div>
          ) : error ? (
            <div className="text-center py-6 space-y-3">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto" />
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">{error}</p>
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-4 text-left animate-fadeIn">
              <div className="space-y-1 bg-eco-green/5 border border-eco-green/15 rounded-xl p-3.5">
                <span className="text-[9px] font-mono text-eco-green uppercase tracking-wider block font-bold">Highest Impact Change</span>
                <span className="text-xs font-bold text-white">{aiAnalysis.mostImpactfulChange}</span>
              </div>
              
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">Sustainability Rationale</span>
                <p className="text-xs text-gray-300 leading-relaxed">{aiAnalysis.sustainabilityReasoning}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">Suggested Steps</span>
                <ul className="space-y-1.5">
                  {aiAnalysis.implementationSteps.map((step, idx) => (
                    <li key={idx} className="text-xs text-gray-400 flex items-start gap-1.5 leading-normal">
                      <span className="text-eco-green font-mono font-bold mt-0.5">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1 border-t border-gray-800/80 pt-3">
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">5-Year Outlook</span>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">{aiAnalysis.longTermBenefits}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
              <HelpCircle className="h-8 w-8 text-gray-600" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-white block">Request AI Review</span>
                <p className="text-[10px] text-gray-500 max-w-xs leading-normal">
                  Generate a context-aware analysis of your simulated scenario's long-term sustainability values.
                </p>
              </div>
            </div>
          )}

          {!loading && (
            <button
              onClick={handleGenerateAI}
              className="w-full py-3 rounded-xl bg-eco-green/5 border border-eco-green/15 text-eco-green hover:bg-eco-green/10 hover:border-eco-green/30 text-xs font-bold transition-all duration-205 flex items-center justify-center gap-2 cursor-pointer transform active:scale-[0.98]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{aiAnalysis ? "Refresh AI Analysis" : "Generate AI Scenario Analysis"}</span>
            </button>
          )}

        </div>

      </div>

    </div>
  );
}
