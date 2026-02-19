/**
 * Rule-based carbon footprint calculator (no ML).
 * Emission factors: kg CO2e per kg of product.
 */

const EMISSION_FACTORS: Record<string, number> = {
  beef: 60,
  lamb: 24,
  pork: 7,
  poultry: 6,
  fish: 5,
  dairy: 3.5,
  cheese: 21,
  eggs: 4.5,
  vegetables: 0.8,
  fruits: 0.9,
  grains: 1.2,
  bread: 0.8,
  nuts: 0.3,
  legumes: 0.9,
  chocolate: 19,
  coffee: 17,
  tea: 0.2,
  rice: 4,
  pasta: 1.5,
  oil: 3.3,
  sugar: 0.9,
  plastic: 3,
  default: 2,
};

const PACKAGING_FACTORS: Record<string, number> = {
  plastic: 0.3,
  glass: 0.4,
  paper: 0.15,
  cardboard: 0.15,
  metal: 0.5,
  default: 0.25,
};

const ECO_SCORE_THRESHOLDS: { maxPerKg: number; score: string }[] = [
  { maxPerKg: 1, score: 'A' },
  { maxPerKg: 2, score: 'B' },
  { maxPerKg: 4, score: 'C' },
  { maxPerKg: 8, score: 'D' },
  { maxPerKg: Infinity, score: 'F' },
];

export interface ProductDataForCarbon {
  categories?: string | null;
  quantity?: string | null;
  packaging?: string | null;
}

/** Extract weight in kg from quantity string (e.g. "500g", "1 kg", "2x250ml") */
function extractWeightKg(quantity: string | null | undefined): number {
  if (!quantity || typeof quantity !== 'string') return 0.5; // default 0.5 kg
  const normalized = quantity.toLowerCase().trim();
  // Match patterns like "500g", "500 g", "0.5kg", "1 kg", "1kg"
  const gMatch = normalized.match(/(\d+(?:\.\d+)?)\s*g(?:ram)?s?(?:\s|$|,)/i);
  if (gMatch) return parseFloat(gMatch[1]) / 1000;
  const kgMatch = normalized.match(/(\d+(?:\.\d+)?)\s*k(?:ilo)?g?(?:\s|$|,)/i);
  if (kgMatch) return parseFloat(kgMatch[1]);
  const mlMatch = normalized.match(/(\d+(?:\.\d+)?)\s*m(?:illi)?l(?:itre)?s?(?:\s|$|,)/i);
  if (mlMatch) return parseFloat(mlMatch[1]) / 1000; // approximate 1:1 density
  return 0.5;
}

function findBestCategoryFactor(categories: string): number {
  const lower = categories.toLowerCase();
  for (const [keyword, factor] of Object.entries(EMISSION_FACTORS)) {
    if (keyword === 'default') continue;
    if (lower.includes(keyword)) return factor;
  }
  return EMISSION_FACTORS.default;
}

function getPackagingEstimate(packaging: string | null | undefined): number {
  if (!packaging || typeof packaging !== 'string') return PACKAGING_FACTORS.default;
  const lower = packaging.toLowerCase();
  for (const [keyword, factor] of Object.entries(PACKAGING_FACTORS)) {
    if (keyword === 'default') continue;
    if (lower.includes(keyword)) return factor;
  }
  return PACKAGING_FACTORS.default;
}

export function calculateCarbonFootprint(data: ProductDataForCarbon): number {
  const weightKg = extractWeightKg(data.quantity);
  const categories = data.categories ?? '';
  const factor = findBestCategoryFactor(categories);
  const baseFootprint = weightKg * factor;
  const packagingAdd = getPackagingEstimate(data.packaging);
  const total = baseFootprint + packagingAdd;
  return Math.round(total * 10) / 10; // 1 decimal
}

export function getEcoScore(footprintPerKg: number): string {
  for (const { maxPerKg, score } of ECO_SCORE_THRESHOLDS) {
    if (footprintPerKg < maxPerKg) return score;
  }
  return 'F';
}

/** Compute eco score from total footprint and weight (for display). */
export function getEcoScoreFromTotalFootprint(totalFootprint: number, weightKg: number): string {
  const perKg = weightKg > 0 ? totalFootprint / weightKg : totalFootprint;
  return getEcoScore(perKg);
}
