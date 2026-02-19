import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getChallengeProgress } from '@/lib/challenge-progress';
import { updateUserChallengeProgress } from '@/lib/challenge-progress';
import { ERROR_CODES, errorResponse, getStatusCode } from '@/lib/errors';
import { ApiError } from '@/lib/errors';

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request);
    const { id: challengeId } = await params;
    if (!challengeId) {
      throw new ApiError('Challenge ID required', ERROR_CODES.VALIDATION_ERROR, 400);
    }

    await updateUserChallengeProgress(userId);

    const uc = await prisma.userChallenge.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
      include: { challenge: true },
    });
    if (!uc) {
      throw new ApiError('User challenge not found', ERROR_CODES.NOT_FOUND, 404);
    }

    const { progress, target, met } = await getChallengeProgress(userId, uc.challenge);
    return NextResponse.json({
      challengeId,
      progress,
      target,
      completed: uc.completed,
      met,
    });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
