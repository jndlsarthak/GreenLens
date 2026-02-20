/**
 * OpenCO2 API integration for carbon footprint calculations.
 * https://www.openco2.net/en/api-description/
 * 
 * OpenCO2 provides validated emission factors for various product categories.
 * Requires API key authentication.
 */

import { logger } from '@/lib/logger';

const OPENCO2_BASE_URL = 'https://api.openco2.net/v1'; // Update with actual API URL
const OPENCO2_API_KEY = process.env.OPENCO2_API_KEY;

export interface OpenCO2EmissionFactor {
  category: string;
  factor: number; // kg CO2e per unit
  unit: string;
  source?: string;
  year?: number;
}

export interface OpenCO2ProductRequest {
  category: string;
  quantity?: number;
  unit?: string; // 'kg', 'g', 'liter', etc.
}

/**
 * Search for emission factors by category name.
 * OpenCO2 categories include: Food and drink, Products, etc.
 */
export async function searchEmissionFactor(
  category: string,
  subcategory?: string
): Promise<OpenCO2EmissionFactor | null> {
  if (!OPENCO2_API_KEY) {
    logger.debug('OpenCO2 API key not configured, skipping API call');
    return null;
  }

  try {
    // Map product categories to OpenCO2 categories
    const openco2Category = mapToOpenCO2Category(category, subcategory);
    if (!openco2Category) return null;

    // Construct API request (adjust endpoint based on actual OpenCO2 API docs)
    const url = `${OPENCO2_BASE_URL}/emission-factors/search`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCO2_API_KEY}`,
        'User-Agent': 'GreenLens-MVP/1.0',
      },
      body: JSON.stringify({
        category: openco2Category,
        unit: 'kg',
      }),
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      logger.warn(`OpenCO2 API error: ${response.status} for category ${category}`);
      return null;
    }

    const data = await response.json();
    
    // Parse response (adjust based on actual API response format)
    if (data.factor && typeof data.factor === 'number') {
      return {
        category: data.category || category,
        factor: data.factor,
        unit: data.unit || 'kg',
        source: data.source,
        year: data.year,
      };
    }

    return null;
  } catch (err) {
    logger.error('OpenCO2 API call failed', { category, error: err });
    return null;
  }
}

/**
 * Calculate carbon footprint using OpenCO2 emission factor.
 */
export async function calculateWithOpenCO2(
  category: string,
  weightKg: number,
  subcategory?: string
): Promise<number | null> {
  const factor = await searchEmissionFactor(category, subcategory);
  if (!factor) return null;

  // Convert factor to kg CO2e per kg if needed
  let factorPerKg = factor.factor;
  
  if (factor.unit === 'g') {
    factorPerKg = factor.factor / 1000; // Convert g to kg
  } else if (factor.unit === 'tonne' || factor.unit === 't') {
    factorPerKg = factor.factor * 1000; // Convert tonne to kg
  } else if (factor.unit !== 'kg') {
    // If unit is different (e.g., per liter), approximate conversion
    logger.warn(`OpenCO2 factor unit ${factor.unit} may need conversion`);
  }

  const carbonFootprint = weightKg * factorPerKg;
  return Math.round(carbonFootprint * 10) / 10; // 1 decimal
}

/**
 * Map product categories to OpenCO2 API categories.
 * OpenCO2 categories: Food and drink, Products, Waste, etc.
 */
function mapToOpenCO2Category(category: string, subcategory?: string): string | null {
  const lower = category.toLowerCase();
  
  // Food and drink categories
  if (lower.includes('food') || lower.includes('drink') || lower.includes('beverage')) {
    if (lower.includes('meat') || lower.includes('beef') || lower.includes('pork') || lower.includes('chicken')) {
      return 'Food and drink/Meat';
    }
    if (lower.includes('dairy') || lower.includes('milk') || lower.includes('cheese')) {
      return 'Food and drink/Dairy';
    }
    if (lower.includes('vegetable') || lower.includes('fruit')) {
      return 'Food and drink/Vegetables and fruits';
    }
    if (lower.includes('grain') || lower.includes('cereal') || lower.includes('bread')) {
      return 'Food and drink/Grains and cereals';
    }
    if (lower.includes('beverage') || lower.includes('drink') || lower.includes('juice')) {
      return 'Food and drink/Beverages';
    }
    return 'Food and drink';
  }
  
  // Product categories
  if (lower.includes('product') || lower.includes('packaged')) {
    return 'Products';
  }
  
  // If no match, return null to use fallback calculator
  return null;
}

/**
 * Check if OpenCO2 API is configured and available.
 */
export function isOpenCO2Available(): boolean {
  return !!OPENCO2_API_KEY;
}
