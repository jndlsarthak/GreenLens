import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, getStatusCode } from '@/lib/errors';

export async function GET() {
  try {
    const userId = await getUserId();
    const allBadges = await prisma.badge.findMany({
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
    const earned = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true, earnedAt: true },
    });
    const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));

    const badges = allBadges.map((b) => ({
      ...b,
      earned: earnedMap.has(b.id),
      earnedAt: earnedMap.get(b.id) ?? null,
    }));

    return NextResponse.json({ badges });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
