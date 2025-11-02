const postgres = require('postgres');

const connectionString = 'postgresql://postgres.kmswrzzlirdfnzzbnrpo:C9EX%40.VJ%2B8%23ndk-@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

console.log('Testing Supabase connection...');
console.log('Connection string:', connectionString.replace(/:([^@]+)@/, ':****@'));

const sql = postgres(connectionString, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    const result = await sql`SELECT version()`;
    console.log('✅ Connection successful!');
    console.log('Database version:', result[0].version);
    
    // Test creating a simple table
    console.log('\nTesting table creation...');
    await sql`CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name TEXT)`;
    console.log('✅ Table creation successful!');
    
    // Clean up
    await sql`DROP TABLE IF EXISTS test_table`;
    console.log('✅ Cleanup successful!');
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

testConnection();
