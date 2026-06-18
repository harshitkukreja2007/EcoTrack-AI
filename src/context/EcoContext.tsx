"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Interfaces
export interface CalculatorData {
  transportDistance: number; // km per week
  transportType: "gasoline" | "diesel" | "hybrid" | "electric" | "public" | "bike_walk";
  electricityUsage: number; // kWh per month
  renewableRatio: number; // 0 to 100 (%)
  dietType: "vegan" | "vegetarian" | "pescatarian" | "average_meat" | "heavy_meat";
  localFoodRatio: number; // 0 to 100 (%)
  shoppingClothing: number; // items per month
  shoppingTech: number; // items per year
  wasteRecycling: boolean;
  wasteComposting: boolean;
}

export interface Habit {
  id: string;
  name: string;
  category: "transport" | "energy" | "diet" | "shopping" | "lifestyle";
  co2Saved: number; // kg of CO2e
  xpReward: number;
  completed: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  co2Saved: number; // kg of CO2e
  xpReward: number;
  duration: string;
  category: string;
  status: "available" | "active" | "completed";
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface HistoryEntry {
  date: string;
  co2Output: number; // tons/year
  ecoScore: number;
}

export interface UserProfile {
  username: string;
  avatar: string;
  level: number;
  xp: number;
  totalCo2Saved: number; // in kg
  streak: number;
  lastActiveDate: string | null;
}

interface EcoContextType {
  user: User | null;
  authLoading: boolean;
  dbSyncing: boolean;
  profile: UserProfile;
  calculatorData: CalculatorData;
  habits: Habit[];
  challenges: Challenge[];
  badges: Badge[];
  history: HistoryEntry[];
  carbonBreakdown: {
    transport: number;
    electricity: number;
    diet: number;
    shopping: number;
    waste: number;
    total: number;
  };
  ecoScore: number;
  updateCalculator: (data: Partial<CalculatorData>) => void;
  toggleHabit: (id: string) => void;
  acceptChallenge: (id: string) => void;
  completeChallenge: (id: string) => void;
  updateProfile: (username: string, avatar: string) => void;
  addXP: (amount: number) => void;
  saveCurrentToHistory: () => void;
  resetAllData: () => void;
}

const defaultCalculatorData: CalculatorData = {
  transportDistance: 120,
  transportType: "gasoline",
  electricityUsage: 250,
  renewableRatio: 10,
  dietType: "average_meat",
  localFoodRatio: 20,
  shoppingClothing: 3,
  shoppingTech: 2,
  wasteRecycling: true,
  wasteComposting: false,
};

const defaultHabits: Habit[] = [
  { id: "h1", name: "Commute by Bike or Walking", category: "transport", co2Saved: 3.5, xpReward: 25, completed: false },
  { id: "h2", name: "Use Public Transportation", category: "transport", co2Saved: 2.2, xpReward: 15, completed: false },
  { id: "h3", name: "Unplug standby electronics", category: "energy", co2Saved: 0.8, xpReward: 10, completed: false },
  { id: "h4", name: "Eat completely plant-based meals today", category: "diet", co2Saved: 2.5, xpReward: 20, completed: false },
  { id: "h5", name: "Wash clothes in cold water", category: "energy", co2Saved: 0.9, xpReward: 10, completed: false },
  { id: "h6", name: "Bring reusable shopping bags", category: "shopping", co2Saved: 0.5, xpReward: 5, completed: false },
  { id: "h7", name: "Avoid food waste entirely", category: "diet", co2Saved: 1.2, xpReward: 15, completed: false },
];

const defaultChallenges: Challenge[] = [
  { id: "c1", name: "Zero Emission Weekend", description: "Use only biking, walking, or electric public transit for all transportation over the weekend.", co2Saved: 18.0, xpReward: 150, duration: "2 days", category: "transport", status: "available" },
  { id: "c2", name: "Meat-Free Week", description: "Commit to eating only vegetarian or vegan meals for 7 full days.", co2Saved: 21.0, xpReward: 200, duration: "7 days", category: "diet", status: "available" },
  { id: "c3", name: "Vampire Power Shutdown", description: "Unplug all electronics and appliances that aren't in active use for a week.", co2Saved: 6.5, xpReward: 100, duration: "7 days", category: "energy", status: "available" },
  { id: "c4", name: "Zero Fashion Purchase", description: "Avoid purchasing any clothing, footwear, or accessories for the next 30 days.", co2Saved: 25.0, xpReward: 250, duration: "30 days", category: "shopping", status: "available" },
  { id: "c5", name: "Zero-Waste Lifestyle", description: "Ensure 100% of recyclable waste is recycled and compost all organic kitchen scraps for a week.", co2Saved: 8.0, xpReward: 120, duration: "7 days", category: "lifestyle", status: "available" },
];

const defaultBadges: Badge[] = [
  { id: "b1", name: "Eco Recruit", description: "Complete your first carbon footprint audit.", icon: "🌱", unlocked: false, unlockedAt: null },
  { id: "b2", name: "Habit Builder", description: "Log daily sustainable habits for the first time.", icon: "⚡", unlocked: false, unlockedAt: null },
  { id: "b3", name: "Streak Starter", description: "Maintain a 3-day habits streak.", icon: "🔥", unlocked: false, unlockedAt: null },
  { id: "b4", name: "Carbon Cutter", description: "Save a cumulative total of 50 kg of CO2 emissions.", icon: "✂️", unlocked: false, unlockedAt: null },
  { id: "b5", name: "Climate Guardian", description: "Reach Level 5 on EcoTrack AI.", icon: "🛡️", unlocked: false, unlockedAt: null },
  { id: "b6", name: "Grandmaster Chef", description: "Adopt a plant-based diet plan with high local food percentage.", icon: "🥦", unlocked: false, unlockedAt: null },
];

const defaultHistory: HistoryEntry[] = [
  { date: "Feb 2026", co2Output: 11.2, ecoScore: 50 },
  { date: "Mar 2026", co2Output: 9.8, ecoScore: 56 },
  { date: "Apr 2026", co2Output: 8.5, ecoScore: 62 },
  { date: "May 2026", co2Output: 7.2, ecoScore: 68 },
];

const defaultProfile: UserProfile = {
  username: "Eco Warrior",
  avatar: "avatar-1",
  level: 1,
  xp: 0,
  totalCo2Saved: 0,
  streak: 0,
  lastActiveDate: null,
};

const EcoContext = createContext<EcoContextType | undefined>(undefined);

export const EcoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbSyncing, setDbSyncing] = useState(false);

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [calculatorData, setCalculatorData] = useState<CalculatorData>(defaultCalculatorData);
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [challenges, setChallenges] = useState<Challenge[]>(defaultChallenges);
  const [badges, setBadges] = useState<Badge[]>(defaultBadges);
  const [history, setHistory] = useState<HistoryEntry[]>(defaultHistory);

  const [isLoaded, setIsLoaded] = useState(false);

  // Monitor Authentication and Load Initial Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(true);
      setIsLoaded(false);

      if (firebaseUser) {
        // Authenticated: Load from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profile) setProfile(data.profile);
            if (data.calculatorData) setCalculatorData(data.calculatorData);
            if (data.habits) setHabits(data.habits);
            if (data.challenges) setChallenges(data.challenges);
            if (data.badges) setBadges(data.badges);
            if (data.history) setHistory(data.history);
          } else {
            // Document does not exist: Initialize Firestore with defaults
            await setDoc(userDocRef, {
              profile: defaultProfile,
              calculatorData: defaultCalculatorData,
              habits: defaultHabits,
              challenges: defaultChallenges,
              badges: defaultBadges,
              history: defaultHistory,
            });
          }
        } catch (err) {
          console.error("Firestore initialization read error:", err);
        }
      } else {
        // Unauthenticated: Fallback to localStorage
        try {
          const storedProfile = localStorage.getItem("ecotrack_profile");
          const storedCalculator = localStorage.getItem("ecotrack_calculatorData") || localStorage.getItem("ecotrack_calculator");
          const storedHabits = localStorage.getItem("ecotrack_habits");
          const storedChallenges = localStorage.getItem("ecotrack_challenges");
          const storedBadges = localStorage.getItem("ecotrack_badges");
          const storedHistory = localStorage.getItem("ecotrack_history");

          if (storedProfile) setProfile(JSON.parse(storedProfile));
          if (storedCalculator) setCalculatorData(JSON.parse(storedCalculator));
          if (storedHabits) setHabits(JSON.parse(storedHabits));
          if (storedChallenges) setChallenges(JSON.parse(storedChallenges));
          if (storedBadges) setBadges(JSON.parse(storedBadges));
          if (storedHistory) setHistory(JSON.parse(storedHistory));
        } catch (e) {
          console.error("Failed to load local storage data fallback:", e);
        }
      }
      setAuthLoading(false);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  // Sync to database or localStorage on state changes
  const saveField = useCallback(async (fieldName: string, data: unknown) => {
    if (!isLoaded) return;
    if (auth.currentUser) {
      setTimeout(() => setDbSyncing(true), 0);
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, { [fieldName]: data });
      } catch (err) {
        console.error(`Firestore save error on ${fieldName}:`, err);
      } finally {
        setTimeout(() => setDbSyncing(false), 0);
      }
    } else {
      localStorage.setItem(`ecotrack_${fieldName}`, JSON.stringify(data));
    }
  }, [isLoaded]);

  useEffect(() => {
    saveField("profile", profile);
  }, [profile, saveField]);

  useEffect(() => {
    saveField("calculatorData", calculatorData);
  }, [calculatorData, saveField]);

  useEffect(() => {
    saveField("habits", habits);
  }, [habits, saveField]);

  useEffect(() => {
    saveField("challenges", challenges);
  }, [challenges, saveField]);

  useEffect(() => {
    saveField("badges", badges);
  }, [badges, saveField]);

  useEffect(() => {
    saveField("history", history);
  }, [history, saveField]);

  // Carbon Emission Models (Annual Metric Tons CO2e)
  const calculateCarbon = () => {
    // 1. Transportation
    let transportFactor = 0.18; // kg/km (gasoline)
    if (calculatorData.transportType === "diesel") transportFactor = 0.17;
    else if (calculatorData.transportType === "hybrid") transportFactor = 0.10;
    else if (calculatorData.transportType === "electric") transportFactor = 0.04;
    else if (calculatorData.transportType === "public") transportFactor = 0.05;
    else if (calculatorData.transportType === "bike_walk") transportFactor = 0;

    const transportEmissions = (calculatorData.transportDistance * 52 * transportFactor) / 1000;

    // 2. Electricity
    const gridIntensity = 0.38; // kg CO2/kWh
    const electricityEmissions = 
      (calculatorData.electricityUsage * 12 * gridIntensity * (1 - calculatorData.renewableRatio / 100)) / 1000;

    // 3. Diet
    let dietBase = 2.5; // tons/year (average meat eater)
    if (calculatorData.dietType === "heavy_meat") dietBase = 3.3;
    else if (calculatorData.dietType === "pescatarian") dietBase = 2.0;
    else if (calculatorData.dietType === "vegetarian") dietBase = 1.7;
    else if (calculatorData.dietType === "vegan") dietBase = 1.5;

    // Local food ratio discount (reduces up to 10% of diet footprint)
    const dietEmissions = dietBase * (1 - 0.1 * (calculatorData.localFoodRatio / 100));

    // 4. Shopping
    const clothingEmissions = (calculatorData.shoppingClothing * 12 * 15) / 1000; // 15kg CO2 per clothing item
    const techEmissions = (calculatorData.shoppingTech * 150) / 1000; // 150kg CO2 per tech item
    const shoppingEmissions = clothingEmissions + techEmissions;

    // 5. Waste & Lifestyle
    let wasteBase = 0.8; // tons/year
    if (calculatorData.wasteRecycling) wasteBase -= 0.15;
    if (calculatorData.wasteComposting) wasteBase -= 0.10;
    const wasteEmissions = Math.max(0.2, wasteBase);

    const totalEmissions = transportEmissions + electricityEmissions + dietEmissions + shoppingEmissions + wasteEmissions;

    return {
      transport: parseFloat(transportEmissions.toFixed(2)),
      electricity: parseFloat(electricityEmissions.toFixed(2)),
      diet: parseFloat(dietEmissions.toFixed(2)),
      shopping: parseFloat(shoppingEmissions.toFixed(2)),
      waste: parseFloat(wasteEmissions.toFixed(2)),
      total: parseFloat(totalEmissions.toFixed(2)),
    };
  };

  const carbonBreakdown = calculateCarbon();

  // Eco Score: Higher footprint -> lower score.
  // 2.0 tons -> ~100. 16.0+ tons -> ~10.
  const calculateEcoScore = (totalCo2: number) => {
    return Math.max(10, Math.min(100, Math.round(100 - (totalCo2 / 16.0) * 85)));
  };

  const ecoScore = calculateEcoScore(carbonBreakdown.total);

  // Helper: Trigger unlocks when credentials change
  const checkBadgeUnlocks = (
    currentProfile: UserProfile,
    currentBadges: Badge[],
    currentCalc: CalculatorData
  ) => {
    let updated = false;
    const dateStr = new Date().toLocaleDateString();

    const newBadges = currentBadges.map((badge) => {
      if (badge.unlocked) return badge;

      let shouldUnlock = false;

      if (badge.id === "b1") {
        // Unlocks on completing carbon footprint audit (any input change counts)
        shouldUnlock = true;
      } else if (badge.id === "b2" && currentProfile.totalCo2Saved > 0) {
        shouldUnlock = true;
      } else if (badge.id === "b3" && currentProfile.streak >= 3) {
        shouldUnlock = true;
      } else if (badge.id === "b4" && currentProfile.totalCo2Saved >= 50) {
        shouldUnlock = true;
      } else if (badge.id === "b5" && currentProfile.level >= 5) {
        shouldUnlock = true;
      } else if (badge.id === "b6" && (currentCalc.dietType === "vegan" || currentCalc.dietType === "vegetarian") && currentCalc.localFoodRatio >= 50) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        updated = true;
        return { ...badge, unlocked: true, unlockedAt: dateStr };
      }
      return badge;
    });

    return { updated, badges: newBadges };
  };

  // State Updates
  const updateCalculator = (newData: Partial<CalculatorData>) => {
    setCalculatorData((prev) => {
      const next = { ...prev, ...newData };
      // Check badge b1 on calculator edit
      const badgeCheck = checkBadgeUnlocks(profile, badges, next);
      if (badgeCheck.updated) {
        setBadges(badgeCheck.badges);
      }
      return next;
    });
  };

  const addXP = (amount: number) => {
    setProfile((prev) => {
      let nextXp = prev.xp + amount;
      let nextLevel = prev.level;
      const xpNeeded = nextLevel * 100; // 100 XP * level needed to level up

      if (nextXp >= xpNeeded) {
        nextXp -= xpNeeded;
        nextLevel += 1;
      }

      const updatedProfile = { ...prev, xp: nextXp, level: nextLevel };
      const badgeCheck = checkBadgeUnlocks(updatedProfile, badges, calculatorData);
      if (badgeCheck.updated) {
        setBadges(badgeCheck.badges);
      }
      return updatedProfile;
    });
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toDateString();
    let co2ToSave = 0;
    let xpToGain = 0;

    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === id) {
          const nextState = !habit.completed;
          if (nextState) {
            co2ToSave += habit.co2Saved;
            xpToGain += habit.xpReward;
          } else {
            co2ToSave -= habit.co2Saved;
            xpToGain -= habit.xpReward;
          }
          return { ...habit, completed: nextState };
        }
        return habit;
      })
    );

    // Update profile total saved, streak, and XP
    if (co2ToSave !== 0 || xpToGain !== 0) {
      setProfile((prev) => {
        const isCompletedAction = co2ToSave > 0;
        let nextStreak = prev.streak;
        
        if (isCompletedAction) {
          if (prev.lastActiveDate !== today) {
            // Check if last active was yesterday to maintain streak, or new day
            const lastActive = prev.lastActiveDate ? new Date(prev.lastActiveDate) : null;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (!lastActive || lastActive.toDateString() === yesterday.toDateString()) {
              nextStreak += 1;
            } else if (lastActive.toDateString() !== today) {
              nextStreak = 1;
            }
          }
        }

        const updatedProfile = {
          ...prev,
          totalCo2Saved: Math.max(0, parseFloat((prev.totalCo2Saved + co2ToSave).toFixed(1))),
          streak: nextStreak,
          lastActiveDate: isCompletedAction ? today : prev.lastActiveDate,
        };

        // Check locks
        const badgeCheck = checkBadgeUnlocks(updatedProfile, badges, calculatorData);
        if (badgeCheck.updated) {
          setBadges(badgeCheck.badges);
        }

        return updatedProfile;
      });

      if (xpToGain > 0) {
        addXP(xpToGain);
      }
    }
  };

  const acceptChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((challenge) =>
        challenge.id === id ? { ...challenge, status: "active" as const } : challenge
      )
    );
  };

  const completeChallenge = (id: string) => {
    let co2ToSave = 0;
    let xpToGain = 0;

    setChallenges((prev) =>
      prev.map((challenge) => {
        if (challenge.id === id && challenge.status === "active") {
          co2ToSave = challenge.co2Saved;
          xpToGain = challenge.xpReward;
          return { ...challenge, status: "completed" as const };
        }
        return challenge;
      })
    );

    if (co2ToSave > 0) {
      setProfile((prev) => {
        const updated = {
          ...prev,
          totalCo2Saved: parseFloat((prev.totalCo2Saved + co2ToSave).toFixed(1)),
        };
        const badgeCheck = checkBadgeUnlocks(updated, badges, calculatorData);
        if (badgeCheck.updated) {
          setBadges(badgeCheck.badges);
        }
        return updated;
      });
      addXP(xpToGain);
    }
  };

  const updateProfile = (username: string, avatar: string) => {
    setProfile((prev) => ({ ...prev, username, avatar }));
  };

  const saveCurrentToHistory = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    
    // Check if this month already exists in history
    setHistory((prev) => {
      const filtered = prev.filter((entry) => entry.date !== formattedDate);
      return [...filtered, { date: formattedDate, co2Output: carbonBreakdown.total, ecoScore }];
    });
  };

  const resetAllData = () => {
    setProfile(defaultProfile);
    setCalculatorData(defaultCalculatorData);
    setHabits(defaultHabits);
    setChallenges(defaultChallenges);
    setBadges(defaultBadges);
    setHistory(defaultHistory);
    localStorage.clear();
  };

  return (
    <EcoContext.Provider
      value={{
        user,
        authLoading,
        dbSyncing,
        profile,
        calculatorData,
        habits,
        challenges,
        badges,
        history,
        carbonBreakdown,
        ecoScore,
        updateCalculator,
        toggleHabit,
        acceptChallenge,
        completeChallenge,
        updateProfile,
        addXP,
        saveCurrentToHistory,
        resetAllData,
      }}
    >
      {children}
    </EcoContext.Provider>
  );
};

export const useEco = () => {
  const context = useContext(EcoContext);
  if (context === undefined) {
    throw new Error("useEco must be used within an EcoProvider");
  }
  return context;
};
