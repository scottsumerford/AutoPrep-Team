import { NextResponse } from 'next/server';

export async function GET() {
  const postgresUrl = process.env.POSTGRES_URL;
  const isDatabaseConfigured = !!postgresUrl;
  
  return NextResponse.json({
    isDatabaseConfigured,
    hasPostgresUrl: !!postgresUrl,
    postgresUrlLength: postgresUrl ? postgresUrl.length : 0,
    postgresUrlPreview: postgresUrl ? postgresUrl.substring(0, 20) + '...' : 'NOT SET'
  });
}
