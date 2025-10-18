import { NextResponse } from 'next/server';

export async function GET() {
  // Get the connection string (masked for security)
  const connectionString = process.env.POSTGRES_URL || process.env.autoprep_POSTGRES_URL || '';
  
  // Mask the password but show the structure
  const maskedConnection = connectionString.replace(/:([^@]+)@/, ':****@');
  
  return NextResponse.json({
    hasConnection: !!connectionString,
    connectionStructure: maskedConnection,
    fullConnection: connectionString, // We need this to copy it
  });
}
