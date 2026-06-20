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
                mostImpactfulChange: "Switch to Electric Vehicle",
                sustainabilityReasoning: "This adjustment significantly lowers reliance on direct tailpipe emissions.",
                implementationSteps: [
                  "Purchase an EV.",
                  "Set up home charging."
                ],
                longTermBenefits: "Substantial decrease in carbon footprint and cost savings over 5 years."
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

describe("POST /api/insights/scenario API route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const validPayload = {
    currentInputs: {
      transportDistance: 120,
      transportType: "gasoline",
      electricityUsage: 250,
      renewableRatio: 10,
      dietType: "average_meat",
      localFoodRatio: 20,
      shoppingClothing: 3,
      shoppingTech: 2,
      wasteRecycling: true,
      wasteComposting: false
    },
    simulatedInputs: {
      transportDistance: 120,
      transportType: "electric", // EV change
      electricityUsage: 250,
      renewableRatio: 10,
      dietType: "average_meat",
      localFoodRatio: 20,
      shoppingClothing: 3,
      shoppingTech: 2,
      wasteRecycling: true,
      wasteComposting: false
    },
    currentBreakdown: {
      transport: 1.12,
      electricity: 1.03,
      diet: 2.45,
      shopping: 0.84,
      waste: 0.65,
      total: 6.09
    },
    simulatedBreakdown: {
      transport: 0.25,
      electricity: 1.03,
      diet: 2.45,
      shopping: 0.84,
      waste: 0.65,
      total: 5.22
    }
  };

  it("should process valid simulated scenarios successfully", async () => {
    process.env.GEMINI_API_KEY = "test-real-gemini-key";

    const request = new Request("http://localhost/api/insights/scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload)
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.mostImpactfulChange).toBe("Switch to Electric Vehicle");
    expect(json.implementationSteps).toHaveLength(2);
  });

  it("should fail with 400 when simulatedInputs has negative transportDistance", async () => {
    const invalidPayload = {
      ...validPayload,
      simulatedInputs: {
        ...validPayload.simulatedInputs,
        transportDistance: -50 // invalid negative value
      }
    };

    const request = new Request("http://localhost/api/insights/scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidPayload)
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toContain("Invalid transportDistance");
  });

  it("should fail with 500 when Gemini API key is missing or mock", async () => {
    process.env.GEMINI_API_KEY = "mock-key";

    const request = new Request("http://localhost/api/insights/scenario", {
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
