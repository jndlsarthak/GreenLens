import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validations';
import { signToken } from '@/lib/jwt';
import { ERROR_CODES, errorResponse, getStatusCode } from '@/lib/errors';

/**
 * Token-based login for cross-origin frontend.
 * Returns JWT and user info; frontend should send Authorization: Bearer <token> on API calls.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join('; '), code: ERROR_CODES.VALIDATION_ERROR },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password', code: ERROR_CODES.UNAUTHORIZED },
        { status: 401 }
      );
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid email or password', code: ERROR_CODES.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const token = await signToken({ id: user.id, email: user.email });
    const level = Math.floor(user.totalPoints / 100) + 1;

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name ?? undefined,
        email: user.email,
        points: user.totalPoints,
        level,
        streakDays: user.streakDays,
      },
    });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
