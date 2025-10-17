import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Check if profiles table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'profiles'
      );
    `;
    
    // Get all profiles
    const profiles = await sql`SELECT * FROM profiles ORDER BY created_at DESC;`;
    
    // Get table count
    const count = await sql`SELECT COUNT(*) FROM profiles;`;
    
    return NextResponse.json({
      tableExists: tableCheck.rows[0].exists,
      profileCount: count.rows[0].count,
      profiles: profiles.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database debug error:', error);
    return NextResponse.json({ 
      error: 'Failed to query database',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
