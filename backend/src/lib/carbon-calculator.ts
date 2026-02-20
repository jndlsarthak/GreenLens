/**
 * Enhanced rule-based carbon footprint calculator.
 * Emission factors: kg CO2e per kg of product.
 * Based on scientific sources: Poore & Nemecek (2018), Our World in Data.
 */

const EMISSION_FACTORS: Record<string, number> = {
  // Meat (highest impact)
  beef: 60,
  lamb: 24,
  mutton: 24,
  pork: 7,
  ham: 7.5,
  bacon: 8,
  poultry: 6,
  chicken: 6,
  turkey: 6.5,
  duck: 6.5,
  
  // Seafood
  fish: 5,
  salmon: 6,
  tuna: 6,
  cod: 4,
  shrimp: 12,
  prawns: 12,
  shellfish: 8,
  
  // Dairy
  dairy: 3.5,
  milk: 3.2,
  cheese: 21,
  'hard-cheese': 21,
  'soft-cheese': 12,
  yogurt: 3.3,
  'greek-yogurt': 3.5,
  butter: 12,
  cream: 7,
  'ice-cream': 3.5,
  eggs: 4.5,
  
  // Plant-based proteins
  legumes: 0.9,
  beans: 0.9,
  lentils: 0.9,
  chickpeas: 0.9,
  tofu: 2.0,
  tempeh: 2.2,
  'soy-milk': 1.0,
  'almond-milk': 0.7,
  'oat-milk': 0.9,
  
  // Grains & Cereals
  rice: 4,
  'brown-rice': 3.5,
  wheat: 1.4,
  oats: 2.5,
  quinoa: 2.1,
  barley: 1.2,
  rye: 1.2,
  grains: 1.2,
  bread: 0.8,
  'whole-wheat-bread': 0.7,
  pasta: 1.5,
  'whole-wheat-pasta': 1.3,
  noodles: 1.5,
  
  // Fruits & Vegetables
  vegetables: 0.8,
  'fresh-vegetables': 0.8,
  'frozen-vegetables': 0.9,
  fruits: 0.9,
  'fresh-fruits': 0.9,
  'frozen-fruits': 1.0,
  tomatoes: 2.2, // greenhouse-grown
  'field-tomatoes': 1.4,
  avocados: 2.0,
  bananas: 0.7,
  apples: 0.4,
  oranges: 0.3,
  berries: 0.5,
  
  // Nuts & Seeds
  nuts: 0.3,
  almonds: 2.3,
  walnuts: 0.3,
  peanuts: 2.5,
  cashews: 3.2,
  seeds: 0.3,
  
  // Beverages
  'soft-drinks': 0.3,
  'carbonated-drinks': 0.3,
  cola: 0.3,
  'fruit-juice': 0.9,
  'orange-juice': 0.9,
  'apple-juice': 0.7,
  coffee: 17,
  'instant-coffee': 19,
  tea: 0.2,
  'green-tea': 0.2,
  'black-tea': 0.2,
  'herbal-tea': 0.2,
  'alcoholic': 2.4,
  beer: 0.6,
  wine: 1.4,
  spirits: 2.4,
  
  // Processed Foods
  chocolate: 19,
  'dark-chocolate': 19,
  'milk-chocolate': 19,
  cookies: 1.8,
  biscuits: 1.8,
  chips: 2.3,
  'potato-chips': 2.3,
  crackers: 1.5,
  snacks: 2.0,
  
  // Oils & Fats
  oil: 3.3,
  'vegetable-oil': 3.3,
  'olive-oil': 6.0,
  'palm-oil': 7.5,
  'coconut-oil': 3.2,
  'sunflower-oil': 3.3,
  'rapeseed-oil': 3.2,
  margarine: 2.0,
  
  // Sweeteners & Condiments
  sugar: 0.9,
  'white-sugar': 0.9,
  'brown-sugar': 0.9,
  honey: 1.0,
  'maple-syrup': 1.0,
  salt: 0.1,
  vinegar: 0.5,
  ketchup: 1.2,
  mayonnaise: 2.0,
  
  // Other
  'ready-meals': 3.5,
  'frozen-meals': 3.0,
  'canned-food': 1.5,
  'dried-food': 1.0,
  plastic: 3,
  'processed-food': 2.5,
  
  // Default fallback
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

/** Single eco score thresholds (kg CO2e per kg) – same for all products */
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
  novaScore?: number | null; // NOVA processing level (1-4)
  ingredients?: string | null; // Ingredients list for better matching
}

/** Extract weight in kg from quantity string (e.g. "500g", "1 kg", "2x250ml", "500g net / 550g gross"). Exported for use in eco score calculation. */
export function extractWeightKg(quantity: string | null | undefined): number {
  if (!quantity || typeof quantity !== 'string') return 0.5; // default 0.5 kg
  const normalized = quantity.toLowerCase().trim();
  
  // Match "net" weight first (e.g., "500g net / 550g gross")
  const netMatch = normalized.match(/(\d+(?:\.\d+)?)\s*g(?:ram)?s?\s*net/i);
  if (netMatch) return parseFloat(netMatch[1]) / 1000;
  
  // Match patterns like "500g", "500 g", "0.5kg", "1 kg", "1kg"
  const gMatch = normalized.match(/(\d+(?:\.\d+)?)\s*g(?:ram)?s?(?:\s|$|,|x)/i);
  if (gMatch) return parseFloat(gMatch[1]) / 1000;
  
  const kgMatch = normalized.match(/(\d+(?:\.\d+)?)\s*k(?:ilo)?g?(?:\s|$|,)/i);
  if (kgMatch) return parseFloat(kgMatch[1]);
  
  // Handle "2x250ml" or "2 x 250ml"
  const multiMlMatch = normalized.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*m(?:illi)?l/i);
  if (multiMlMatch) {
    const count = parseFloat(multiMlMatch[1]);
    const ml = parseFloat(multiMlMatch[2]);
    return (count * ml) / 1000;
  }
  
  const mlMatch = normalized.match(/(\d+(?:\.\d+)?)\s*m(?:illi)?l(?:itre)?s?(?:\s|$|,)/i);
  if (mlMatch) return parseFloat(mlMatch[1]) / 1000; // approximate 1:1 density
  
  // Handle "2x250g" format
  const multiGMatch = normalized.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*g/i);
  if (multiGMatch) {
    const count = parseFloat(multiGMatch[1]);
    const g = parseFloat(multiGMatch[2]);
    return (count * g) / 1000;
  }
  
  return 0.5;
}

/**
 * Find best matching emission factor using hierarchical category matching.
 * Open Food Facts categories are hierarchical (e.g., "en:beverages,en:soft-drinks,en:cola")
 */
function findBestCategoryFactor(categories: string, ingredients?: string | null): number {
  const lower = categories.toLowerCase();
  const ingredientsLower = ingredients?.toLowerCase() ?? '';
  const combined = `${lower} ${ingredientsLower}`;
  
  // Try exact matches first (most specific)
  const categoryList = lower.split(',').map(c => c.trim().replace(/^en:/, ''));
  
  // Check each category level (most specific to least specific)
  for (const cat of categoryList) {
    const normalized = cat.replace(/[-_]/g, '-');
    if (EMISSION_FACTORS[normalized]) {
      return EMISSION_FACTORS[normalized];
    }
  }
  
  // Try keyword matching (fuzzy)
  const matches: Array<{ keyword: string; factor: number; priority: number }> = [];
  
  for (const [keyword, factor] of Object.entries(EMISSION_FACTORS)) {
    if (keyword === 'default') continue;
    
    // Check if keyword appears in categories or ingredients
    const inCategories = lower.includes(keyword);
    const inIngredients = ingredientsLower.includes(keyword);
    
    if (inCategories || inIngredients) {
      // Priority: exact category match > ingredient match > partial match
      let priority = 1;
      if (categoryList.some(c => c.includes(keyword))) priority = 3;
      else if (inCategories) priority = 2;
      else if (inIngredients) priority = 1;
      
      matches.push({ keyword, factor, priority });
    }
  }
  
  if (matches.length > 0) {
    // Sort by priority (highest first), then return the best match
    matches.sort((a, b) => b.priority - a.priority);
    return matches[0].factor;
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

/**
 * Calculate carbon footprint with enhanced factors:
 * - Better category matching
 * - NOVA score adjustment (more processing = higher emissions)
 * - Packaging consideration
 * - Ingredient-based matching
 */
export function calculateCarbonFootprint(data: ProductDataForCarbon): number {
  const weightKg = extractWeightKg(data.quantity);
  const categories = data.categories ?? '';
  const factor = findBestCategoryFactor(categories, data.ingredients);
  
  // Base footprint from product category
  let baseFootprint = weightKg * factor;
  
  // Adjust for processing level (NOVA score: 1=unprocessed, 4=ultra-processed)
  // Ultra-processed foods have higher emissions due to manufacturing
  if (data.novaScore !== null && data.novaScore !== undefined) {
    const processingMultiplier = 1 + (data.novaScore - 1) * 0.15; // +0%, +15%, +30%, +45%
    baseFootprint *= processingMultiplier;
  }
  
  // Add packaging emissions
  const packagingAdd = getPackagingEstimate(data.packaging);
  
  const total = baseFootprint + packagingAdd;
  return Math.round(total * 10) / 10; // 1 decimal
}

/** Get eco score (A–F) from footprint per kg – same scale for all products. */
export function getEcoScore(footprintPerKg: number): string {
  for (const { maxPerKg, score } of ECO_SCORE_THRESHOLDS) {
    if (footprintPerKg < maxPerKg) return score;
  }
  return 'F';
}

/** Compute eco score from total footprint and weight. */
export function getEcoScoreFromTotalFootprint(totalFootprint: number, weightKg: number): string {
  const perKg = weightKg > 0 ? totalFootprint / weightKg : totalFootprint;
  return getEcoScore(perKg);
}
