import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, getStatusCode } from '@/lib/errors';

export async function GET() {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        pointsReward: true,
        criteria: true,
        displayOrder: true,
      },
    });
    return NextResponse.json({ challenges });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
