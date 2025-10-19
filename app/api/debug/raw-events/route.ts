import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Query all events directly
    const result = await sql`SELECT * FROM calendar_events ORDER BY created_at DESC LIMIT 10`;
    
    // Also check table structure
    const tableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'calendar_events'
    `;
    
    return NextResponse.json({
      events: result.rows,
      eventCount: result.rows.length,
      tableStructure: tableInfo.rows
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
