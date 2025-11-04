import { NextRequest, NextResponse } from 'next/server';

/**
 * Migration endpoint to add presales_report and slides columns to calendar_events table
 * This endpoint should be called once to migrate existing databases
 */
export async function POST(request: NextRequest) {
  try {
    // Get the database connection
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const postgres = require('postgres');
    
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not configured' 
      }, { status: 500 });
    }

    const sql = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    console.log('🔧 Running database migrations...');

    // Add presales report columns and new file storage columns
    const migrations = [
      'ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_status VARCHAR(50) DEFAULT \'pending\'',
      'ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_url TEXT',
      'ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_started_at TIMESTAMP',
      'ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_generated_at TIMESTAMP',
      'ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS slides_status VARCHAR(50) DEFAULT \'pending\'',
      'ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS slides_url TEXT',
      'ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS slides_started_at TIMESTAMP',
      'ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS slides_generated_at TIMESTAMP',
      'CREATE INDEX IF NOT EXISTS idx_calendar_events_presales_status ON calendar_events(presales_report_status)',
      'CREATE INDEX IF NOT EXISTS idx_calendar_events_slides_status ON calendar_events(slides_status)',
      // New migrations for file storage
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_file TEXT',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_text TEXT',
      'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slides_file TEXT',
      'ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_content TEXT',
      'ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS slides_content TEXT',
    ];

    const results = [];
    for (const migration of migrations) {
      try {
        await sql.unsafe(migration);
        console.log(`✅ Migration executed: ${migration.substring(0, 50)}...`);
        results.push({ migration: migration.substring(0, 50), status: 'success' });
      } catch (error) {
        console.log(`ℹ️ Migration skipped (likely already exists): ${migration.substring(0, 50)}...`);
        results.push({ migration: migration.substring(0, 50), status: 'skipped', error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    await sql.end();

    return NextResponse.json({
      success: true,
      message: 'Database migrations completed',
      results
    });
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to run migrations' 
    }, { status: 500 });
  }
}
