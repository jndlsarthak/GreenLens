import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { verifyToken } from '@/lib/jwt';
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

/**
 * Get user ID from session (cookie) or from Authorization: Bearer <token>.
 * Pass request in API route handlers so cross-origin frontend can use Bearer token.
 */
export async function getUserId(request?: Request): Promise<string> {
  if (request) {
    const auth = request.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7);
      const payload = await verifyToken(token);
      if (payload) return payload.id;
    }
  }
  const session = await requireAuth();
  const id = (session.user as { id?: string })?.id;
  if (!id) throw new ApiError('User ID not in session', ERROR_CODES.UNAUTHORIZED, 401);
  return id;
}
