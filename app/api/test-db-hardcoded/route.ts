import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';

export async function GET() {
  try {
    // Hardcode the pooled connection string for testing
    const pool = createPool({
      connectionString: 'postgres://postgres.zxvlpqkgzfbqnxqnwpjd:Autoprep2024!@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
    });
    
    const { rows } = await pool.sql`SELECT NOW() as current_time, version() as pg_version`;
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful with hardcoded pooled connection string!',
      data: rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
