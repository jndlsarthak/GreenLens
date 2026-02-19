import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ERROR_CODES, errorResponse, getStatusCode } from '@/lib/errors';

const bodySchema = z.object({ email: z.string().email() });

/**
 * Password reset flow - placeholder for MVP.
 * TODO: Integrate email provider (e.g. Resend, SendGrid) to send reset link with token.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join('; '), code: ERROR_CODES.VALIDATION_ERROR },
        { status: 400 }
      );
    }
    const { email } = parsed.data;
    // Placeholder: in production, look up user by email, generate token, store in DB, send email
    return NextResponse.json({
      message: 'If an account exists for this email, you will receive a password reset link.',
      email,
    });
  } catch (err) {
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
