import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';
import { ApiError, ERROR_CODES, errorResponse, getStatusCode } from '@/lib/errors';
import { logger } from '@/lib/logger';

const BCRYPT_ROUNDS = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        parsed.error.errors.map((e) => e.message).join('; ') ?? 'Validation failed',
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }
    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError('User with this email already exists', ERROR_CODES.CONFLICT, 409);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name ?? null,
      },
    });

    // Assign first challenge to new user (challenge with lowest displayOrder)
    const firstChallenge = await prisma.challenge.findFirst({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
    });
    if (firstChallenge) {
      await prisma.userChallenge.create({
        data: {
          userId: user.id,
          challengeId: firstChallenge.id,
        },
      });
    }

    return NextResponse.json(
      { success: true, userId: user.id, email: user.email },
      { status: 201 }
    );
  } catch (err) {
    logger.error('Register failed', { error: err });
    return NextResponse.json(
      errorResponse(err),
      { status: getStatusCode(err) }
    );
  }
}
