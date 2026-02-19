import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { scanSchema } from '@/lib/validations';
import { recordScan } from '@/lib/scan-service';
import { ERROR_CODES, errorResponse, getStatusCode } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    const body = await request.json();
    const parsed = scanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join('; '), code: ERROR_CODES.VALIDATION_ERROR },
        { status: 400 }
      );
    }
    const { barcode, productId, productName, carbonFootprint } = parsed.data;

    let productNameFinal = productName ?? `Product ${barcode}`;
    let carbonFootprintFinal = carbonFootprint;
    let productIdFinal: string | null = productId ?? null;

    if (productIdFinal && carbonFootprintFinal === undefined) {
      const product = await prisma.product.findUnique({
        where: { id: productIdFinal },
      });
      if (product) {
        productNameFinal = product.name;
        carbonFootprintFinal = product.carbonFootprint;
      }
    }
    if (carbonFootprintFinal === undefined) carbonFootprintFinal = 2.0; // fallback

    const scan = await recordScan({
      userId,
      barcode,
      productId: productIdFinal,
      productName: productNameFinal,
      carbonFootprint: carbonFootprintFinal,
    });

    return NextResponse.json(
      {
        id: scan.id,
        barcode: scan.barcode,
        productName: scan.productName,
        carbonFootprint: scan.carbonFootprint,
        pointsEarned: scan.pointsEarned,
        createdAt: scan.createdAt,
      },
      { status: 201 }
    );
  } catch (err) {
    logger.error('Scan record failed', { error: err });
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const [scans, total] = await Promise.all([
      prisma.scan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          barcode: true,
          productName: true,
          carbonFootprint: true,
          pointsEarned: true,
          createdAt: true,
          productId: true,
        },
      }),
      prisma.scan.count({ where: { userId } }),
    ]);

    return NextResponse.json({
      scans,
      pagination: { total, limit, offset },
    });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
