const postgres = require('postgres');

const connectionString = 'postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

const sql = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

async function addUrlSlugColumn() {
  try {
    console.log('Checking if url_slug column exists...');
    
    // Try to add the column if it doesn't exist
    await sql`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS url_slug VARCHAR(255) UNIQUE
    `;
    
    console.log('✅ url_slug column added or already exists!');
    
    // Update any existing rows to have a url_slug based on their name
    console.log('Updating existing profiles with url_slug...');
    await sql`
      UPDATE profiles 
      SET url_slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '.', ''), ',', ''))
      WHERE url_slug IS NULL
    `;
    
    console.log('✅ Existing profiles updated!');
    
    // Make the column NOT NULL
    await sql`
      ALTER TABLE profiles 
      ALTER COLUMN url_slug SET NOT NULL
    `;
    
    console.log('✅ url_slug column is now NOT NULL!');
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addUrlSlugColumn();
