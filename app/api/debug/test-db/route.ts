import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const dbConfigured = !!process.env.POSTGRES_URL;
    
    // Try a simple query
    let queryResult = null;
    let insertResult = null;
    let error = null;
    
    try {
      // Test SELECT
      queryResult = await sql`SELECT NOW() as current_time`;
      
      // Test INSERT into calendar_events
      insertResult = await sql`
        INSERT INTO calendar_events (
          profile_id, event_id, title, description, start_time, end_time, attendees, source
        )
        VALUES (
          3, 'test-event-' || NOW()::text, 'Test Event', 'Test Description',
          NOW(), NOW() + INTERVAL '1 hour', '[]'::jsonb, 'google'
        )
        RETURNING *
      `;
    } catch (e) {
      error = {
        message: e instanceof Error ? e.message : 'Unknown error',
        stack: e instanceof Error ? e.stack : undefined
      };
    }
    
    return NextResponse.json({
      dbConfigured,
      postgresUrl: process.env.POSTGRES_URL ? 'SET' : 'NOT SET',
      queryResult: queryResult?.rows,
      insertResult: insertResult?.rows,
      error
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
