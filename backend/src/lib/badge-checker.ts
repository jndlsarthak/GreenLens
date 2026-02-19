import { prisma } from '@/lib/prisma';
import type { Badge } from '@prisma/client';

export async function checkBadgeEligibility(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalPoints: true, streakDays: true },
  });
  if (!user) return;

  const earnedBadgeIds = (
    await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    })
  ).map((b) => b.badgeId);

  const badges = await prisma.badge.findMany({
    where: { id: { notIn: earnedBadgeIds } },
    orderBy: { displayOrder: 'asc' },
  });

  const scanCount = await prisma.scan.count({ where: { userId } });
  const ecoScansCount = await prisma.scan.count({
    where: {
      userId,
      product: { ecoScore: { in: ['A', 'B'] } },
    },
  });

  for (const badge of badges) {
    let met = false;
    switch (badge.criteriaType) {
      case 'scans_total':
        met = scanCount >= badge.criteriaValue;
        break;
      case 'streak_days':
        met = user.streakDays >= badge.criteriaValue;
        break;
      case 'eco_products':
        met = ecoScansCount >= badge.criteriaValue;
        break;
      case 'points_total':
        met = user.totalPoints >= badge.criteriaValue;
        break;
      default:
        break;
    }
    if (met) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
    }
  }
}
