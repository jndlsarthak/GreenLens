import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, getStatusCode } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function DELETE() {
  try {
    const userId = await getUserId(request);
    await prisma.user.delete({
      where: { id: userId },
    });
    logger.info('User account deleted', { userId });
    return NextResponse.json({ message: 'Account deleted' }, { status: 200 });
  } catch (err) {
    logger.error('Account deletion failed', { error: err });
    return NextResponse.json(errorResponse(err), { status: getStatusCode(err) });
  }
}
