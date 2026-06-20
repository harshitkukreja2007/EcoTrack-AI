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

import {
  defaultCalculatorData,
  defaultHabits,
  defaultChallenges,
  defaultBadges,
  defaultHistory,
  defaultProfile,
  CHALLENGE_POOL,
  getMondayOfCurrentWeek,
  getSundayOfCurrentWeek,
  selectWeeklyChallenges,
} from "@/lib/ecoHelpers";

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

