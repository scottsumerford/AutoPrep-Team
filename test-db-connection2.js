const postgres = require('postgres');

// Try with non-encoded password
const connectionString = 'postgresql://postgres.kmswrzzlirdfnzzbnrpo:C9EX@.VJ+8#ndk-@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

console.log('Testing Supabase connection with non-encoded password...');
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
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();
