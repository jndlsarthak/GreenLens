import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError, ERROR_CODES, errorResponse, getStatusCode } from '@/lib/errors';

/**
 * Get better alternatives for a product (same category, lower carbon footprint).
 * Returns up to 3 products with same or similar category and lower carbon footprint.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ barcode: string }> }
) {
  try {
    const { barcode } = await params;
    if (!barcode) {
      throw new ApiError('Barcode is required', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const product = await prisma.product.findUnique({
      where: { barcode },
      select: { category: true, carbonFootprint: true, ecoScore: true },
    });

    if (!product) {
      throw new ApiError('Product not found', ERROR_CODES.NOT_FOUND, 404);
    }

    // If product has high carbon (C, D, F), find alternatives
    if (!['C', 'D', 'F'].includes(product.ecoScore)) {
      return NextResponse.json({ alternatives: [] });
    }

    const category = product.category;
    if (!category) {
      return NextResponse.json({ alternatives: [] });
    }

    // Find products in same category with lower carbon footprint and better eco score
    const alternatives = await prisma.product.findMany({
      where: {
        category: { contains: category.split(',')[0]?.trim() ?? category, mode: 'insensitive' },
        carbonFootprint: { lt: product.carbonFootprint },
        ecoScore: { in: ['A', 'B'] },
        barcode: { not: barcode },
      },
      orderBy: [
        { ecoScore: 'asc' }, // A before B
        { carbonFootprint: 'asc' },
        { scanCount: 'desc' }, // Popular products first
      ],
      take: 3,
      select: {
        id: true,
        barcode: true,
        name: true,
        brand: true,
        imageUrl: true,
        carbonFootprint: true,
        ecoScore: true,
      },
    });

    // If not enough alternatives in exact category, try broader search
    if (alternatives.length < 2) {
      const categoryKeyword = category.split(',')[0]?.trim() ?? category;
      const broader = await prisma.product.findMany({
        where: {
          OR: [
            { category: { contains: categoryKeyword.split(' ')[0] ?? categoryKeyword, mode: 'insensitive' } },
            { rawCategories: { contains: categoryKeyword, mode: 'insensitive' } },
          ],
          carbonFootprint: { lt: product.carbonFootprint },
          ecoScore: { in: ['A', 'B'] },
          barcode: { not: barcode },
        },
        orderBy: [
          { ecoScore: 'asc' },
          { carbonFootprint: 'asc' },
        ],
        take: 3 - alternatives.length,
        select: {
          id: true,
          barcode: true,
          name: true,
          brand: true,
          imageUrl: true,
          carbonFootprint: true,
          ecoScore: true,
        },
      });
      alternatives.push(...broader);
    }

    // Calculate carbon reduction percentage
    const alternativesWithReduction = alternatives.map((alt) => {
      const reduction = ((product.carbonFootprint - alt.carbonFootprint) / product.carbonFootprint) * 100;
      return {
        ...alt,
        carbonReduction: Math.round(reduction),
      };
    });

    return NextResponse.json({ alternatives: alternativesWithReduction });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
