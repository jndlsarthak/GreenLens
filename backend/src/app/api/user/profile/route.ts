import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { profileUpdateSchema } from '@/lib/validations';
import { ERROR_CODES, errorResponse, getStatusCode } from '@/lib/errors';

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
        id: true,
        email: true,
        name: true,
        totalPoints: true,
        streakDays: true,
        lastScanDate: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: ERROR_CODES.NOT_FOUND },
        { status: 404 }
      );
    }
    return NextResponse.json({
      ...user,
      level: levelFromPoints(user.totalPoints),
    });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join('; '), code: ERROR_CODES.VALIDATION_ERROR },
        { status: 400 }
      );
    }
    const { name, preferences } = parsed.data;
    const updateData: { name?: string | null } = {};
    if (name !== undefined) updateData.name = name;
    // preferences could be stored in a JSON column if added to schema; for MVP we skip

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        totalPoints: true,
        streakDays: true,
        lastScanDate: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });
    return NextResponse.json({
      ...user,
      level: levelFromPoints(user.totalPoints),
    });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
