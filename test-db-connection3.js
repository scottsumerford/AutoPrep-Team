const postgres = require('postgres');

const connectionString = 'postgresql://postgres.kmswrzzlirdfnzzbnrpo:C9EX%40%2EVJ%2B8%23ndk-@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

console.log('Testing Supabase connection with fully encoded password...');
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
    
    // Test creating a table
    console.log('\nTesting table creation...');
    await sql`CREATE TABLE IF NOT EXISTS test_profiles (id SERIAL PRIMARY KEY, name TEXT)`;
    console.log('✅ Table creation successful!');
    
    // Test inserting data
    console.log('\nTesting data insertion...');
    await sql`INSERT INTO test_profiles (name) VALUES ('Test User')`;
    console.log('✅ Data insertion successful!');
    
    // Test querying data
    console.log('\nTesting data query...');
    const profiles = await sql`SELECT * FROM test_profiles`;
    console.log('✅ Data query successful! Found', profiles.length, 'profiles');
    
    // Clean up
    await sql`DROP TABLE IF EXISTS test_profiles`;
    console.log('✅ Cleanup successful!');
    
    await sql.end();
    console.log('\n🎉 ALL TESTS PASSED! Database is working perfectly!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

testConnection();
