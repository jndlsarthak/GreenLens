import { prisma } from '@/lib/prisma';
import { calculateNewStreak, applyStreakChange } from '@/lib/streak';
import { updateUserChallengeProgress } from '@/lib/challenge-progress';
import { checkBadgeEligibility } from '@/lib/badge-checker';
import type { NewlyEarnedBadge } from '@/lib/badge-checker';

const POINTS_PER_SCAN = 10;

export interface RecordScanInput {
  userId: string;
  barcode: string;
  productId: string | null;
  productName: string;
  carbonFootprint: number;
}

export interface RecordScanResult {
  scan: Awaited<ReturnType<typeof prisma.scan.create>>;
  newlyEarnedBadges: NewlyEarnedBadge[];
}

export async function recordScan(input: RecordScanInput): Promise<RecordScanResult> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { lastScanDate: true, streakDays: true },
  });

  const streakChange = calculateNewStreak(user?.lastScanDate ?? null, today);
  const newStreak = applyStreakChange(user?.streakDays ?? 0, streakChange);

  const scan = await prisma.scan.create({
    data: {
      userId: input.userId,
      productId: input.productId,
      barcode: input.barcode,
      productName: input.productName,
      carbonFootprint: input.carbonFootprint,
      pointsEarned: POINTS_PER_SCAN,
    },
  });

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      totalPoints: { increment: POINTS_PER_SCAN },
      lastActiveAt: now,
      lastScanDate: today,
      ...(streakChange !== 0 ? { streakDays: newStreak } : {}),
    },
  });

  if (input.productId) {
    await prisma.product.update({
      where: { id: input.productId },
      data: { scanCount: { increment: 1 } },
    });
  }

  await updateUserChallengeProgress(input.userId);
  const newlyEarnedBadges = await checkBadgeEligibility(input.userId);

  return { scan, newlyEarnedBadges };
}
