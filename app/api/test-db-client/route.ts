import { NextResponse } from 'next/server';
import { createClient } from '@vercel/postgres';

export async function GET() {
  try {
    // Use createClient instead of createPool as error message suggests
    const client = createClient({
      connectionString: 'postgres://postgres.zxvlpqkgzfbqnxqnwpjd:Autoprep2024!@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
    });
    
    await client.connect();
    const { rows } = await client.query('SELECT NOW() as current_time, version() as pg_version');
    await client.end();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful with createClient!',
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
