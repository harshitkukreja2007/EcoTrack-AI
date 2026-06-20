import { describe, it, expect } from "vitest";
import { 
  calculateCarbonFootprint, 
  calculateEcoScore, 
  validateCalculatorData, 
  validateCarbonBreakdown,
  CalculatorData,
  CarbonBreakdown
} from "./carbonUtils";

describe("carbonUtils calculations", () => {
  it("should calculate correct carbon footprint for gasoline average commute and diet", () => {
    const data: CalculatorData = {
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

    const result = calculateCarbonFootprint(data);

    // 1. Commute: (120 * 52 * 0.18) / 1000 = 1.1232 Tons -> ~1.12
    expect(result.transport).toBeCloseTo(1.12, 1);

    // 2. Electricity: (250 * 12 * 0.38 * (1 - 10 / 100)) / 1000 = 1.026 Tons -> ~1.03
    expect(result.electricity).toBeCloseTo(1.03, 1);

    // 3. Diet: 2.5 * (1 - 0.1 * (20 / 100)) = 2.45 Tons -> ~2.45
    expect(result.diet).toBeCloseTo(2.45, 1);

    // 4. Shopping: (3 * 12 * 15) / 1000 + (2 * 150) / 1000 = 0.54 + 0.30 = 0.84 Tons -> ~0.84
    expect(result.shopping).toBeCloseTo(0.84, 1);

    // 5. Waste: 0.8 - 0.15 = 0.65 Tons -> ~0.65
    expect(result.waste).toBeCloseTo(0.65, 1);

    // Total should equal the sum: ~6.09
    expect(result.total).toBeCloseTo(6.09, 1);
  });

  it("should handle zero transport commute distance", () => {
    const data: CalculatorData = {
      transportDistance: 0,
      transportType: "bike_walk",
      electricityUsage: 100,
      renewableRatio: 100, // 100% solar/wind
      dietType: "vegan",
      localFoodRatio: 100, // fully local
      shoppingClothing: 0,
      shoppingTech: 0,
      wasteRecycling: true,
      wasteComposting: true,
    };

    const result = calculateCarbonFootprint(data);

    expect(result.transport).toBe(0);
    expect(result.electricity).toBe(0); // 100% clean energy share
    expect(result.diet).toBeCloseTo(1.35, 1); // 1.5 * (1 - 0.1) = 1.35
    expect(result.shopping).toBe(0);
    expect(result.waste).toBe(0.55); // base 0.8 - 0.15 - 0.10 = 0.55
  });

  it("should calculate correct Eco Score clamped within 10 and 100", () => {
    // 0 emissions should map to 100 score
    expect(calculateEcoScore(0)).toBe(100);

    // High emissions (e.g. 30 tons) should clamp to 10
    expect(calculateEcoScore(30)).toBe(10);

    // 16.0 tons baseline should yield 15
    expect(calculateEcoScore(16.0)).toBe(15);
  });
});

describe("carbonUtils input validation", () => {
  it("should validate and sanitize correct input data objects", () => {
    const rawData = {
      transportDistance: "150",
      transportType: "hybrid",
      electricityUsage: "300",
      renewableRatio: "45",
      dietType: "pescatarian",
      localFoodRatio: "50",
      shoppingClothing: "5",
      shoppingTech: "3",
      wasteRecycling: 1,
      wasteComposting: false,
    };

    const validated = validateCalculatorData(rawData);

    expect(validated.transportDistance).toBe(150);
    expect(validated.transportType).toBe("hybrid");
    expect(validated.electricityUsage).toBe(300);
    expect(validated.renewableRatio).toBe(45);
    expect(validated.dietType).toBe("pescatarian");
    expect(validated.localFoodRatio).toBe(50);
    expect(validated.shoppingClothing).toBe(5);
    expect(validated.shoppingTech).toBe(3);
    expect(validated.wasteRecycling).toBe(true);
    expect(validated.wasteComposting).toBe(false);
  });

  it("should throw validation error on invalid transportDistance", () => {
    const badData = {
      transportDistance: -10, // negative
      transportType: "hybrid",
      electricityUsage: 300,
      renewableRatio: 45,
      dietType: "pescatarian",
      localFoodRatio: 50,
      shoppingClothing: 5,
      shoppingTech: 3,
      wasteRecycling: true,
      wasteComposting: false,
    };

    expect(() => validateCalculatorData(badData)).toThrow("Invalid transportDistance");
  });

  it("should throw validation error on invalid transportType", () => {
    const badData = {
      transportDistance: 100,
      transportType: "rocket", // unsupported type
      electricityUsage: 300,
      renewableRatio: 45,
      dietType: "pescatarian",
      localFoodRatio: 50,
      shoppingClothing: 5,
      shoppingTech: 3,
      wasteRecycling: true,
      wasteComposting: false,
    };

    expect(() => validateCalculatorData(badData)).toThrow("Invalid transportType");
  });

  it("should validate carbon breakdown objects correctly", () => {
    const breakdown = {
      transport: "1.23",
      electricity: "2.34",
      diet: "3.45",
      shopping: "4.56",
      waste: "0.50",
      total: "12.08"
    };

    const validated = validateCarbonBreakdown(breakdown);
    expect(validated.transport).toBe(1.23);
    expect(validated.total).toBe(12.08);
  });

  it("should fail validation on invalid carbon breakdown field", () => {
    const badBreakdown = {
      transport: "hello", // non-numeric
      electricity: 2.34,
      diet: 3.45,
      shopping: 4.56,
      waste: 0.50,
      total: 12.08
    };

    expect(() => validateCarbonBreakdown(badBreakdown)).toThrow("Invalid carbonBreakdown field");
  });
});
