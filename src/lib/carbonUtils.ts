import { CalculatorData } from "@/context/EcoContext";

export interface CarbonBreakdown {
  transport: number;
  electricity: number;
  diet: number;
  shopping: number;
  waste: number;
  total: number;
}

export const calculateCarbonFootprint = (data: CalculatorData): CarbonBreakdown => {
  // 1. Transportation
  let transportFactor = 0.18; // kg/km (gasoline)
  if (data.transportType === "diesel") transportFactor = 0.17;
  else if (data.transportType === "hybrid") transportFactor = 0.10;
  else if (data.transportType === "electric") transportFactor = 0.04;
  else if (data.transportType === "public") transportFactor = 0.05;
  else if (data.transportType === "bike_walk") transportFactor = 0;

  const transportEmissions = (data.transportDistance * 52 * transportFactor) / 1000;

  // 2. Electricity
  const gridIntensity = 0.38; // kg CO2/kWh
  const electricityEmissions = 
    (data.electricityUsage * 12 * gridIntensity * (1 - data.renewableRatio / 100)) / 1000;

  // 3. Diet
  let dietBase = 2.5; // tons/year (average meat eater)
  if (data.dietType === "heavy_meat") dietBase = 3.3;
  else if (data.dietType === "pescatarian") dietBase = 2.0;
  else if (data.dietType === "vegetarian") dietBase = 1.7;
  else if (data.dietType === "vegan") dietBase = 1.5;

  // Local food ratio discount (reduces up to 10% of diet footprint)
  const dietEmissions = dietBase * (1 - 0.1 * (data.localFoodRatio / 100));

  // 4. Shopping
  const clothingEmissions = (data.shoppingClothing * 12 * 15) / 1000; // 15kg CO2 per clothing item
  const techEmissions = (data.shoppingTech * 150) / 1000; // 150kg CO2 per tech item
  const shoppingEmissions = clothingEmissions + techEmissions;

  // 5. Waste & Lifestyle
  let wasteBase = 0.8; // tons/year
  if (data.wasteRecycling) wasteBase -= 0.15;
  if (data.wasteComposting) wasteBase -= 0.10;
  const wasteEmissions = Math.max(0.2, wasteBase);

  const totalEmissions = transportEmissions + electricityEmissions + dietEmissions + shoppingEmissions + wasteEmissions;

  return {
    transport: parseFloat(transportEmissions.toFixed(2)),
    electricity: parseFloat(electricityEmissions.toFixed(2)),
    diet: parseFloat(dietEmissions.toFixed(2)),
    shopping: parseFloat(shoppingEmissions.toFixed(2)),
    waste: parseFloat(wasteEmissions.toFixed(2)),
    total: parseFloat(totalEmissions.toFixed(2)),
  };
};

export const calculateEcoScore = (totalCo2: number): number => {
  return Math.max(10, Math.min(100, Math.round(100 - (totalCo2 / 16.0) * 85)));
};
