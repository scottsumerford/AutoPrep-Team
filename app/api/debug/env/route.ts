import "lib/db/config";
import { NextResponse } from 'next/server';

export async function GET() {
  const isDatabaseConfigured = () => {
    return !!(process.env.POSTGRES_URL || process.env.autoprep_POSTGRES_URL);
  };

  return NextResponse.json({
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    hasAutoprep: !!process.env.autoprep_POSTGRES_URL,
    envKeys: Object.keys(process.env)
      .filter(key => key.includes('POSTGRES') || key.includes('autoprep'))
      .sort(),
    isDatabaseConfigured: isDatabaseConfigured(),
    timestamp: new Date().toISOString()
  });
}
