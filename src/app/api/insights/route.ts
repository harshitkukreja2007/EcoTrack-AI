import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { calculatorData, carbonBreakdown } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Fail-safe check for missing or mock API keys
    if (!apiKey || apiKey === "mock-gemini-key-replace-with-yours" || apiKey.includes("mock")) {
      console.warn("[Gemini API] GEMINI_API_KEY is not configured or is a mock placeholder.");
      return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are the EcoTrack AI sustainability engine. Analyze this user's ecological footprint data:

Calculator Inputs:
- Commute distance: ${calculatorData.transportDistance} km/week
- Vehicle engine type: ${calculatorData.transportType}
- Electricity usage: ${calculatorData.electricityUsage} kWh/month
- Renewable share: ${calculatorData.renewableRatio}%
- Diet plan: ${calculatorData.dietType}
- Local food percentage: ${calculatorData.localFoodRatio}%
- Monthly clothing purchases: ${calculatorData.shoppingClothing} items
- Yearly hardware upgrades: ${calculatorData.shoppingTech} items
- Segregates recycling: ${calculatorData.wasteRecycling ? "Yes" : "No"}
- Composts organics: ${calculatorData.wasteComposting ? "Yes" : "No"}

Calculated Sector Footprint (in Metric Tons CO2e/year):
- Transportation: ${carbonBreakdown.transport} Tons
- Electricity: ${carbonBreakdown.electricity} Tons
- Diet & Food: ${carbonBreakdown.diet} Tons
- Shopping: ${carbonBreakdown.shopping} Tons
- Waste: ${carbonBreakdown.waste} Tons
- Total annual footprint: ${carbonBreakdown.total} Tons

Please return your analysis and actionable carbon reduction suggestions. The response MUST be a JSON object matching this schema exactly:
{
  "culpritExplanation": "A detailed multi-sentence description explaining their highest carbon emission sector and its environmental impact.",
  "recommendations": [
    {
      "title": "Short title of the recommendation",
      "description": "Specific details on how the user can implement this recommendation.",
      "offset": 0.8, // estimated carbon savings in Tons of CO2e per year (float number)
      "action": "Call-to-action button text (e.g. Go Green Grid)",
      "category": "transport" // one of: 'transport', 'energy', 'diet', 'shopping', 'lifestyle'
    }
  ],
  "weeklyPlan": [
    {
      "day": "Day 1",
      "action": "A very specific action they should take on this day based on their footprint."
    }
  ],
  "confidence": 92, // Your confidence score as an integer percentage (0-100) based on calculation accuracy
  "reasoning": "A short sentence explaining why you assigned this confidence score."
}

Ensure all recommended offsets are realistic calculations. Respond with ONLY the raw JSON string, do not include markdown blocks or code blocks.`;

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
    console.error("[Gemini API Route Error]:", error);
    return NextResponse.json({ error: "Failed to generate AI insights." }, { status: 500 });
  }
}
