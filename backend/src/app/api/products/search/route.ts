import { NextResponse } from 'next/server';
import { searchProducts } from '@/lib/open-food-facts';
import { errorResponse, getStatusCode } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() ?? '';
    if (!q) {
      return NextResponse.json({ products: [] });
    }
    const products = await searchProducts(q);
    return NextResponse.json({
      products: products.map((p) => ({
        barcode: p.barcode,
        name: p.name,
        brand: p.brand,
        category: p.category,
        imageUrl: p.imageUrl,
        carbonFootprint: p.carbonFootprint,
        ecoScore: p.ecoScore,
        nutriScore: p.nutriScore,
        novaScore: p.novaScore,
      })),
    });
  } catch (err) {
    logger.error('Product search failed', { error: err });
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
