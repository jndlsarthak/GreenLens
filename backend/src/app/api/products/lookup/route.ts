import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { fetchProductByBarcode } from '@/lib/open-food-facts';
import { calculateCarbonFootprint, getEcoScoreFromTotalFootprint } from '@/lib/carbon-calculator';
import { ERROR_CODES, errorResponse, getStatusCode } from '@/lib/errors';
import { logger } from '@/lib/logger';

const bodySchema = z.object({ barcode: z.string().min(1, 'Barcode is required') });

/** Fallback: minimal product with estimated footprint when API returns nothing */
function createFallbackProduct(barcode: string): {
  name: string;
  brand: string | null;
  category: string | null;
  rawCategories: string | null;
  imageUrl: string | null;
  carbonFootprint: number;
  ecoScore: string;
} {
  const carbonFootprint = 2.0; // default estimate kg CO2e
  const ecoScore = getEcoScoreFromTotalFootprint(carbonFootprint, 0.5);
  return {
    name: `Product ${barcode}`,
    brand: null,
    category: null,
    rawCategories: null,
    imageUrl: null,
    carbonFootprint,
    ecoScore,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join('; '), code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    const { barcode } = parsed.data;

    // 1. Check local cache
    const cached = await prisma.product.findUnique({
      where: { barcode },
    });
    if (cached) {
      return NextResponse.json({
        id: cached.id,
        barcode: cached.barcode,
        name: cached.name,
        brand: cached.brand,
        category: cached.category,
        rawCategories: cached.rawCategories,
        imageUrl: cached.imageUrl,
        carbonFootprint: cached.carbonFootprint,
        ecoScore: cached.ecoScore,
        nutriScore: cached.nutriScore,
        novaScore: cached.novaScore,
        lastUpdated: cached.lastUpdated,
        scanCount: cached.scanCount,
        source: 'cache',
      });
    }

    // 2. Call Open Food Facts
    let productData: ReturnType<typeof createFallbackProduct>;
    try {
      const fromApi = await fetchProductByBarcode(barcode);
      productData = fromApi ?? createFallbackProduct(barcode);
    } catch (err) {
      logger.error('Open Food Facts failed', { barcode, error: err });
      productData = createFallbackProduct(barcode);
    }

    // 3. Save to cache
    const created = await prisma.product.create({
      data: {
        barcode,
        name: productData.name,
        brand: productData.brand,
        category: productData.category,
        rawCategories: productData.rawCategories,
        imageUrl: productData.imageUrl,
        carbonFootprint: productData.carbonFootprint,
        ecoScore: productData.ecoScore,
        nutriScore: productData.nutriScore ?? null,
        novaScore: productData.novaScore ?? null,
      },
    });

    return NextResponse.json({
      id: created.id,
      barcode: created.barcode,
      name: created.name,
      brand: created.brand,
      category: created.category,
      rawCategories: created.rawCategories,
      imageUrl: created.imageUrl,
      carbonFootprint: created.carbonFootprint,
      ecoScore: created.ecoScore,
      nutriScore: created.nutriScore,
      novaScore: created.novaScore,
      lastUpdated: created.lastUpdated,
      scanCount: created.scanCount,
      source: 'api',
    });
  } catch (err) {
    logger.error('Product lookup failed', { error: err });
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
