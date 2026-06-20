import { describe, it, expect } from "vitest";
import { getChartPaths, HistoryEntry } from "./chartUtils";

describe("chartUtils.ts paths generation", () => {
  it("should return null for empty history", () => {
    expect(getChartPaths([], 500, 160, 40, 20)).toBeNull();
  });

  it("should generate identical line and area path strings for simple datasets", () => {
    const mockHistory: HistoryEntry[] = [
      { date: "Feb 2026", co2Output: 12.0, ecoScore: 50 },
      { date: "Mar 2026", co2Output: 6.0, ecoScore: 70 },
      { date: "Apr 2026", co2Output: 0.0, ecoScore: 90 }
    ];

    const result = getChartPaths(mockHistory, 500, 160, 40, 20);

    expect(result).not.toBeNull();
    if (result) {
      // 1. Min/Max check
      expect(result.minVal).toBe(0);
      expect(result.maxVal).toBe(12);

      // 2. Points verification
      expect(result.points).toHaveLength(3);
      
      // Point 0 (x = 40, y = 20)
      expect(result.points[0].x).toBe(40);
      expect(result.points[0].y).toBe(20);

      // Point 1 (x = 250, y = 80)
      expect(result.points[1].x).toBe(250);
      expect(result.points[1].y).toBe(80);

      // Point 2 (x = 460, y = 140)
      expect(result.points[2].x).toBe(460);
      expect(result.points[2].y).toBe(140);

      // 3. Line path: M 40 20 L 250 80 L 460 140
      expect(result.linePath).toBe("M 40 20 L 250 80 L 460 140");

      // 4. Area path: M 40 140 L 40 20 L 250 80 L 460 140 L 460 140 Z
      expect(result.areaPath).toBe("M 40 140 L 40 20 L 250 80 L 460 140 L 460 140 Z");
    }
  });
});
