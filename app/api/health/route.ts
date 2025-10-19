import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      configured: !!process.env.POSTGRES_URL,
      hasUrl: !!process.env.POSTGRES_URL,
      urlLength: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.length : 0
    }
  });
}
