import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = (
  process.env.CORS_ORIGINS ?? 'http://localhost:3001,http://localhost:3000'
).split(',');

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const res = NextResponse.next();
  if (origin && ALLOWED_ORIGINS.some((o) => o.trim() === origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Access-Control-Max-Age', '86400');

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: res.headers });
  }
  return res;
}

export const config = {
  matcher: '/api/:path*',
};
