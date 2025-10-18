import { NextResponse } from 'next/server';

export async function GET() {
  // Get all POSTGRES-related environment variables
  const postgresVars: Record<string, string> = {};
  
  Object.keys(process.env).forEach(key => {
    if (key.includes('POSTGRES')) {
      // Mask sensitive parts but show structure
      const value = process.env[key] || '';
      if (value.includes('@')) {
        // It's a connection string - mask password but show structure
        const masked = value.replace(/:([^:@]+)@/, ':****@');
        postgresVars[key] = masked;
      } else {
        // It's a regular value - show first/last 4 chars
        postgresVars[key] = value.length > 8 
          ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
          : '****';
      }
    }
  });
  
  return NextResponse.json({
    postgresVars,
    count: Object.keys(postgresVars).length,
    timestamp: new Date().toISOString()
  });
}
