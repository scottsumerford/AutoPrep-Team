const postgres = require('postgres');

// Try the direct connection you originally provided
const connectionString = 'postgresql://postgres:C9EX%40%2EVJ%2B8%23ndk-@db.kmswrzzlirdfnzzbnrpo.supabase.co:5432/postgres';

console.log('Testing DIRECT Supabase connection (port 5432)...');
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
    console.log('\n🎉 DIRECT CONNECTION WORKS!');
    console.log('This means we can use the direct connection instead of pooled.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

testConnection();
