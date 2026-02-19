/**
 * Frontend: Contextual comparisons for carbon footprint.
 */

export interface CarbonComparison {
  label: string;
  value: string;
  icon: string;
}

const MILES_PER_KG_CO2 = 2.5;
const TV_HOURS_PER_KG_CO2 = 10;
const LIGHTBULB_HOURS_PER_KG_CO2 = 100;
const PHONE_CHARGES_PER_KG_CO2 = 200;
const SHOWERS_PER_KG_CO2 = 2;

export function getCarbonComparisons(carbonKg: number): CarbonComparison[] {
  const comparisons: CarbonComparison[] = [];

  if (carbonKg > 0) {
    comparisons.push({
      label: "Driving",
      value: `${(carbonKg * MILES_PER_KG_CO2).toFixed(1)} miles`,
      icon: "🚗",
    });

    comparisons.push({
      label: "TV watching",
      value: `${(carbonKg * TV_HOURS_PER_KG_CO2).toFixed(0)} hours`,
      icon: "📺",
    });

    if (carbonKg < 5) {
      comparisons.push({
        label: "Lightbulb",
        value: `${(carbonKg * LIGHTBULB_HOURS_PER_KG_CO2).toFixed(0)} hours`,
        icon: "💡",
      });
    }

    if (carbonKg < 2) {
      comparisons.push({
        label: "Phone charges",
        value: `${Math.round(carbonKg * PHONE_CHARGES_PER_KG_CO2)} charges`,
        icon: "📱",
      });
    }

    if (carbonKg > 0.5) {
      comparisons.push({
        label: "Hot showers",
        value: `${(carbonKg * SHOWERS_PER_KG_CO2).toFixed(1)} showers`,
        icon: "🚿",
      });
    }
  }

  return comparisons.slice(0, 3);
}

export function getEcoTip(ecoScore: string, carbonFootprint: number): { message: string; variant: "good" | "warning" | "info" } {
  if (ecoScore === "A" || ecoScore === "B") {
    return {
      message: "This product has a low carbon footprint! Great choice for the environment.",
      variant: "good",
    };
  }
  if (ecoScore === "C") {
    return {
      message: "This product has a moderate impact. Consider exploring alternatives for your next purchase.",
      variant: "info",
    };
  }
  return {
    message: "This product has a high carbon footprint. Check out better alternatives below to reduce your impact.",
    variant: "warning",
  };
}
