import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    hasAutoprep: !!process.env.autoprep_POSTGRES_URL,
    envKeys: Object.keys(process.env)
      .filter(key => key.includes('POSTGRES') || key.includes('autoprep'))
      .sort(),
    isDatabaseConfigured: !!(process.env.POSTGRES_URL || process.env.autoprep_POSTGRES_URL),
    timestamp: new Date().toISOString()
  });
}
