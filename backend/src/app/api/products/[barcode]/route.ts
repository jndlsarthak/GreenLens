import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ERROR_CODES, errorResponse, getStatusCode } from '@/lib/errors';
import { ApiError } from '@/lib/errors';

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
    });
    if (!product) {
      throw new ApiError('Product not found', ERROR_CODES.NOT_FOUND, 404);
    }

    return NextResponse.json({
      id: product.id,
      barcode: product.barcode,
      name: product.name,
      brand: product.brand,
      category: product.category,
      rawCategories: product.rawCategories,
      imageUrl: product.imageUrl,
      carbonFootprint: product.carbonFootprint,
      ecoScore: product.ecoScore,
      lastUpdated: product.lastUpdated,
      scanCount: product.scanCount,
    });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
