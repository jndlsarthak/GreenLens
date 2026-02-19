/**
 * Contextual comparisons to make carbon footprint tangible.
 * Converts kg CO2e into relatable everyday activities.
 */

export interface CarbonComparison {
  label: string;
  value: string;
  icon?: string;
}

const MILES_PER_KG_CO2 = 2.5; // Average car emits ~0.4 kg CO2 per mile
const TV_HOURS_PER_KG_CO2 = 10; // Average TV ~0.1 kg CO2 per hour
const LIGHTBULB_HOURS_PER_KG_CO2 = 100; // LED bulb ~0.01 kg CO2 per hour
const PHONE_CHARGES_PER_KG_CO2 = 200; // Phone charge ~0.005 kg CO2
const SHOWERS_PER_KG_CO2 = 2; // Hot shower ~0.5 kg CO2

export function getCarbonComparisons(carbonKg: number): CarbonComparison[] {
  const comparisons: CarbonComparison[] = [];

  if (carbonKg > 0) {
    comparisons.push({
      label: 'Driving',
      value: `${(carbonKg * MILES_PER_KG_CO2).toFixed(1)} miles`,
      icon: '🚗',
    });

    comparisons.push({
      label: 'TV watching',
      value: `${(carbonKg * TV_HOURS_PER_KG_CO2).toFixed(0)} hours`,
      icon: '📺',
    });

    if (carbonKg < 5) {
      comparisons.push({
        label: 'Lightbulb',
        value: `${(carbonKg * LIGHTBULB_HOURS_PER_KG_CO2).toFixed(0)} hours`,
        icon: '💡',
      });
    }

    if (carbonKg < 2) {
      comparisons.push({
        label: 'Phone charges',
        value: `${Math.round(carbonKg * PHONE_CHARGES_PER_KG_CO2)} charges`,
        icon: '📱',
      });
    }

    if (carbonKg > 0.5) {
      comparisons.push({
        label: 'Hot showers',
        value: `${(carbonKg * SHOWERS_PER_KG_CO2).toFixed(1)} showers`,
        icon: '🚿',
      });
    }
  }

  return comparisons.slice(0, 3); // Return top 3 most relevant
}
