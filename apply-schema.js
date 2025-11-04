import { sql } from '@vercel/postgres';

async function applySchema() {
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
    process.exit(0);
  } catch (error) {
    console.error('❌ Error applying schema:', error);
    process.exit(1);
  }
}

applySchema();
