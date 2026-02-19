import { NextResponse } from 'next/server';

/**
 * Health check endpoint to verify backend is running.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'GreenLens Backend',
  });
}
