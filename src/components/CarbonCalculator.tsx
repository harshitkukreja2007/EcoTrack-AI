"use client";

import React, { useState } from "react";
import { useEco, CalculatorData } from "@/context/EcoContext";
import { 
  Car, 
  Lightbulb, 
  Utensils, 
  ShoppingBag, 
  Trash2, 
  Info,
  Calendar,
  Sparkles
} from "lucide-react";

type CategoryTab = "transport" | "energy" | "diet" | "shopping" | "waste";

export default function CarbonCalculator() {
  const { calculatorData, updateCalculator, carbonBreakdown, ecoScore, saveCurrentToHistory } = useEco();
  const [activeSubTab, setActiveSubTab] = useState<CategoryTab>("transport");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [scorePulse, setScorePulse] = useState(false);
  const [prevScore, setPrevScore] = useState(ecoScore);

  React.useEffect(() => {
    if (ecoScore > prevScore) {
      setScorePulse(true);
      const timer = setTimeout(() => setScorePulse(false), 800);
      setPrevScore(ecoScore);
      return () => clearTimeout(timer);
    } else if (ecoScore < prevScore) {
      setPrevScore(ecoScore);
    }
  }, [ecoScore, prevScore]);

  // Constants
  const AVG_FOOTPRINT = 12.0; // National baseline average in Tons
  const targetPercent = Math.max(0, Math.round(((AVG_FOOTPRINT - carbonBreakdown.total) / AVG_FOOTPRINT) * 100));

  const handleSave = () => {
    saveCurrentToHistory();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const tabs = [
    { id: "transport", label: "Commute", icon: Car },
    { id: "energy", label: "Energy Grid", icon: Lightbulb },
    { id: "diet", label: "Dietary", icon: Utensils },
    { id: "shopping", label: "Shopping", icon: ShoppingBag },
    { id: "waste", label: "Lifestyle", icon: Trash2 },
  ] as const;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Input Panel (Takes up 2/3 of space on desktop) */}
      <div className="xl:col-span-2 flex flex-col gap-6">
        
        {/* Category Icons Selector */}
        <div 
          role="tablist" 
          aria-label="Carbon categories" 
          className="glass-panel rounded-2xl p-2 flex justify-between gap-1 sm:gap-2"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                suppressHydrationWarning
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center gap-1.5 justify-center flex-1 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-eco-green/10 text-eco-green-light border border-eco-green/25 font-semibold"
                    : "border border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 sm:h-5 w-4 sm:w-5" />
                <span className="text-[10px] sm:text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Cards */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex-1">
          {activeSubTab === "transport" && (
            <div 
              role="tabpanel" 
              id="tabpanel-transport" 
              aria-labelledby="tab-transport" 
              className="space-y-8 animate-fadeIn"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Commute Transportation</h3>
                <p className="text-sm text-gray-400">Specify your weekly travel distance and vehicle specification.</p>
              </div>

              {/* Distance Slider */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 font-semibold">Weekly Travel Distance</span>
                  <span className="text-eco-green-light font-mono font-bold">{calculatorData.transportDistance} km</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="800"
                  step="10"
                  value={calculatorData.transportDistance}
                  onChange={(e) => updateCalculator({ transportDistance: Number(e.target.value) })}
                  aria-label="Weekly Travel Distance"
                  aria-valuemin={0}
                  aria-valuemax={800}
                  aria-valuenow={calculatorData.transportDistance}
                  aria-valuetext={`${calculatorData.transportDistance} km`}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-eco-green"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                  <span>0 km</span>
                  <span>200 km</span>
                  <span>400 km</span>
                  <span>600 km</span>
                  <span>800+ km</span>
                </div>
              </div>

              {/* Transportation Type Cards */}
              <div className="space-y-3">
                <span className="text-sm font-semibold text-gray-300">Vehicle Type & Fuel Type</span>
                <div 
                  role="radiogroup" 
                  aria-label="Vehicle Type & Fuel Engine" 
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  {[
                    { id: "gasoline", name: "Gasoline Car", desc: "Regular internal combustion" },
                    { id: "diesel", name: "Diesel Car", desc: "High compression combustion" },
                    { id: "hybrid", name: "Hybrid Car", desc: "Dual combustion & electric" },
                    { id: "electric", name: "Electric Vehicle", desc: "Zero exhaust EV" },
                    { id: "public", name: "Public Transit", desc: "Subway, bus, rail lines" },
                    { id: "bike_walk", name: "Walk / Bike", desc: "100% human muscle powered" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      role="radio"
                      aria-checked={calculatorData.transportType === type.id}
                      suppressHydrationWarning
                      onClick={() => updateCalculator({ transportType: type.id as CalculatorData["transportType"] })}
                      className={`glass-panel rounded-xl p-4 text-left border transition-all duration-300 flex flex-col justify-between h-28 glass-panel-hover ${
                        calculatorData.transportType === type.id
                          ? "bg-eco-green/5 border-eco-green/20 text-eco-green-light"
                          : "border-transparent hover:border-gray-800/60 hover:bg-white/5"
                      }`}
                    >
                      <span className="text-sm font-bold block">{type.name}</span>
                      <span className="text-[10px] text-gray-500 font-sans leading-tight mt-1 line-clamp-2">
                        {type.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "energy" && (
            <div 
              role="tabpanel" 
              id="tabpanel-energy" 
              aria-labelledby="tab-energy" 
              className="space-y-8 animate-fadeIn"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Home Electricity</h3>
                <p className="text-sm text-gray-400">Select your monthly electricity usage and clean energy share.</p>
              </div>

              {/* Electricity Usage Slider */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 font-semibold">Monthly Electricity Usage</span>
                  <span className="text-eco-green-light font-mono font-bold">{calculatorData.electricityUsage} kWh</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={calculatorData.electricityUsage}
                  onChange={(e) => updateCalculator({ electricityUsage: Number(e.target.value) })}
                  aria-label="Monthly Electricity Usage"
                  aria-valuemin={50}
                  aria-valuemax={1000}
                  aria-valuenow={calculatorData.electricityUsage}
                  aria-valuetext={`${calculatorData.electricityUsage} kWh`}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-eco-green"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                  <span>50 kWh</span>
                  <span>250 kWh</span>
                  <span>500 kWh</span>
                  <span>750 kWh</span>
                  <span>1000+ kWh</span>
                </div>
              </div>

              {/* Renewable Ratio Slider */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 font-semibold">Clean Energy Share (Solar/Wind)</span>
                  <span className="text-eco-cyan-light font-mono font-bold">{calculatorData.renewableRatio}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={calculatorData.renewableRatio}
                  onChange={(e) => updateCalculator({ renewableRatio: Number(e.target.value) })}
                  aria-label="Renewable Energy Share"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={calculatorData.renewableRatio}
                  aria-valuetext={`${calculatorData.renewableRatio}%`}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-eco-cyan"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                  <span>0% (Standard Power)</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100% (Clean Power)</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "diet" && (
            <div 
              role="tabpanel" 
              id="tabpanel-diet" 
              aria-labelledby="tab-diet" 
              className="space-y-8 animate-fadeIn"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Dietary Habits</h3>
                <p className="text-sm text-gray-400">Configure your average nutrition intake and local product preferences.</p>
              </div>

              {/* Diet Type Cards */}
              <div className="space-y-3">
                <span className="text-sm font-semibold text-gray-300">Primary Diet Pattern</span>
                <div 
                  role="radiogroup" 
                  aria-label="Primary Diet Pattern" 
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
                >
                  {[
                    { id: "heavy_meat", name: "Heavy Meat", desc: "Frequent beef & pork" },
                    { id: "average_meat", name: "Average Meat", desc: "Regular mix diet" },
                    { id: "pescatarian", name: "Pescatarian", desc: "Seafood only" },
                    { id: "vegetarian", name: "Vegetarian", desc: "Dairy/Eggs, no meat" },
                    { id: "vegan", name: "Vegan Plan", desc: "100% plant-based" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      role="radio"
                      aria-checked={calculatorData.dietType === type.id}
                      suppressHydrationWarning
                      onClick={() => updateCalculator({ dietType: type.id as CalculatorData["dietType"] })}
                      className={`glass-panel rounded-xl p-3 text-left border transition-all duration-300 flex flex-col justify-between h-28 glass-panel-hover ${
                        calculatorData.dietType === type.id
                          ? "bg-eco-green/5 border-eco-green/20 text-eco-green-light"
                          : "border-transparent hover:border-gray-800/60 hover:bg-white/5"
                      }`}
                    >
                      <span className="text-xs font-bold block leading-tight">{type.name}</span>
                      <span className="text-[9px] text-gray-500 font-sans leading-tight mt-1 line-clamp-3">
                        {type.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Local Food Ratio Slider */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 font-semibold">Sourced Locally (within 150 km)</span>
                  <span className="text-eco-green-light font-mono font-bold">{calculatorData.localFoodRatio}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={calculatorData.localFoodRatio}
                  onChange={(e) => updateCalculator({ localFoodRatio: Number(e.target.value) })}
                  aria-label="Sourced Locally"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={calculatorData.localFoodRatio}
                  aria-valuetext={`${calculatorData.localFoodRatio}%`}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-eco-green"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                  <span>0% (Imported/Supermarket)</span>
                  <span>50% (Farm to Table)</span>
                  <span>100% (Fully Backyard/Local)</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "shopping" && (
            <div 
              role="tabpanel" 
              id="tabpanel-shopping" 
              aria-labelledby="tab-shopping" 
              className="space-y-8 animate-fadeIn"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Shopping & Consumption</h3>
                <p className="text-sm text-gray-400">Log new apparel purchases and technology upgrades.</p>
              </div>

              {/* Clothing Slider */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 font-semibold">New Clothing Items Purchases</span>
                  <span className="text-eco-green-light font-mono font-bold">{calculatorData.shoppingClothing} items/month</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={calculatorData.shoppingClothing}
                  onChange={(e) => updateCalculator({ shoppingClothing: Number(e.target.value) })}
                  aria-label="New Clothing Items Purchases"
                  aria-valuemin={0}
                  aria-valuemax={15}
                  aria-valuenow={calculatorData.shoppingClothing}
                  aria-valuetext={`${calculatorData.shoppingClothing} items per month`}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-eco-green"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                  <span>0 items (Thrift/Minimalist)</span>
                  <span>5 items</span>
                  <span>10 items</span>
                  <span>15+ items (Fast Fashion)</span>
                </div>
              </div>

              {/* Tech Slider */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300 font-semibold">Tech Hardware Upgrades (Phone, Laptop, TV)</span>
                  <span className="text-eco-cyan-light font-mono font-bold">{calculatorData.shoppingTech} items/year</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={calculatorData.shoppingTech}
                  onChange={(e) => updateCalculator({ shoppingTech: Number(e.target.value) })}
                  aria-label="Tech Hardware Upgrades"
                  aria-valuemin={0}
                  aria-valuemax={10}
                  aria-valuenow={calculatorData.shoppingTech}
                  aria-valuetext={`${calculatorData.shoppingTech} items per year`}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-eco-cyan"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                  <span>0 items (Use till breaks)</span>
                  <span>3 items</span>
                  <span>6 items</span>
                  <span>10+ items (Early Adopter)</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "waste" && (
            <div 
              role="tabpanel" 
              id="tabpanel-waste" 
              aria-labelledby="tab-waste" 
              className="space-y-8 animate-fadeIn"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Lifestyle & Recycling</h3>
                <p className="text-sm text-gray-400">Indicate your waste segregation and disposal methods.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Recycle Toggle */}
                <button 
                  type="button"
                  role="switch"
                  aria-checked={calculatorData.wasteRecycling}
                  aria-label="Standard Recycling"
                  onClick={() => updateCalculator({ wasteRecycling: !calculatorData.wasteRecycling })}
                  className={`glass-panel rounded-2xl p-6 border cursor-pointer transition-all duration-300 flex items-center justify-between text-left w-full ${
                    calculatorData.wasteRecycling
                      ? "bg-eco-green/10 border-eco-green text-eco-green-light"
                      : "border-gray-800/80 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <div className="flex flex-col gap-1 pr-4">
                    <span className="text-lg font-bold">Standard Recycling</span>
                    <span className="text-xs text-gray-500 leading-tight">
                      Systematically segregate plastics, cans, paper, glass from garbage.
                    </span>
                  </div>
                  <div className={`h-6 w-11 rounded-full p-0.5 transition-colors duration-300 shrink-0 ${
                    calculatorData.wasteRecycling ? "bg-eco-green" : "bg-gray-800"
                  }`}>
                    <div className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                      calculatorData.wasteRecycling ? "translate-x-5" : "translate-x-0"
                    }`}></div>
                  </div>
                </button>

                {/* Composting Toggle */}
                <button 
                  type="button"
                  role="switch"
                  aria-checked={calculatorData.wasteComposting}
                  aria-label="Organic Composting"
                  onClick={() => updateCalculator({ wasteComposting: !calculatorData.wasteComposting })}
                  className={`glass-panel rounded-2xl p-6 border cursor-pointer transition-all duration-300 flex items-center justify-between text-left w-full ${
                    calculatorData.wasteComposting
                      ? "bg-eco-cyan/10 border-eco-cyan text-eco-cyan-light"
                      : "border-gray-800/80 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <div className="flex flex-col gap-1 pr-4">
                    <span className="text-lg font-bold">Organic Composting</span>
                    <span className="text-xs text-gray-500 leading-tight">
                      Compost kitchen scraps, food waste, and garden organic matter.
                    </span>
                  </div>
                  <div className={`h-6 w-11 rounded-full p-0.5 transition-colors duration-300 shrink-0 ${
                    calculatorData.wasteComposting ? "bg-eco-cyan" : "bg-gray-800"
                  }`}>
                    <div className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                      calculatorData.wasteComposting ? "translate-x-5" : "translate-x-0"
                    }`}></div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Dial & Breakdown Panel */}
      <div className="flex flex-col gap-6">
        
        {/* Footprint Indicator Dial */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center justify-between border-eco-cyan/25 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-eco-green via-eco-cyan to-eco-green"></div>

          <span className="text-xs font-mono text-gray-500 tracking-wider block mb-4">
            Your Impact
          </span>

          {/* Carbon Score Dial Graphic */}
          <div className={`relative flex items-center justify-center h-44 w-44 rounded-full transition-all duration-300 ${
            scorePulse ? "animate-eco-halo" : ""
          }`}>
            {/* SVG Ring background */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="74"
                className="stroke-gray-800/60"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r="74"
                className="stroke-eco-green"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={464}
                strokeDashoffset={464 - (464 * Math.max(10, Math.min(100, ecoScore))) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-extrabold text-white font-mono tracking-tighter">
                {carbonBreakdown.total}
              </span>
              <span className="text-[10px] text-gray-500 font-mono tracking-wider mt-0.5">
                Tons CO2e/Yr
              </span>
            </div>
          </div>

          {/* Score Badge */}
          <div className="mt-4 flex items-center gap-1.5 rounded-full bg-eco-cyan/10 border border-eco-cyan/20 px-3 py-1 text-xs font-medium text-eco-cyan-light">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Eco Score: {ecoScore}/100</span>
          </div>

          <div className="w-full border-t border-gray-800/80 my-5 pt-4 text-left space-y-1">
            <span className="text-xs text-gray-400 block">Eco Benchmarks</span>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-white">vs. National Average</span>
              {carbonBreakdown.total <= AVG_FOOTPRINT ? (
                <span className="text-eco-green">-{targetPercent}% Lower</span>
              ) : (
                <span className="text-red-400">+{Math.round(((carbonBreakdown.total - AVG_FOOTPRINT)/AVG_FOOTPRINT)*100)}% Higher</span>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saveSuccess}
            className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 border ${
              saveSuccess 
                ? "bg-eco-green/10 border-eco-green text-eco-green-light"
                : "bg-white text-eco-bg border-transparent hover:bg-transparent hover:border-white hover:text-white"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>{saveSuccess ? "Progress Saved!" : "Save My Progress"}</span>
          </button>
        </div>

        {/* Sector Breakdowns */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col gap-5">
          <h4 className="text-sm font-mono text-gray-500 tracking-wider">
            Impact Breakdown
          </h4>

          <div className="space-y-4">
            {[
              { label: "Transportation", value: carbonBreakdown.transport, color: "bg-eco-green" },
              { label: "Electricity", value: carbonBreakdown.electricity, color: "bg-eco-cyan" },
              { label: "Diet & Food", value: carbonBreakdown.diet, color: "bg-eco-green-light" },
              { label: "Shopping Habits", value: carbonBreakdown.shopping, color: "bg-eco-cyan-light" },
              { label: "Waste Disposal", value: carbonBreakdown.waste, color: "bg-gray-400" },
            ].map((sector) => {
              const percentage = Math.round((sector.value / Math.max(1, carbonBreakdown.total)) * 100);
              return (
                <div key={sector.label} className="space-y-1">
                  <div className="flex justify-between text-xs sm:text-sm font-medium">
                    <span className="text-gray-300">{sector.label}</span>
                    <span className="text-white font-mono">{sector.value} t ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-gray-800/80 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${sector.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex items-start gap-2.5 rounded-xl bg-gray-800/40 p-3.5 text-xs text-gray-400 leading-normal">
            <Info className="h-4 w-4 text-eco-cyan shrink-0 mt-0.5" />
            <span>
              Values indicate metric tons of CO2 equivalent emissions computed annually. 
              The global sustainable target is below <b>2.0 Tons</b> per person.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
