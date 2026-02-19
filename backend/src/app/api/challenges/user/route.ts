import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { challengeAcceptSchema } from '@/lib/validations';
import { getChallengeProgress } from '@/lib/challenge-progress';
import { ERROR_CODES, errorResponse, getStatusCode } from '@/lib/errors';
import { ApiError } from '@/lib/errors';

export async function GET() {
  try {
    const userId = await getUserId(request);
    const userChallenges = await prisma.userChallenge.findMany({
      where: { userId },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            pointsReward: true,
            criteria: true,
            displayOrder: true,
          },
        },
      },
      orderBy: { challenge: { displayOrder: 'asc' } },
    });

    const withProgress = await Promise.all(
      userChallenges.map(async (uc) => {
        const { progress, target, met } = await getChallengeProgress(userId, uc.challenge);
        return {
          ...uc.challenge,
          progress,
          target,
          completed: uc.completed,
          startedAt: uc.startedAt,
          completedAt: uc.completedAt,
          met,
        };
      })
    );

    return NextResponse.json({ challenges: withProgress });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    const body = await request.json();
    const parsed = challengeAcceptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join('; '), code: ERROR_CODES.VALIDATION_ERROR },
        { status: 400 }
      );
    }
    const { challengeId } = parsed.data;

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId, active: true },
    });
    if (!challenge) {
      throw new ApiError('Challenge not found', ERROR_CODES.NOT_FOUND, 404);
    }

    const existing = await prisma.userChallenge.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
    });
    if (existing) {
      return NextResponse.json(
        { message: 'Challenge already accepted', challengeId },
        { status: 200 }
      );
    }

    await prisma.userChallenge.create({
      data: { userId, challengeId },
    });

    return NextResponse.json(
      { message: 'Challenge accepted', challengeId },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
