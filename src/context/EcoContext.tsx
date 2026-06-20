"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { calculateCarbonFootprint, calculateEcoScore, CalculatorData, CarbonBreakdown } from "@/lib/carbonUtils";

export type { CalculatorData, CarbonBreakdown };

// Interfaces

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
  difficulty?: "easy" | "medium" | "hard";
  status: "available" | "active" | "completed";
}

export interface ChallengeHistoryEntry {
  id: string;
  name: string;
  category: string;
  co2Saved: number;
  xpReward: number;
  completedAt: string;
  completedTimestamp: number;
  weekStart?: string;
  weekEnd?: string;
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
  displayName?: string;
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
  challengeHistory: ChallengeHistoryEntry[];
  challengesWeekStart: string | null;
  challengesWeekEnd: string | null;
  weeklyChallengesStreak: number;
  longestChallengeStreak: number;
  totalWeeksFullyCompleted: number;
  lastHabitsResetDate: string | null;
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
  updateProfile: (avatar: string) => void;
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
  { id: "c_transport_easy", name: "Public Transport Trip", description: "Use subway, bus, or rail transit for at least one commute trip today.", co2Saved: 2.0, xpReward: 20, category: "transport", duration: "1 day", difficulty: "easy", status: "available" },
  { id: "c_food_medium", name: "Meat-Free 3-Day Sprint", description: "Eat only vegetarian or vegan meals for 3 days this week.", co2Saved: 8.0, xpReward: 75, category: "food", duration: "3 days", difficulty: "medium", status: "available" },
  { id: "c_waste_hard", name: "Plastic-Free Week", description: "Avoid purchasing single-use plastics and packaging for 7 days.", co2Saved: 15.0, xpReward: 150, category: "waste", duration: "7 days", difficulty: "hard", status: "available" },
];

const defaultBadges: Badge[] = [
  { id: "b1", name: "Eco Recruit", description: "Complete your first carbon footprint audit.", icon: "🌱", unlocked: false, unlockedAt: null },
  { id: "b2", name: "Habit Builder", description: "Log daily sustainable habits for the first time.", icon: "⚡", unlocked: false, unlockedAt: null },
  { id: "b3", name: "Streak Starter", description: "Maintain a 3-day habits streak.", icon: "🔥", unlocked: false, unlockedAt: null },
  { id: "b4", name: "Carbon Cutter", description: "Save a cumulative total of 50 kg of CO2 emissions.", icon: "✂️", unlocked: false, unlockedAt: null },
  { id: "b5", name: "Climate Guardian", description: "Reach Level 5 on EcoTrack AI.", icon: "🛡️", unlocked: false, unlockedAt: null },
  { id: "b6", name: "Grandmaster Chef", description: "Adopt a plant-based diet plan with high local food percentage.", icon: "🥦", unlocked: false, unlockedAt: null },
  { id: "b7", name: "Bronze Challenger", description: "Complete all challenges in a single week fully.", icon: "🥉", unlocked: false, unlockedAt: null },
  { id: "b8", name: "Silver Challenger", description: "Complete all challenges in 4 weeks fully.", icon: "🥈", unlocked: false, unlockedAt: null },
  { id: "b9", name: "Gold Challenger", description: "Complete all challenges in 12 weeks fully.", icon: "🥇", unlocked: false, unlockedAt: null },
  { id: "b10", name: "Eco Master Challenger", description: "Complete all challenges in 24 weeks fully.", icon: "👑", unlocked: false, unlockedAt: null },
];

const defaultHistory: HistoryEntry[] = [
  { date: "Feb 2026", co2Output: 11.2, ecoScore: 50 },
  { date: "Mar 2026", co2Output: 9.8, ecoScore: 56 },
  { date: "Apr 2026", co2Output: 8.5, ecoScore: 62 },
  { date: "May 2026", co2Output: 7.2, ecoScore: 68 },
];

const defaultProfile: UserProfile = {
  username: "Eco Warrior",
  displayName: "Eco Warrior",
  avatar: "avatar-1",
  level: 1,
  xp: 0,
  totalCo2Saved: 0,
  streak: 0,
  lastActiveDate: null,
};

const CHALLENGE_POOL = [
  // Easy
  { name: "Public Transport Trip", description: "Use subway, bus, or rail transit for at least one commute trip today.", co2Saved: 2.0, xpReward: 20, category: "transport", duration: "1 day", difficulty: "easy" as const },
  { name: "Day of Recycling", description: "Segregate all recyclable paper, plastics, and glass waste today.", co2Saved: 1.0, xpReward: 15, category: "waste", duration: "1 day", difficulty: "easy" as const },
  { name: "Quick Shower Challenge", description: "Take a shower under 5 minutes today to save water and heating energy.", co2Saved: 1.0, xpReward: 15, category: "water", duration: "1 day", difficulty: "easy" as const },
  
  // Medium
  { name: "Public Transport Week", description: "Use public transit for all commute travels this week.", co2Saved: 15.0, xpReward: 120, category: "transport", duration: "7 days", difficulty: "medium" as const },
  { name: "Meat-Free 3-Day Sprint", description: "Eat only vegetarian or vegan meals for 3 days this week.", co2Saved: 8.0, xpReward: 75, category: "food", duration: "3 days", difficulty: "medium" as const },
  { name: "Energy Saver Week", description: "Turn off standby appliances and switch off idle lights for a week.", co2Saved: 8.0, xpReward: 70, category: "energy", duration: "7 days", difficulty: "medium" as const },
  { name: "Zero Waste Week", description: "Segregate all recyclable items and compost organic waste for 7 days.", co2Saved: 8.0, xpReward: 80, category: "waste", duration: "7 days", difficulty: "medium" as const },
  
  // Hard
  { name: "Meat-Free Week", description: "Commit to eating vegetarian or vegan meals for 7 consecutive days.", co2Saved: 21.0, xpReward: 200, category: "food", duration: "7 days", difficulty: "hard" as const },
  { name: "Car-Free Week", description: "Avoid driving any gasoline or diesel cars for a full week.", co2Saved: 25.0, xpReward: 220, category: "transport", duration: "7 days", difficulty: "hard" as const },
  { name: "Plastic-Free Week", description: "Avoid purchasing single-use plastics and packaging for 7 days.", co2Saved: 15.0, xpReward: 150, category: "waste", duration: "7 days", difficulty: "hard" as const },
  { name: "Sustainable Shopping Month", description: "Avoid buying new clothing or tech devices for the next 30 days.", co2Saved: 30.0, xpReward: 250, category: "shopping", duration: "30 days", difficulty: "hard" as const }
];

const getMondayOfCurrentWeek = (d: Date) => {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(copy.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getSundayOfCurrentWeek = (monday: Date) => {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};

const selectWeeklyChallenges = (
  prevChallenges: Challenge[],
  history: ChallengeHistoryEntry[]
): Challenge[] => {
  const previousNames = new Set(prevChallenges.map(c => c.name));
  
  // Count category completions in history
  const categories = ["transport", "energy", "food", "waste", "water", "shopping"];
  const counts: Record<string, number> = {};
  categories.forEach(cat => { counts[cat] = 0; });
  
  history.forEach(item => {
    const cat = item.category.toLowerCase();
    if (counts[cat] !== undefined) {
      counts[cat]++;
    }
  });
  
  // Shuffle categories first to randomize ties
  const shuffledCats = [...categories].sort(() => 0.5 - Math.random());
  
  // Sort categories by completion count (ascending)
  shuffledCats.sort((a, b) => counts[a] - counts[b]);
  
  // Take top 3 categories (least completed)
  const selectedCats = shuffledCats.slice(0, 3);
  
  // Shuffle the selected categories to randomize which category gets which difficulty
  const shuffledCatsForDiff = [...selectedCats].sort(() => 0.5 - Math.random());
  
  const difficulties = ["easy", "medium", "hard"] as const;
  const newChallenges: Challenge[] = [];
  
  difficulties.forEach((diff, index) => {
    const cat = shuffledCatsForDiff[index];
    
    // Attempt 1: Filter by category and difficulty, excluding previous week's challenges
    let catPool = CHALLENGE_POOL.filter(
      c => c.category === cat && c.difficulty === diff && !previousNames.has(c.name)
    );
    
    // Attempt 2: Fallback to difficulty only, excluding previous week's challenges
    if (catPool.length === 0) {
      catPool = CHALLENGE_POOL.filter(
        c => c.difficulty === diff && !previousNames.has(c.name)
      );
    }
    
    // Attempt 3: Fallback to difficulty only (allow repeats if pool is fully exhausted)
    if (catPool.length === 0) {
      catPool = CHALLENGE_POOL.filter(c => c.difficulty === diff);
    }
    
    if (catPool.length > 0) {
      const chosen = catPool[Math.floor(Math.random() * catPool.length)];
      newChallenges.push({
        id: `c_${chosen.category}_${diff}_${Date.now()}_${index}`,
        name: chosen.name,
        description: chosen.description,
        co2Saved: chosen.co2Saved,
        xpReward: chosen.xpReward,
        duration: chosen.duration,
        category: chosen.category,
        difficulty: chosen.difficulty,
        status: "available"
      });
    }
  });
  
  return newChallenges;
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

  // New states for rotation and challenge streaks/history
  const [challengeHistory, setChallengeHistory] = useState<ChallengeHistoryEntry[]>([]);
  const [challengesWeekStart, setChallengesWeekStart] = useState<string | null>(null);
  const [challengesWeekEnd, setChallengesWeekEnd] = useState<string | null>(null);
  const [weeklyChallengesStreak, setWeeklyChallengesStreak] = useState<number>(0);
  const [longestChallengeStreak, setLongestChallengeStreak] = useState<number>(0);
  const [totalWeeksFullyCompleted, setTotalWeeksFullyCompleted] = useState<number>(0);
  const [lastHabitsResetDate, setLastHabitsResetDate] = useState<string | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const isLoadedRef = useRef(false);
  const currentUserUidRef = useRef<string | null>(null);

  // Ref to track last synced stringified data for each field
  const lastSyncedDataRef = useRef<Record<string, string>>({});

  // Monitor Authentication and Load Initial Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const prevUid = currentUserUidRef.current;
      const newUid = firebaseUser ? firebaseUser.uid : null;
      currentUserUidRef.current = newUid;

      setUser(firebaseUser);

      if (newUid === prevUid && isLoadedRef.current) {
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      setIsLoaded(false);
      isLoadedRef.current = false;
      lastSyncedDataRef.current = {}; // Clear sync cache on auth state change

      if (firebaseUser) {
        // Authenticated: Load from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profile) {
              const loadedProfile = {
                ...data.profile,
                username: "Eco Warrior",
                displayName: "Eco Warrior",
              };
              setProfile(loadedProfile);
              lastSyncedDataRef.current.profile = JSON.stringify(loadedProfile);
            }
            if (data.calculatorData) {
              setCalculatorData(data.calculatorData);
              lastSyncedDataRef.current.calculatorData = JSON.stringify(data.calculatorData);
            }
            if (data.habits) {
              setHabits(data.habits);
              lastSyncedDataRef.current.habits = JSON.stringify(data.habits);
            }
            if (data.challenges) {
              setChallenges(data.challenges);
              lastSyncedDataRef.current.challenges = JSON.stringify(data.challenges);
            }
            if (data.badges) {
              setBadges(data.badges);
              lastSyncedDataRef.current.badges = JSON.stringify(data.badges);
            }
            if (data.history) {
              setHistory(data.history);
              lastSyncedDataRef.current.history = JSON.stringify(data.history);
            }
            
            // Sync new states
            if (data.challengeHistory) {
              setChallengeHistory(data.challengeHistory);
              lastSyncedDataRef.current.challengeHistory = JSON.stringify(data.challengeHistory);
            }
            if (data.challengesWeekStart) {
              setChallengesWeekStart(data.challengesWeekStart);
              lastSyncedDataRef.current.challengesWeekStart = JSON.stringify(data.challengesWeekStart);
            }
            if (data.challengesWeekEnd) {
              setChallengesWeekEnd(data.challengesWeekEnd);
              lastSyncedDataRef.current.challengesWeekEnd = JSON.stringify(data.challengesWeekEnd);
            }
            if (data.weeklyChallengesStreak !== undefined) {
              setWeeklyChallengesStreak(data.weeklyChallengesStreak);
              lastSyncedDataRef.current.weeklyChallengesStreak = JSON.stringify(data.weeklyChallengesStreak);
            }
            if (data.longestChallengeStreak !== undefined) {
              setLongestChallengeStreak(data.longestChallengeStreak);
              lastSyncedDataRef.current.longestChallengeStreak = JSON.stringify(data.longestChallengeStreak);
            }
            if (data.totalWeeksFullyCompleted !== undefined) {
              setTotalWeeksFullyCompleted(data.totalWeeksFullyCompleted);
              lastSyncedDataRef.current.totalWeeksFullyCompleted = JSON.stringify(data.totalWeeksFullyCompleted);
            }
            if (data.lastHabitsResetDate) {
              setLastHabitsResetDate(data.lastHabitsResetDate);
              lastSyncedDataRef.current.lastHabitsResetDate = JSON.stringify(data.lastHabitsResetDate);
            }
          } else {
            // Document does not exist: Initialize Firestore with current state (preserving guest data)
            const initialProfile = {
              ...profile,
              username: "Eco Warrior",
              displayName: "Eco Warrior",
            };
            setProfile(initialProfile);
            lastSyncedDataRef.current.profile = JSON.stringify(initialProfile);
            await setDoc(userDocRef, {
              profile: initialProfile,
              calculatorData,
              habits,
              challenges,
              badges,
              history,
              challengeHistory,
              challengesWeekStart,
              challengesWeekEnd,
              weeklyChallengesStreak,
              longestChallengeStreak,
              totalWeeksFullyCompleted,
              lastHabitsResetDate
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
          
          const storedHistoryList = localStorage.getItem("ecotrack_challengeHistory");
          const storedWeekStart = localStorage.getItem("ecotrack_challengesWeekStart");
          const storedWeekEnd = localStorage.getItem("ecotrack_challengesWeekEnd");
          const storedWeeklyStreak = localStorage.getItem("ecotrack_weeklyChallengesStreak");
          const storedLongestStreak = localStorage.getItem("ecotrack_longestChallengeStreak");
          const storedTotalWeeks = localStorage.getItem("ecotrack_totalWeeksFullyCompleted");
          const storedResetDate = localStorage.getItem("ecotrack_lastHabitsResetDate");

          if (storedProfile) {
            const parsed = JSON.parse(storedProfile);
            const loadedProfile = {
              ...parsed,
              username: "Eco Warrior",
              displayName: "Eco Warrior",
            };
            setProfile(loadedProfile);
            lastSyncedDataRef.current.profile = JSON.stringify(loadedProfile);
          }
          if (storedCalculator) {
            setCalculatorData(JSON.parse(storedCalculator));
            lastSyncedDataRef.current.calculatorData = storedCalculator;
          }
          if (storedHabits) {
            setHabits(JSON.parse(storedHabits));
            lastSyncedDataRef.current.habits = storedHabits;
          }
          if (storedChallenges) {
            setChallenges(JSON.parse(storedChallenges));
            lastSyncedDataRef.current.challenges = storedChallenges;
          }
          if (storedBadges) {
            setBadges(JSON.parse(storedBadges));
            lastSyncedDataRef.current.badges = storedBadges;
          }
          if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
            lastSyncedDataRef.current.history = storedHistory;
          }

          if (storedHistoryList) {
            setChallengeHistory(JSON.parse(storedHistoryList));
            lastSyncedDataRef.current.challengeHistory = storedHistoryList;
          }
          if (storedWeekStart) {
            setChallengesWeekStart(storedWeekStart);
            lastSyncedDataRef.current.challengesWeekStart = JSON.stringify(storedWeekStart);
          }
          if (storedWeekEnd) {
            setChallengesWeekEnd(storedWeekEnd);
            lastSyncedDataRef.current.challengesWeekEnd = JSON.stringify(storedWeekEnd);
          }
          if (storedWeeklyStreak) {
            setWeeklyChallengesStreak(Number(storedWeeklyStreak));
            lastSyncedDataRef.current.weeklyChallengesStreak = JSON.stringify(Number(storedWeeklyStreak));
          }
          if (storedLongestStreak) {
            setLongestChallengeStreak(Number(storedLongestStreak));
            lastSyncedDataRef.current.longestChallengeStreak = JSON.stringify(Number(storedLongestStreak));
          }
          if (storedTotalWeeks) {
            setTotalWeeksFullyCompleted(Number(storedTotalWeeks));
            lastSyncedDataRef.current.totalWeeksFullyCompleted = JSON.stringify(Number(storedTotalWeeks));
          }
          if (storedResetDate) {
            setLastHabitsResetDate(storedResetDate);
            lastSyncedDataRef.current.lastHabitsResetDate = JSON.stringify(storedResetDate);
          }
        } catch (e) {
          console.error("Failed to load local storage data fallback:", e);
        }
      }
      setAuthLoading(false);
      setIsLoaded(true);
      isLoadedRef.current = true;
    });

    return () => unsubscribe();
  }, []);

  // Sync to database or localStorage on state changes
  const saveField = useCallback(async (fieldName: string, data: unknown) => {
    if (!isLoaded) return;
    
    // Compare stringified representations to avoid redundant/stale writes
    const dataStr = JSON.stringify(data);
    if (lastSyncedDataRef.current[fieldName] === dataStr) {
      return;
    }
    lastSyncedDataRef.current[fieldName] = dataStr;

    // Always keep localStorage updated as a local fallback
    localStorage.setItem(`ecotrack_${fieldName}`, dataStr);

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

  useEffect(() => {
    saveField("challengeHistory", challengeHistory);
  }, [challengeHistory, saveField]);

  useEffect(() => {
    saveField("challengesWeekStart", challengesWeekStart);
  }, [challengesWeekStart, saveField]);

  useEffect(() => {
    saveField("challengesWeekEnd", challengesWeekEnd);
  }, [challengesWeekEnd, saveField]);

  useEffect(() => {
    saveField("weeklyChallengesStreak", weeklyChallengesStreak);
  }, [weeklyChallengesStreak, saveField]);

  useEffect(() => {
    saveField("longestChallengeStreak", longestChallengeStreak);
  }, [longestChallengeStreak, saveField]);

  useEffect(() => {
    saveField("totalWeeksFullyCompleted", totalWeeksFullyCompleted);
  }, [totalWeeksFullyCompleted, saveField]);

  useEffect(() => {
    saveField("lastHabitsResetDate", lastHabitsResetDate);
  }, [lastHabitsResetDate, saveField]);

  // Combined Daily Habits Reset & Weekly Challenges Rotation check
  useEffect(() => {
    if (!isLoaded) return;

    const todayStr = new Date().toDateString();
    
    // 1. Daily Habits Reset
    if (lastHabitsResetDate !== todayStr) {
      const hasCompletedHabits = habits.some((h) => h.completed);
      if (hasCompletedHabits) {
        setHabits((prev) => prev.map((h) => ({ ...h, completed: false })));
      }
      setLastHabitsResetDate(todayStr);
    }

    // 2. Weekly Challenges Rotation
    const today = new Date();
    const currentMonday = getMondayOfCurrentWeek(today);
    const currentSunday = getSundayOfCurrentWeek(currentMonday);
    
    const currentMondayStr = currentMonday.toISOString();
    const currentSundayStr = currentSunday.toISOString();
    
    if (!challengesWeekStart) {
      // Safe legacy user migration: move legacy completed challenges to history
      const legacyCompleted = challenges
        .filter((c) => c.status === "completed")
        .map((c) => ({
          id: `${c.id}_migration_${Date.now()}`,
          name: c.name,
          category: c.category,
          co2Saved: c.co2Saved,
          xpReward: c.xpReward,
          completedAt: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          completedTimestamp: Date.now()
        }));
        
      if (legacyCompleted.length > 0) {
        setChallengeHistory((prev) => {
          const existingNames = new Set(prev.map((h) => h.name));
          const filtered = legacyCompleted.filter((c) => !existingNames.has(c.name));
          return [...prev, ...filtered];
        });
      }
      
      const initialWeekly = selectWeeklyChallenges([], []);
      setChallenges(initialWeekly);
      setChallengesWeekStart(currentMondayStr);
      setChallengesWeekEnd(currentSundayStr);
    } else {
      const storedMonday = new Date(challengesWeekStart);
      if (currentMonday.getTime() > storedMonday.getTime()) {
        // Monday Rotation rollover triggers!
        const completedCount = challenges.filter((c) => c.status === "completed").length;
        let newStreak = weeklyChallengesStreak;
        let newTotalWeeks = totalWeeksFullyCompleted;
        let newLongestStreak = longestChallengeStreak;
        
        if (completedCount === challenges.length && challenges.length > 0) {
          newStreak += 1;
          newTotalWeeks += 1;
          newLongestStreak = Math.max(newLongestStreak, newStreak);
        } else {
          newStreak = 0;
        }
        
        setWeeklyChallengesStreak(newStreak);
        setTotalWeeksFullyCompleted(newTotalWeeks);
        setLongestChallengeStreak(newLongestStreak);

        // Auto award weekly completion badges
        const dateStr = new Date().toLocaleDateString();
        setBadges((prevBadges) =>
          prevBadges.map((badge) => {
            if (badge.unlocked) return badge;
            
            let shouldUnlock = false;
            if (badge.id === "b7" && newTotalWeeks >= 1) shouldUnlock = true;
            else if (badge.id === "b8" && newTotalWeeks >= 4) shouldUnlock = true;
            else if (badge.id === "b9" && newTotalWeeks >= 12) shouldUnlock = true;
            else if (badge.id === "b10" && newTotalWeeks >= 24) shouldUnlock = true;
            
            if (shouldUnlock) {
              return { ...badge, unlocked: true, unlockedAt: dateStr };
            }
            return badge;
          })
        );

        // Archive completed challenges to history
        const completedWeekly = challenges
          .filter((c) => c.status === "completed")
          .map((c) => ({
            id: `${c.id}_rotation_${Date.now()}`,
            name: c.name,
            category: c.category,
            co2Saved: c.co2Saved,
            xpReward: c.xpReward,
            completedAt: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            completedTimestamp: Date.now(),
            weekStart: challengesWeekStart || undefined,
            weekEnd: challengesWeekEnd || undefined
          }));
          
        if (completedWeekly.length > 0) {
          setChallengeHistory((prev) => {
            const existingNames = new Set(prev.map((h) => h.name));
            const filtered = completedWeekly.filter((c) => !existingNames.has(c.name));
            return [...prev, ...filtered];
          });
        }
        
        const newWeekly = selectWeeklyChallenges(challenges, challengeHistory);
        setChallenges(newWeekly);
        setChallengesWeekStart(currentMondayStr);
        setChallengesWeekEnd(currentSundayStr);
      }
    }
  }, [isLoaded, lastHabitsResetDate, challengesWeekStart, challenges, habits, weeklyChallengesStreak, longestChallengeStreak, totalWeeksFullyCompleted, challengeHistory]);

  // Carbon Emission Models (Annual Metric Tons CO2e)
  const carbonBreakdown = calculateCarbonFootprint(calculatorData);
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
      const xpNeeded = nextLevel * 100;

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
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const nextState = !habit.completed;
    const co2ToSave = nextState ? habit.co2Saved : -habit.co2Saved;
    const xpToGain = nextState ? habit.xpReward : -habit.xpReward;

    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: nextState } : h))
    );

    setProfile((prev) => {
      const isCompletedAction = co2ToSave > 0;
      let nextStreak = prev.streak;
      
      if (isCompletedAction) {
        if (prev.lastActiveDate !== today) {
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

      const badgeCheck = checkBadgeUnlocks(updatedProfile, badges, calculatorData);
      if (badgeCheck.updated) {
        setBadges(badgeCheck.badges);
      }

      return updatedProfile;
    });

    if (xpToGain !== 0) {
      addXP(xpToGain);
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
    const targetChallenge = challenges.find((c) => c.id === id && c.status === "active");
    if (!targetChallenge) return;

    const co2ToSave = targetChallenge.co2Saved;
    const xpToGain = targetChallenge.xpReward;

    setChallenges((prev) =>
      prev.map((challenge) =>
        challenge.id === id && challenge.status === "active"
          ? { ...challenge, status: "completed" as const }
          : challenge
      )
    );

    const today = new Date();
    const monthYear = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const historyEntry: ChallengeHistoryEntry = {
      id: `${targetChallenge.id}_completed_${Date.now()}`,
      name: targetChallenge.name,
      category: targetChallenge.category,
      co2Saved: targetChallenge.co2Saved,
      xpReward: targetChallenge.xpReward,
      completedAt: monthYear,
      completedTimestamp: Date.now(),
      weekStart: challengesWeekStart || undefined,
      weekEnd: challengesWeekEnd || undefined
    };
    
    setChallengeHistory((prev) => {
      const exists = prev.some((h) => h.name === historyEntry.name && h.completedAt === historyEntry.completedAt);
      if (exists) return prev;
      return [...prev, historyEntry];
    });

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
  };

  const updateProfile = async (avatar: string) => {
    setProfile((prev) => ({ ...prev, avatar }));
  };

  const saveCurrentToHistory = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    
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
    setChallengeHistory([]);
    setChallengesWeekStart(null);
    setChallengesWeekEnd(null);
    setWeeklyChallengesStreak(0);
    setLongestChallengeStreak(0);
    setTotalWeeksFullyCompleted(0);
    setLastHabitsResetDate(null);
    localStorage.clear();
  };

  if (typeof window !== "undefined") {
    (window as any).ecoContext = {
      profile,
      user,
      updateProfile,
      saveField,
      getFirestoreDoc: async () => {
        if (!user) return null;
        const docSnap = await getDoc(doc(db, "users", user.uid));
        return docSnap.exists() ? docSnap.data() : null;
      }
    };
    (window as any).auth = auth;
    (window as any).db = db;
  }

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
        challengeHistory,
        challengesWeekStart,
        challengesWeekEnd,
        weeklyChallengesStreak,
        longestChallengeStreak,
        totalWeeksFullyCompleted,
        lastHabitsResetDate,
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

