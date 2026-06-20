import type { 
  Habit, 
  Challenge, 
  Badge, 
  HistoryEntry, 
  UserProfile, 
  ChallengeHistoryEntry 
} from "@/context/EcoContext";
import { CalculatorData } from "@/lib/carbonUtils";

export const defaultCalculatorData: CalculatorData = {
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

export const defaultHabits: Habit[] = [
  { id: "h1", name: "Commute by Bike or Walking", category: "transport", co2Saved: 3.5, xpReward: 25, completed: false },
  { id: "h2", name: "Use Public Transportation", category: "transport", co2Saved: 2.2, xpReward: 15, completed: false },
  { id: "h3", name: "Unplug standby electronics", category: "energy", co2Saved: 0.8, xpReward: 10, completed: false },
  { id: "h4", name: "Eat completely plant-based meals today", category: "diet", co2Saved: 2.5, xpReward: 20, completed: false },
  { id: "h5", name: "Wash clothes in cold water", category: "energy", co2Saved: 0.9, xpReward: 10, completed: false },
  { id: "h6", name: "Bring reusable shopping bags", category: "shopping", co2Saved: 0.5, xpReward: 5, completed: false },
  { id: "h7", name: "Avoid food waste entirely", category: "diet", co2Saved: 1.2, xpReward: 15, completed: false },
];

export const defaultChallenges: Challenge[] = [
  { id: "c_transport_easy", name: "Public Transport Trip", description: "Use subway, bus, or rail transit for at least one commute trip today.", co2Saved: 2.0, xpReward: 20, category: "transport", duration: "1 day", difficulty: "easy", status: "available" },
  { id: "c_food_medium", name: "Meat-Free 3-Day Sprint", description: "Eat only vegetarian or vegan meals for 3 days this week.", co2Saved: 8.0, xpReward: 75, category: "food", duration: "3 days", difficulty: "medium", status: "available" },
  { id: "c_waste_hard", name: "Plastic-Free Week", description: "Avoid purchasing single-use plastics and packaging for 7 days.", co2Saved: 15.0, xpReward: 150, category: "waste", duration: "7 days", difficulty: "hard", status: "available" },
];

export const defaultBadges: Badge[] = [
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

export const defaultHistory: HistoryEntry[] = [
  { date: "Feb 2026", co2Output: 11.2, ecoScore: 50 },
  { date: "Mar 2026", co2Output: 9.8, ecoScore: 56 },
  { date: "Apr 2026", co2Output: 8.5, ecoScore: 62 },
  { date: "May 2026", co2Output: 7.2, ecoScore: 68 },
];

export const defaultProfile: UserProfile = {
  username: "Eco Warrior",
  displayName: "Eco Warrior",
  avatar: "avatar-1",
  level: 1,
  xp: 0,
  totalCo2Saved: 0,
  streak: 0,
  lastActiveDate: null,
};

export const CHALLENGE_POOL = [
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

export const getMondayOfCurrentWeek = (d: Date) => {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(copy.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const getSundayOfCurrentWeek = (monday: Date) => {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};

export const selectWeeklyChallenges = (
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
