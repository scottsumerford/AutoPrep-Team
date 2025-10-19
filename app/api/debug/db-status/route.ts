import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Check if calendar_events table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'calendar_events'
      );
    `;
    
    // Count events in the table
    let eventCount = 0;
    let sampleEvents = [];
    
    if (tableCheck.rows[0].exists) {
      const countResult = await sql`SELECT COUNT(*) as count FROM calendar_events`;
      eventCount = parseInt(countResult.rows[0].count);
      
      // Get sample events
      const sampleResult = await sql`SELECT * FROM calendar_events LIMIT 5`;
      sampleEvents = sampleResult.rows;
    }
    
    // Check profiles table
    const profilesResult = await sql`SELECT id, name, email, 
      google_access_token IS NOT NULL as has_google_token,
      google_refresh_token IS NOT NULL as has_google_refresh
      FROM profiles`;
    
    return NextResponse.json({
      success: true,
      calendar_events_table_exists: tableCheck.rows[0].exists,
      total_events: eventCount,
      sample_events: sampleEvents,
      profiles: profilesResult.rows
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
