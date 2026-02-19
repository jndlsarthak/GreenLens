import * as jose from 'jose';

const SECRET = process.env.NEXTAUTH_SECRET!;
const ALG = 'HS256';

export async function signToken(payload: { id: string; email: string }): Promise<string> {
  const secret = new TextEncoder().encode(SECRET);
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ id: string; email: string } | null> {
  try {
    const secret = new TextEncoder().encode(SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    const id = payload.id as string;
    const email = payload.email as string;
    if (!id || !email) return null;
    return { id, email };
  } catch {
    return null;
  }
}
