import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, getStatusCode } from '@/lib/errors';

function levelFromPoints(points: number): number {
  if (points < 0) return 0;
  return Math.floor(points / 100) + 1;
}

export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);
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

    const [scanCount, completedChallenges, earnedBadges, ecoScans, categoryData] = await Promise.all([
      prisma.scan.count({ where: { userId } }),
      prisma.userChallenge.count({ where: { userId, completed: true } }),
      prisma.userBadge.count({ where: { userId } }),
      prisma.scan.count({
        where: {
          userId,
          product: { ecoScore: { in: ['A', 'B'] } },
        },
      }),
      // Category analysis: count scans by category
      prisma.scan.groupBy({
        by: ['productId'],
        where: { userId },
        _count: { id: true },
      }).then(async (grouped) => {
        const productIds = grouped.map((g) => g.productId).filter((id): id is string => id !== null);
        if (productIds.length === 0) return [];
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, category: true },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));
        const categoryCounts: Record<string, number> = {};
        grouped.forEach((g) => {
          if (!g.productId) return;
          const product = productMap.get(g.productId);
          if (product?.category) {
            const mainCategory = product.category.split(',')[0]?.trim() ?? product.category;
            categoryCounts[mainCategory] = (categoryCounts[mainCategory] ?? 0) + (g._count.id ?? 0);
          }
        });
        return Object.entries(categoryCounts)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 categories
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
      topCategories: categoryData,
    });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
