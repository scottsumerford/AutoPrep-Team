import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * POST /api/db/apply-schema
 * 
 * Applies the database schema updates for new file storage columns
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Applying database schema updates...');
    
    // Add columns to profiles table
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_file TEXT`;
    console.log('✅ Added company_info_file column');
    
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_text TEXT`;
    console.log('✅ Added company_info_text column');
    
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slides_file TEXT`;
    console.log('✅ Added slides_file column');
    
    // Add columns to calendar_events table
    await sql`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_content TEXT`;
    console.log('✅ Added presales_report_content column');
    
    await sql`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS slides_content TEXT`;
    console.log('✅ Added slides_content column');
    
    console.log('✅ Schema updates applied successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Database schema updated successfully',
      columns_added: [
        'profiles.company_info_file',
        'profiles.company_info_text',
        'profiles.slides_file',
        'calendar_events.presales_report_content',
        'calendar_events.slides_content'
      ]
    });
  } catch (error) {
    console.error('❌ Error applying schema:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to apply schema updates',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
