// Migration script to remove operation_mode and manual_email columns from profiles table
const postgres = require('postgres');

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('❌ POSTGRES_URL environment variable is not set');
  process.exit(1);
}

const sql = postgres(connectionString);

async function migrate() {
  try {
    console.log('🔧 Starting migration to remove operation_mode and manual_email columns...');
    
    // Check if columns exist before dropping
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name IN ('operation_mode', 'manual_email')
    `;
    
    if (columns.length === 0) {
      console.log('✅ Columns already removed or do not exist');
      await sql.end();
      return;
    }
    
    console.log(`📋 Found ${columns.length} column(s) to remove:`, columns.map(c => c.column_name));
    
    // Drop operation_mode column if it exists
    if (columns.some(c => c.column_name === 'operation_mode')) {
      await sql`ALTER TABLE profiles DROP COLUMN IF EXISTS operation_mode`;
      console.log('✅ Removed operation_mode column');
    }
    
    // Drop manual_email column if it exists
    if (columns.some(c => c.column_name === 'manual_email')) {
      await sql`ALTER TABLE profiles DROP COLUMN IF EXISTS manual_email`;
      console.log('✅ Removed manual_email column');
    }
    
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
