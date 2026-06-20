"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowRight, ShieldCheck, Zap, Activity, Globe, Compass, BarChart3 } from "lucide-react";

export default function Home() {
  const [mockTransport, setMockTransport] = useState<"gasoline" | "electric" | "bike">("gasoline");
  const [mockDistance, setMockDistance] = useState<number>(150);

  // Quick estimation logic for the interactive widget
  const getMockCO2 = () => {
    let factor = 0.18; // kg/km gasoline
    if (mockTransport === "electric") factor = 0.04;
    if (mockTransport === "bike") factor = 0;
    const weeklyKg = mockDistance * factor;
    const annualTons = (weeklyKg * 52) / 1000;
    return annualTons.toFixed(2);
  };

  return (
    <div className="relative min-h-screen bg-eco-bg text-gray-100 flex flex-col">
      {/* Background Grids and Blobs */}
      <div className="absolute inset-0 -z-20 bg-grid-cyber opacity-75"></div>
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-eco-green/10 blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-eco-cyan/10 blur-[150px] animate-pulse-slow"></div>

      <Navbar />

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/50 px-4 py-1.5 text-xs font-semibold text-eco-green-light tracking-wide mb-6">
            <ShieldCheck className="h-3.5 w-3.5 text-eco-green" />
            <span>Track your impact and build sustainable habits</span>
          </div>

          {/* Heading */}
          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl font-sans text-white leading-tight">
            Small daily choices<br />
            create <span className="bg-gradient-to-r from-eco-green via-emerald-400 to-eco-cyan bg-clip-text text-transparent">lasting impact</span>.
          </h1>

          {/* Subheading */}
          <p className="mt-6 max-w-2xl text-base sm:text-lg text-gray-400">
            Track your habits, understand your footprint, and discover simple ways to live more sustainably.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan px-8 py-4 text-base font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-102 transition-all duration-300"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#mission"
              className="rounded-xl border border-gray-800 bg-[#0d1321]/40 px-8 py-4 text-base font-semibold text-gray-300 hover:bg-[#0d1321]/80 hover:border-gray-700 transition-all duration-300"
            >
              See How It Works
            </a>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-20 grid w-full grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl">
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 text-left flex flex-col justify-between h-48 border-eco-green/10">
              <div className="text-2xl mb-1">🌱</div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wider mb-1.5">Track Your Habits</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Monitor transport, food, energy, and lifestyle choices.
                </p>
              </div>
            </div>
            
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 text-left flex flex-col justify-between h-48 border-eco-cyan/15 bg-eco-cyan/5">
              <div className="text-2xl mb-1">🤖</div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wider mb-1.5">Discover Improvements</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Get personalized recommendations based on your habits.
                </p>
              </div>
            </div>

            <div className="glass-panel glass-panel-hover rounded-2xl p-6 text-left flex flex-col justify-between h-48 border-eco-green/10">
              <div className="text-2xl mb-1">🎯</div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wider mb-1.5">See Your Progress</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Track streaks, goals, achievements, and long-term improvements.
                </p>
              </div>
            </div>
          </div>

          {/* Core Mission Subtitle */}
          <p className="mt-6 text-xs text-gray-500 font-medium font-sans">
            Built to help people make more sustainable everyday choices.
          </p>
        </section>

        {/* Quick Simulator Showcase Section */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="glass-panel rounded-3xl p-8 md:p-12 border border-eco-green/20 relative overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Design accents */}
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-eco-cyan/5 blur-3xl"></div>
            
            <div>
              <div className="flex items-center gap-2 text-eco-green mb-3">
                <BarChart3 className="h-5 w-5" />
                <span className="font-mono text-xs uppercase tracking-widest font-semibold">Real-Time Tracker</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
                Footprint Projection
              </h2>
              <p className="mt-4 text-gray-400">
                Adjust the simulation inputs to test how simple modifications in commute methods dramatically reduce annual emissions. The calculator uses EPA compliance factors.
              </p>

              {/* Slider Input */}
              <div className="mt-8 space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-gray-300">Commute Distance</span>
                    <span className="text-eco-green-light font-mono">{mockDistance} km/week</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={mockDistance}
                    onChange={(e) => setMockDistance(Number(e.target.value))}
                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-eco-green"
                  />
                </div>

                {/* Transport Select */}
                <div>
                  <span className="block text-sm font-semibold text-gray-300 mb-2">Drive Type</span>
                  <div className="grid grid-cols-3 gap-3">
                    {(["gasoline", "electric", "bike"] as const).map((type) => (
                      <button
                        key={type}
                        suppressHydrationWarning
                        onClick={() => setMockTransport(type)}
                        className={`rounded-xl py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-300 border ${
                          mockTransport === type
                            ? "bg-eco-green/10 border-eco-green text-eco-green-light shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "border-gray-800 bg-[#0d1321]/30 text-gray-400 hover:border-gray-700"
                        }`}
                      >
                        {type === "bike" ? "Walk / Bike" : type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Output Card */}
            <div className="glass-panel rounded-2xl p-8 border-eco-cyan/20 flex flex-col justify-between h-72 relative">
              <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-eco-cyan/15 px-2 py-0.5 text-[10px] font-mono font-semibold text-eco-cyan uppercase">
                <Globe className="h-3 w-3" />
                <span>Simulation Active</span>
              </div>

              <div>
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest block">Projected Footprint</span>
                <span className="mt-2 text-5xl sm:text-6xl font-extrabold text-white tracking-tight font-mono">
                  {getMockCO2()} <span className="text-lg text-gray-500 font-sans font-medium">Tons CO2/yr</span>
                </span>
              </div>

              <div className="border-t border-gray-800/80 pt-4 flex justify-between items-center text-xs sm:text-sm">
                <span className="text-gray-400">Equivalent To</span>
                <span className="text-eco-cyan-light font-semibold font-mono">
                  {Math.round(Number(getMockCO2()) * 16.5)} Seedling Trees Planted
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Sustainability Mission / Features Section */}
        <section id="mission" className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-gray-900/60 bg-eco-dark/20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Equipped with Advanced Eco-Tech
            </h2>
            <p className="mt-4 text-gray-400">
              Our core processing engine is engineered to calculate precise footprints and gamify habit-building using localized algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tech 1 */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6">
              <div className="h-12 w-12 rounded-xl bg-eco-green/10 border border-eco-green/20 flex items-center justify-center text-eco-green mb-4">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">5-Sector Tracker</h3>
              <p className="text-sm text-gray-400">
                Granular tracking variables covering Transportation, Energy grid details, Food choices, Consumer shopping habits, and Waste recycling.
              </p>
            </div>

            {/* Tech 2 */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 border-eco-cyan/20">
              <div className="h-12 w-12 rounded-xl bg-eco-cyan/10 border border-eco-cyan/20 flex items-center justify-center text-eco-cyan mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Trend Analytics</h3>
              <p className="text-sm text-gray-400">
                Visualize emission data points over historical months to track active progress, level multipliers, and carbon reduction trajectories.
              </p>
            </div>

            {/* Tech 3 */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6">
              <div className="h-12 w-12 rounded-xl bg-eco-green/10 border border-eco-green/20 flex items-center justify-center text-eco-green mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Eco Badges</h3>
              <p className="text-sm text-gray-400">
                Earn levels, maintain daily habit streaks, and unlock unique showcase cabinet achievements for reducing your footprint.
              </p>
            </div>

            {/* Tech 4 */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 border-eco-cyan/20">
              <div className="h-12 w-12 rounded-xl bg-eco-cyan/10 border border-eco-cyan/20 flex items-center justify-center text-eco-cyan mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Global Simulator</h3>
              <p className="text-sm text-gray-400">
                Visualize hypothetical scenarios such as the planetary impact if everyone lived with your carbon statistics.
              </p>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="glass-panel rounded-3xl p-10 md:p-16 border-eco-cyan/10 relative overflow-hidden flex flex-col items-center">
            <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-eco-cyan/5 blur-3xl"></div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Ready to initialize your eco profile?
            </h2>
            <p className="mt-4 max-w-xl text-gray-400">
              Set up your profile, compute your carbon parameters, and start your sustainability streak today. 100% locally persisted inside your client sandbox.
            </p>
            <div className="mt-10">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan px-8 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.55)] hover:scale-105 transition-all duration-300"
              >
                <span>Access Eco Suite</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900/60 bg-eco-dark/40 py-8 text-center text-xs text-gray-500">
        <p>© 2026 EcoTrack AI. Helping people build sustainable habits.</p>
      </footer>
    </div>
  );
}
