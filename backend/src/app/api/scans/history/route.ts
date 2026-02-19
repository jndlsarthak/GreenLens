import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, getStatusCode } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);
    const from = searchParams.get('from'); // ISO date
    const to = searchParams.get('to');

    const where: { userId: string; createdAt?: { gte?: Date; lte?: Date } } = { userId };
    if (from) where.createdAt = { ...where.createdAt, gte: new Date(from) };
    if (to) where.createdAt = { ...where.createdAt, lte: new Date(to) };

    const [scans, total] = await Promise.all([
      prisma.scan.findMany({
        where,
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
          product: { select: { ecoScore: true, category: true } },
        },
      }),
      prisma.scan.count({ where }),
    ]);

    return NextResponse.json({
      scans,
      pagination: { total, limit, offset },
    });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
