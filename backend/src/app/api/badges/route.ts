import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, getStatusCode } from '@/lib/errors';

export async function GET() {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        iconUrl: true,
        criteriaType: true,
        criteriaValue: true,
        displayOrder: true,
      },
    });
    return NextResponse.json({ badges });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
