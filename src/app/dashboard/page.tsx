"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import CarbonCalculator from "@/components/CarbonCalculator";
import AIInsights from "@/components/AIInsights";
import ProgressDashboard from "@/components/ProgressDashboard";
import EcoChallenges from "@/components/EcoChallenges";
import UserProfileView from "@/components/UserProfileView";
import AuthView from "@/components/AuthView";
import { useEco } from "@/context/EcoContext";
import { 
  Calculator, 
  BrainCircuit, 
  LineChart, 
  Trophy, 
  User 
} from "lucide-react";

type TabId = "calculator" | "insights" | "progress" | "challenges" | "profile";

export default function Dashboard() {
  const { user, authLoading, carbonBreakdown, calculatorData } = useEco();
  const [activeTab, setActiveTab] = useState<TabId>("calculator");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Find highest emission category for smart reminder
  const getSmartReminder = () => {
    const categories = [
      { id: "transport", name: "Transportation", value: carbonBreakdown.transport },
      { id: "electricity", name: "Electricity Usage", value: carbonBreakdown.electricity },
      { id: "diet", name: "Dietary Footprint", value: carbonBreakdown.diet },
      { id: "shopping", name: "Shopping & Lifestyle", value: carbonBreakdown.shopping },
      { id: "waste", name: "Waste Disposal", value: carbonBreakdown.waste },
    ];
    
    // Sort descending
    categories.sort((a, b) => b.value - a.value);
    const highest = categories[0];
    
    if (highest.value === 0) {
      return {
        text: "🌍 Outstanding! Your carbon footprint is near zero. Keep maintaining your eco-friendly lifestyle!",
        type: "info"
      };
    }

    if (highest.id === "transport") {
      if (calculatorData.transportType === "gasoline" || calculatorData.transportType === "diesel") {
        return {
          text: `🚗 Commuting with your ${calculatorData.transportType === "gasoline" ? "Gasoline" : "Diesel"} Car is your top emission source. Swapping 2 trips a week to public transit or cycling would save up to 1.1 tons of CO2/yr!`,
          type: "warning"
        };
      }
      return {
        text: `🚲 Commute emissions represent your highest category (${highest.value} Tons). Reducing weekly travel distance or carpooling can lower this further.`,
        type: "warning"
      };
    }
    
    if (highest.id === "electricity") {
      if (calculatorData.renewableRatio < 50) {
        return {
          text: `⚡ Grid electricity is your top emission source. Increasing your Renewable Share to 50% or unplugging vampire electronics can save over 0.8 tons of CO2/yr!`,
          type: "warning"
        };
      }
      return {
        text: `💡 Energy consumption is your highest category. Swapping to LED bulbs and washing laundry in cold water will trim this footprint.`,
        type: "warning"
      };
    }
    
    if (highest.id === "diet") {
      if (calculatorData.dietType === "heavy_meat" || calculatorData.dietType === "average_meat") {
        return {
          text: `🥩 Dietary choices (meat consumption) represent your highest emissions. Going meat-free just 3 days a week offsets up to 1.2 Tons of CO2/yr!`,
          type: "warning"
        };
      }
      return {
        text: `🥦 Diet is your highest emission category. Try sourcing more ingredients locally (currently at ${calculatorData.localFoodRatio}%) to lower shipping emissions.`,
        type: "warning"
      };
    }
    
    if (highest.id === "shopping") {
      if (calculatorData.shoppingClothing > 3) {
        return {
          text: `🛍️ New clothing purchases represent your highest footprint. Thrifting or reducing clothing shopping by half can save up to 0.5 tons of CO2/yr!`,
          type: "warning"
        };
      }
      return {
        text: `💻 Hardware upgrades represent your highest footprint. Extending tech life cycles for an extra year reduces e-waste and manufacturing emissions.`,
        type: "warning"
      };
    }
    
    return {
      text: "🗑️ Waste disposal is your highest emission category. Segregating plastics and starting home organic composting will offset up to 0.25 tons of CO2/yr!",
      type: "warning"
    };
  };

  const smartReminder = getSmartReminder();

  // Navigation Options
  const navItems = [
    { id: "calculator", label: "Footprint Calculator", icon: Calculator, desc: "Log carbon variables" },
    { id: "insights", label: "AI Eco Insights", icon: BrainCircuit, desc: "Personalized recommendations" },
    { id: "progress", label: "Progress & History", icon: LineChart, desc: "Streak, charts & badges" },
    { id: "challenges", label: "Challenges & Habits", icon: Trophy, desc: "Daily habits & missions" },
    { id: "profile", label: "Eco Profile", icon: User, desc: "Level & stats showcase" },
  ] as const;

  const renderActiveContent = () => {
    switch (activeTab) {
      case "calculator":
        return <CarbonCalculator />;
      case "insights":
        return <AIInsights />;
      case "progress":
        return <ProgressDashboard />;
      case "challenges":
        return <EcoChallenges />;
      case "profile":
        return <UserProfileView />;
      default:
        return <CarbonCalculator />;
    }
  };

  if (!mounted) {
    return (
      <div className="relative min-h-screen bg-eco-bg text-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-eco-green"></div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="relative min-h-screen bg-eco-bg text-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-eco-green"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen bg-eco-bg text-gray-100 flex flex-col">
        {/* Background aesthetics */}
        <div className="absolute inset-0 -z-20 bg-grid-cyber opacity-50"></div>
        <div className="absolute top-10 right-10 -z-10 h-72 w-72 rounded-full bg-eco-green/5 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 -z-10 h-80 w-80 rounded-full bg-eco-cyan/5 blur-[120px] pointer-events-none"></div>

        <Navbar />
        <div className="flex-1 flex items-center justify-center py-12">
          <AuthView />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-eco-bg text-gray-100 flex flex-col">
      {/* Background aesthetics */}
      <div className="absolute inset-0 -z-20 bg-grid-cyber opacity-50"></div>
      <div className="absolute top-10 right-10 -z-10 h-72 w-72 rounded-full bg-eco-green/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 -z-10 h-80 w-80 rounded-full bg-eco-cyan/5 blur-[120px] pointer-events-none"></div>

      <Navbar />

      {/* Main Dashboard Content Wrapper */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Left Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-2">
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest px-3 mb-2 block">
              Workspace Options
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full rounded-xl px-3 py-3 text-left transition-all duration-200 border ${
                    isActive 
                      ? "bg-eco-green/10 border-eco-green/35 text-white font-medium shadow-[0_0_12px_rgba(16,185,129,0.08)]"
                      : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-eco-green" : "text-gray-400"}`} />
                  <div className="flex flex-col">
                    <span className="text-sm">{item.label}</span>
                    <span className="text-[10px] text-gray-500 line-clamp-1">{item.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Top Scrollable Tab Navigation (Mobile/Tablet) */}
        <nav className="lg:hidden flex overflow-x-auto pb-2 gap-2 scrollbar-none shrink-0">
          <div className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-3 border text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                    isActive 
                      ? "bg-eco-green/10 border-eco-green text-eco-green-light"
                      : "border-gray-800/80 bg-[#0d1321]/30 text-gray-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content Panel Area */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">
          {smartReminder && (
            <div className="glass-panel rounded-2xl p-4 border-eco-cyan/15 bg-eco-cyan/5 relative overflow-hidden flex items-start gap-3 animate-fadeIn">
              <div className="absolute top-0 left-0 w-1 h-full bg-eco-cyan"></div>
              <span className="text-lg">💡</span>
              <div className="flex-1">
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest block mb-0.5">Smart Nudge</span>
                <p className="text-xs text-gray-300 leading-relaxed">{smartReminder.text}</p>
              </div>
            </div>
          )}
          
          <div className="flex-1 flex flex-col">
            {renderActiveContent()}
          </div>
        </main>

      </div>
    </div>
  );
}
