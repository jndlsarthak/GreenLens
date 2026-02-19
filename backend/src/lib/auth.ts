import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ApiError, ERROR_CODES } from '@/lib/errors';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.email) {
    throw new ApiError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);
  }
  return session;
}

export async function getUserId(): Promise<string> {
  const session = await requireAuth();
  const id = (session.user as { id?: string })?.id;
  if (!id) throw new ApiError('User ID not in session', ERROR_CODES.UNAUTHORIZED, 401);
  return id;
}
