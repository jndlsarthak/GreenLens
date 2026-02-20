/**
 * Open Food Facts API integration.
 * https://world.openfoodfacts.org/api/v0/product/{barcode}.json
 */

import { logger } from '@/lib/logger';
import { calculateCarbonFootprint, getEcoScoreFromTotalFootprint, extractWeightKg } from '@/lib/carbon-calculator';

const OPEN_FOOD_FACTS_BASE = 'https://world.openfoodfacts.org/api/v0/product';

export interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  categories?: string;
  image_url?: string;
  quantity?: string;
  packaging?: string;
  packaging_tags?: string[];
  ingredients_text?: string; // Ingredients list
  // Open Food Facts carbon data (when available)
  carbon_footprint_from_ingredients_debug?: string;
  carbon_footprint_from_ingredients?: number;
  eco_score_grade?: string; // A-F
  eco_score_value?: number;
  nutriscore_grade?: string; // A-E
  nova_group?: number; // 1-4
  nova_groups?: string;
}

export interface ParsedProduct {
  name: string;
  brand: string | null;
  category: string | null;
  rawCategories: string | null;
  imageUrl: string | null;
  quantity: string | null;
  packaging: string | null;
  carbonFootprint: number;
  ecoScore: string;
  nutriScore?: string | null; // A-E
  novaScore?: number | null; // 1-4
}

async function parseProductFromResponse(body: { product?: OpenFoodFactsProduct }): Promise<ParsedProduct | null> {
  const p = body?.product;
  if (!p) return null;

  const name = p.product_name?.trim() ?? 'Unknown Product';
  const brand = p.brands?.split(',')[0]?.trim() ?? null;
  const categories = p.categories ?? null;
  const rawCategories = categories;
  const imageUrl = p.image_url ?? null;
  const quantity = p.quantity ?? null;
  const packaging =
    p.packaging ?? (Array.isArray(p.packaging_tags) ? p.packaging_tags.join(', ') : null) ?? null;
  const ingredients = p.ingredients_text ?? null;

  // Extract NOVA score early (needed for calculations)
  const novaScore = p.nova_group && p.nova_group >= 1 && p.nova_group <= 4 
    ? p.nova_group 
    : (p.nova_groups ? parseInt(p.nova_groups.split(',')[0]?.trim() || '0') : null);
  const novaScoreFinal = novaScore && novaScore >= 1 && novaScore <= 4 ? novaScore : null;

  // Extract weight for calculations (handles g, kg, ml, 2x250ml, etc.)
  const weightKg = extractWeightKg(quantity);
  const weightG = weightKg * 1000;

  // Use only Open Food Facts data: OFF carbon/eco when available, else enhanced calculator from OFF fields
  let carbonFootprint: number;
  let ecoScore: string;

  if (p.carbon_footprint_from_ingredients !== undefined && p.carbon_footprint_from_ingredients > 0) {
    // Open Food Facts carbon: g CO2e per 100g → convert to kg CO2e for product
    carbonFootprint = (p.carbon_footprint_from_ingredients * weightG) / 100000;
    carbonFootprint = Math.round(carbonFootprint * 10) / 10;
    if (p.eco_score_grade && /^[A-F]$/i.test(p.eco_score_grade)) {
      ecoScore = p.eco_score_grade.toUpperCase();
    } else {
      ecoScore = getEcoScoreFromTotalFootprint(carbonFootprint, weightKg);
    }
  } else {
    // Enhanced calculator using only OFF data (categories, quantity, packaging, ingredients)
    carbonFootprint = calculateCarbonFootprint({
      categories,
      quantity,
      packaging,
      novaScore: novaScoreFinal,
      ingredients,
    });
    ecoScore = getEcoScoreFromTotalFootprint(carbonFootprint, weightKg);
  }

  // Extract Nutri-Score
  const nutriScore = p.nutriscore_grade && /^[A-E]$/i.test(p.nutriscore_grade) 
    ? p.nutriscore_grade.toUpperCase() 
    : null;

  return {
    name,
    brand,
    category: categories?.split(',')[0]?.trim() ?? null,
    rawCategories,
    imageUrl,
    quantity,
    packaging,
    carbonFootprint,
    ecoScore,
    nutriScore: nutriScore ?? null,
    novaScore: novaScoreFinal,
    // Note: calculationSource is logged but not returned (can be added if needed)
  };
}

export async function fetchProductByBarcode(barcode: string): Promise<ParsedProduct | null> {
  const url = `${OPEN_FOOD_FACTS_BASE}/${encodeURIComponent(barcode)}.json`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'GreenLens-MVP/1.0 (Environmental Impact Assistant)' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      logger.warn(`Open Food Facts API error: ${res.status} for barcode ${barcode}`);
      return null;
    }
    const data = (await res.json()) as { product?: OpenFoodFactsProduct; status?: number };
    if (data.status === 0 || !data.product) {
      logger.info(`Product not found in Open Food Facts: ${barcode}`);
      return null;
    }
    return await parseProductFromResponse(data);
  } catch (err) {
    logger.error('Open Food Facts fetch failed', { barcode, error: err });
    throw err;
  }
}

const OFF_SEARCH_BASE = 'https://world.openfoodfacts.org/cgi/search.pl';

/** Search Open Food Facts by product name; returns products with carbon and eco score (up to 6). */
export async function searchProducts(query: string): Promise<(ParsedProduct & { barcode: string })[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const params = new URLSearchParams({
      action: 'process',
      search_terms: trimmed,
      search_simple: '1',
      json: '1',
      page_size: '12',
      fields: 'code,product_name,brands',
    });
    const res = await fetch(`${OFF_SEARCH_BASE}?${params.toString()}`, {
      headers: { 'User-Agent': 'GreenLens-MVP/1.0 (Environmental Impact Assistant)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      logger.warn(`Open Food Facts search error: ${res.status}`);
      return [];
    }
    const data = (await res.json()) as { count?: number; products?: Array<{ code?: string; product_name?: string; brands?: string }> };
    const products = data.products ?? [];
    const barcodes = products
      .map((p) => p.code)
      .filter((c): c is string => typeof c === 'string' && c.length > 0)
      .slice(0, 6);

    const results = await Promise.all(
      barcodes.map(async (barcode) => {
        const parsed = await fetchProductByBarcode(barcode);
        if (!parsed) return null;
        return { ...parsed, barcode };
      })
    );

    return results.filter((r): r is ParsedProduct & { barcode: string } => r !== null);
  } catch (err) {
    logger.error('Open Food Facts search failed', { query: trimmed, error: err });
    return [];
  }
}
