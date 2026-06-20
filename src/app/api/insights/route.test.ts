import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { POST } from "./route";

// Mock the Google Generative AI SDK using a standard ES6 Class
vi.mock("@google/generative-ai", () => {
  class MockGoogleGenerativeAI {
    apiKey: string;
    constructor(apiKey: string) {
      this.apiKey = apiKey;
    }
    getGenerativeModel() {
      return {
        generateContent: async () => {
          return {
            response: {
              text: () => JSON.stringify({
                culpritExplanation: "Test highest culprit is transportation.",
                recommendations: [
                  {
                    title: "Use electric transit",
                    description: "Transition your vehicle from gasoline to electric.",
                    offset: 1.2,
                    action: "Go Electric",
                    category: "transport"
                  }
                ],
                weeklyPlan: [
                  { day: "Day 1", action: "Plan electric charging points route." }
                ],
                confidence: 95,
                reasoning: "Test reasoning based on standard formulas."
              })
            }
          };
        }
      };
    }
  }

  return {
    GoogleGenerativeAI: MockGoogleGenerativeAI
  };
});

describe("POST /api/insights API route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const validPayload = {
    calculatorData: {
      transportDistance: 150,
      transportType: "gasoline",
      electricityUsage: 300,
      renewableRatio: 20,
      dietType: "average_meat",
      localFoodRatio: 40,
      shoppingClothing: 2,
      shoppingTech: 1,
      wasteRecycling: true,
      wasteComposting: false
    },
    carbonBreakdown: {
      transport: 1.4,
      electricity: 1.1,
      diet: 2.3,
      shopping: 0.5,
      waste: 0.65,
      total: 5.95
    }
  };

  it("should process valid requests and call generative AI mock successfully", async () => {
    process.env.GEMINI_API_KEY = "test-real-gemini-key";

    const request = new Request("http://localhost/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload)
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json).toHaveProperty("culpritExplanation");
    expect(json.confidence).toBe(95);
    expect(json.recommendations[0].title).toBe("Use electric transit");
  });

  it("should reject requests missing calculatorData with 400 Bad Request", async () => {
    const request = new Request("http://localhost/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carbonBreakdown: validPayload.carbonBreakdown
      })
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toContain("Invalid input: data must be an object");
  });

  it("should reject requests with invalid transportType in calculatorData", async () => {
    const invalidPayload = {
      ...validPayload,
      calculatorData: {
        ...validPayload.calculatorData,
        transportType: "rocketship" // invalid
      }
    };

    const request = new Request("http://localhost/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidPayload)
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toContain("Invalid transportType");
  });

  it("should return 500 when Gemini API key is missing or mock", async () => {
    process.env.GEMINI_API_KEY = "mock-key";

    const request = new Request("http://localhost/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload)
    });

    const response = await POST(request);
    expect(response.status).toBe(500);

    const json = await response.json();
    expect(json.error).toContain("Gemini API key is not configured");
  });
});
