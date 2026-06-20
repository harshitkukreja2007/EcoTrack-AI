import { describe, it, expect } from "vitest";
import { 
  defaultCalculatorData, 
  getMondayOfCurrentWeek, 
  getSundayOfCurrentWeek, 
  selectWeeklyChallenges 
} from "./ecoHelpers";

describe("ecoHelpers constants and functions", () => {
  it("should have correct values in defaultCalculatorData", () => {
    expect(defaultCalculatorData.transportDistance).toBe(120);
    expect(defaultCalculatorData.transportType).toBe("gasoline");
  });

  it("should calculate correct Monday and Sunday dates of current week", () => {
    const testDate = new Date("2026-06-20T12:00:00Z"); // Saturday
    const monday = getMondayOfCurrentWeek(testDate);
    const sunday = getSundayOfCurrentWeek(monday);

    // Monday should be June 15, 2026
    expect(monday.getDate()).toBe(15);
    expect(monday.getMonth()).toBe(5); // June is 5 (0-indexed)

    // Sunday should be June 21, 2026
    expect(sunday.getDate()).toBe(21);
  });

  it("should select three weekly challenges from pool", () => {
    const prevChallenges = [
      { id: "1", name: "Public Transport Trip", description: "Test", co2Saved: 2, xpReward: 20, duration: "1 day", category: "transport", status: "completed" as const }
    ];
    const history = [
      { id: "1", name: "Public Transport Trip", category: "transport", co2Saved: 2, xpReward: 20, completedAt: "Test", completedTimestamp: 123 }
    ];

    const chosen = selectWeeklyChallenges(prevChallenges, history);
    expect(chosen).toHaveLength(3);
    expect(chosen[0].status).toBe("available");
  });
});
