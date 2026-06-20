import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateCalculatorData, validateCarbonBreakdown } from "@/lib/carbonUtils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let currentInputs;
    let simulatedInputs;
    let currentBreakdown;
    let simulatedBreakdown;
    try {
      currentInputs = validateCalculatorData(body.currentInputs);
      simulatedInputs = validateCalculatorData(body.simulatedInputs);
      currentBreakdown = validateCarbonBreakdown(body.currentBreakdown);
      simulatedBreakdown = validateCarbonBreakdown(body.simulatedBreakdown);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Invalid payload" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Check for missing or mock API keys
    if (!apiKey || apiKey === "mock-gemini-key-replace-with-yours" || apiKey.includes("mock")) {
      console.warn("[Gemini API Scenario] GEMINI_API_KEY is not configured or is a mock placeholder.");
      return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are the EcoTrack AI sustainability engine. Analyze this user's simulated ecological lifestyle change scenario:

Current Baseline Inputs:
- Commute distance: ${currentInputs.transportDistance} km/week
- Vehicle engine type: ${currentInputs.transportType}
- Electricity usage: ${currentInputs.electricityUsage} kWh/month
- Renewable share: ${currentInputs.renewableRatio}%
- Diet plan: ${currentInputs.dietType}
- Local food percentage: ${currentInputs.localFoodRatio}%
- Monthly clothing purchases: ${currentInputs.shoppingClothing} items
- Yearly hardware upgrades: ${currentInputs.shoppingTech} items
- Segregates recycling: ${currentInputs.wasteRecycling ? "Yes" : "No"}
- Composts organics: ${currentInputs.wasteComposting ? "Yes" : "No"}

Simulated Scenario Inputs:
- Commute distance: ${simulatedInputs.transportDistance} km/week
- Vehicle engine type: ${simulatedInputs.transportType}
- Electricity usage: ${simulatedInputs.electricityUsage} kWh/month
- Renewable share: ${simulatedInputs.renewableRatio}%
- Diet plan: ${simulatedInputs.dietType}
- Local food percentage: ${simulatedInputs.localFoodRatio}%
- Monthly clothing purchases: ${simulatedInputs.shoppingClothing} items
- Yearly hardware upgrades: ${simulatedInputs.shoppingTech} items
- Segregates recycling: ${simulatedInputs.wasteRecycling ? "Yes" : "No"}
- Composts organics: ${simulatedInputs.wasteComposting ? "Yes" : "No"}

Calculated CO2 Footprint comparison:
- Current Annual Total: ${currentBreakdown.total} Metric Tons CO2e/year
- Simulated Annual Total: ${simulatedBreakdown.total} Metric Tons CO2e/year
- Net Difference: ${(simulatedBreakdown.total - currentBreakdown.total).toFixed(2)} Tons/year

Please analyze these changes and return your analysis. The response MUST be a JSON object matching this schema exactly:
{
  "mostImpactfulChange": "A short, engaging title identifying the single simulated change that drove the largest carbon footprint reduction or increase.",
  "sustainabilityReasoning": "A concise 2-3 sentence explanation of the science and environmental reasoning of why these adjustments improve or worsen long-term planetary sustainability.",
  "implementationSteps": [
    "A practical, highly actionable step the user can take to make the simulated change a reality.",
    "A second practical, highly actionable step.",
    "A third practical, highly actionable step."
  ],
  "longTermBenefits": "A short 1-2 sentence projection of the cumulative sustainability, cost-saving, or health benefits if the user maintains this simulated scenario over the next 5 years."
}

Ensure all suggestions are realistic and practical. Respond with ONLY the raw JSON string, do not include markdown blocks or code blocks.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("[Gemini API Scenario Route Error]:", error);
    return NextResponse.json({ error: "Failed to generate AI scenario analysis." }, { status: 500 });
  }
}
