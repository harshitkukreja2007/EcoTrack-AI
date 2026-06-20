export interface CalculatorData {
  transportDistance: number; // km per week
  transportType: "gasoline" | "diesel" | "hybrid" | "electric" | "public" | "bike_walk";
  electricityUsage: number; // kWh per month
  renewableRatio: number; // 0 to 100 (%)
  dietType: "vegan" | "vegetarian" | "pescatarian" | "average_meat" | "heavy_meat";
  localFoodRatio: number; // 0 to 100 (%)
  shoppingClothing: number; // items per month
  shoppingTech: number; // items per year
  wasteRecycling: boolean;
  wasteComposting: boolean;
}

export interface CarbonBreakdown {
  transport: number;
  electricity: number;
  diet: number;
  shopping: number;
  waste: number;
  total: number;
}

export const validateCalculatorData = (data: any): CalculatorData => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid input: data must be an object");
  }

  const transportDistance = Number(data.transportDistance);
  if (isNaN(transportDistance) || transportDistance < 0) {
    throw new Error("Invalid transportDistance: must be a non-negative number");
  }

  const validTransportTypes = ["gasoline", "diesel", "hybrid", "electric", "public", "bike_walk"];
  if (!validTransportTypes.includes(data.transportType)) {
    throw new Error(`Invalid transportType: must be one of ${validTransportTypes.join(", ")}`);
  }

  const electricityUsage = Number(data.electricityUsage);
  if (isNaN(electricityUsage) || electricityUsage < 0) {
    throw new Error("Invalid electricityUsage: must be a non-negative number");
  }

  const renewableRatio = Number(data.renewableRatio);
  if (isNaN(renewableRatio) || renewableRatio < 0 || renewableRatio > 100) {
    throw new Error("Invalid renewableRatio: must be a number between 0 and 100");
  }

  const validDietTypes = ["vegan", "vegetarian", "pescatarian", "average_meat", "heavy_meat"];
  if (!validDietTypes.includes(data.dietType)) {
    throw new Error(`Invalid dietType: must be one of ${validDietTypes.join(", ")}`);
  }

  const localFoodRatio = Number(data.localFoodRatio);
  if (isNaN(localFoodRatio) || localFoodRatio < 0 || localFoodRatio > 100) {
    throw new Error("Invalid localFoodRatio: must be a number between 0 and 100");
  }

  const shoppingClothing = Number(data.shoppingClothing);
  if (isNaN(shoppingClothing) || shoppingClothing < 0) {
    throw new Error("Invalid shoppingClothing: must be a non-negative number");
  }

  const shoppingTech = Number(data.shoppingTech);
  if (isNaN(shoppingTech) || shoppingTech < 0) {
    throw new Error("Invalid shoppingTech: must be a non-negative number");
  }

  return {
    transportDistance,
    transportType: data.transportType as CalculatorData["transportType"],
    electricityUsage,
    renewableRatio,
    dietType: data.dietType as CalculatorData["dietType"],
    localFoodRatio,
    shoppingClothing,
    shoppingTech,
    wasteRecycling: Boolean(data.wasteRecycling),
    wasteComposting: Boolean(data.wasteComposting),
  };
};

export const validateCarbonBreakdown = (data: any): CarbonBreakdown => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid input: carbonBreakdown must be an object");
  }
  const fields: (keyof CarbonBreakdown)[] = ["transport", "electricity", "diet", "shopping", "waste", "total"];
  const validated: Partial<CarbonBreakdown> = {};
  for (const field of fields) {
    const val = Number(data[field]);
    if (isNaN(val) || val < 0) {
      throw new Error(`Invalid carbonBreakdown field '${field}': must be a non-negative number`);
    }
    validated[field] = val;
  }
  return validated as CarbonBreakdown;
};

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
