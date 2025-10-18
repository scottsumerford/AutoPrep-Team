import { NextResponse } from 'next/server';
import { getAllProfiles } from 'lib/db';

export async function GET() {
  try {
    const profiles = await getAllProfiles();
    
    return NextResponse.json({
      databaseConfigured: true,
      profileCount: profiles.length,
      profiles: profiles,
      error: null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database debug error:', error);
    return NextResponse.json({ 
      databaseConfigured: false,
      profileCount: 0,
      profiles: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
