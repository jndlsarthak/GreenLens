import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, getStatusCode } from '@/lib/errors';

function levelFromPoints(points: number): number {
  if (points < 0) return 0;
  return Math.floor(points / 100) + 1;
}

export async function GET() {
  try {
    const userId = await getUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalPoints: true,
        streakDays: true,
        lastScanDate: true,
        lastActiveAt: true,
      },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const [scanCount, completedChallenges, earnedBadges, ecoScans] = await Promise.all([
      prisma.scan.count({ where: { userId } }),
      prisma.userChallenge.count({ where: { userId, completed: true } }),
      prisma.userBadge.count({ where: { userId } }),
      prisma.scan.count({
        where: {
          userId,
          product: { ecoScore: { in: ['A', 'B'] } },
        },
      }),
    ]);

    return NextResponse.json({
      level: levelFromPoints(user.totalPoints),
      totalPoints: user.totalPoints,
      streakDays: user.streakDays,
      lastScanDate: user.lastScanDate,
      lastActiveAt: user.lastActiveAt,
      scanCount,
      completedChallenges,
      earnedBadges,
      ecoFriendlyScans: ecoScans,
    });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
