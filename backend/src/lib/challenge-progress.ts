import { prisma } from '@/lib/prisma';
import type { Challenge } from '@prisma/client';

type Criteria = { target?: number; category?: string; ecoScores?: string[] };

export type ChallengeForProgress = Pick<Challenge, 'category' | 'criteria'>;

export async function getChallengeProgress(
  userId: string,
  challenge: ChallengeForProgress
): Promise<{ progress: number; target: number; met: boolean }> {
  const criteria = challenge.criteria as Criteria;
  const target = typeof criteria?.target === 'number' ? criteria.target : 0;

  let progress = 0;

  switch (challenge.category) {
    case 'scan_count': {
      const count = await prisma.scan.count({ where: { userId } });
      progress = count;
      break;
    }
    case 'category_count': {
      const category = criteria?.category ?? '';
      const scans = await prisma.scan.findMany({
        where: { userId },
        include: { product: true },
      });
      progress = scans.filter(
        (s) => s.product?.category?.toLowerCase().includes(category.toLowerCase())
      ).length;
      break;
    }
    case 'eco_score': {
      const targetScores = Array.isArray(criteria?.ecoScores)
        ? criteria.ecoScores
        : ['A', 'B'];
      const scans = await prisma.scan.findMany({
        where: { userId },
        include: { product: true },
      });
      progress = scans.filter((s) => s.product && targetScores.includes(s.product.ecoScore)).length;
      break;
    }
    case 'streak': {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { streakDays: true },
      });
      progress = user?.streakDays ?? 0;
      break;
    }
    default:
      progress = 0;
  }

  return { progress, target, met: progress >= target };
}

export async function updateUserChallengeProgress(userId: string): Promise<void> {
  const userChallenges = await prisma.userChallenge.findMany({
    where: { userId, completed: false },
    include: { challenge: true },
  });

  for (const uc of userChallenges) {
    const { progress, target, met } = await getChallengeProgress(userId, uc.challenge);
    await prisma.userChallenge.update({
      where: { userId_challengeId: { userId, challengeId: uc.challengeId } },
      data: {
        progress,
        ...(met
          ? {
              completed: true,
              completedAt: new Date(),
            }
          : {}),
      },
    });
    if (met) {
      await prisma.user.update({
        where: { id: userId },
        data: { totalPoints: { increment: uc.challenge.pointsReward } },
      });
    }
  }
}
