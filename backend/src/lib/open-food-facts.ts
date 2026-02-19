/**
 * Open Food Facts API integration.
 * https://world.openfoodfacts.org/api/v0/product/{barcode}.json
 */

import { logger } from '@/lib/logger';
import { calculateCarbonFootprint, getEcoScoreFromTotalFootprint } from '@/lib/carbon-calculator';

const OPEN_FOOD_FACTS_BASE = 'https://world.openfoodfacts.org/api/v0/product';

export interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  categories?: string;
  image_url?: string;
  quantity?: string;
  packaging?: string;
  packaging_tags?: string[];
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

function parseProductFromResponse(body: { product?: OpenFoodFactsProduct }): ParsedProduct | null {
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

  // Use Open Food Facts carbon data if available, otherwise calculate
  let carbonFootprint: number;
  let ecoScore: string;
  
  if (p.carbon_footprint_from_ingredients !== undefined && p.carbon_footprint_from_ingredients > 0) {
    // Open Food Facts provides carbon in g CO2e per 100g, convert to kg CO2e
    const weightMatch = quantity?.match(/(\d+(?:\.\d+)?)\s*g/i);
    const weightG = weightMatch ? parseFloat(weightMatch[1]) : 500; // default 500g
    carbonFootprint = (p.carbon_footprint_from_ingredients * weightG) / 100000; // g to kg
    carbonFootprint = Math.round(carbonFootprint * 10) / 10;
    
    // Use Open Food Facts eco_score_grade if available, otherwise calculate
    if (p.eco_score_grade && /^[A-F]$/i.test(p.eco_score_grade)) {
      ecoScore = p.eco_score_grade.toUpperCase();
    } else {
      const weightKg = weightG / 1000;
      ecoScore = getEcoScoreFromTotalFootprint(carbonFootprint, weightKg);
    }
  } else {
    // Fallback to our calculator
    carbonFootprint = calculateCarbonFootprint({
      categories,
      quantity,
      packaging,
    });
    const weightMatch = quantity?.match(/(\d+(?:\.\d+)?)\s*g/i);
    const weightKg = weightMatch ? parseFloat(weightMatch[1]) / 1000 : 0.5;
    ecoScore = getEcoScoreFromTotalFootprint(carbonFootprint, weightKg);
  }

  // Extract Nutri-Score and NOVA if available
  const nutriScore = p.nutriscore_grade && /^[A-E]$/i.test(p.nutriscore_grade) 
    ? p.nutriscore_grade.toUpperCase() 
    : null;
  const novaScore = p.nova_group && p.nova_group >= 1 && p.nova_group <= 4 
    ? p.nova_group 
    : (p.nova_groups ? parseInt(p.nova_groups.split(',')[0]?.trim() || '0') : null);
  const novaScoreFinal = novaScore && novaScore >= 1 && novaScore <= 4 ? novaScore : null;

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
    return parseProductFromResponse(data);
  } catch (err) {
    logger.error('Open Food Facts fetch failed', { barcode, error: err });
    throw err;
  }
}
