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

  const carbonFootprint = calculateCarbonFootprint({
    categories,
    quantity,
    packaging,
  });

  // Approximate weight for eco score (kg)
  const weightMatch = quantity?.match(/(\d+(?:\.\d+)?)\s*g/i);
  const weightKg = weightMatch ? parseFloat(weightMatch[1]) / 1000 : 0.5;
  const ecoScore = getEcoScoreFromTotalFootprint(carbonFootprint, weightKg);

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
