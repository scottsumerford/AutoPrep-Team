// Test Supabase configuration
const postgresUrl = process.env.POSTGRES_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== SUPABASE CONFIGURATION TEST ===\n');

console.log('1. POSTGRES_URL exists:', !!postgresUrl);
if (postgresUrl) {
  const match = postgresUrl.match(/postgres\.([a-z0-9]+):/);
  if (match) {
    const projectRef = match[1];
    console.log('   Project Reference:', projectRef);
    console.log('   Supabase URL:', `https://${projectRef}.supabase.co`);
  } else {
    console.log('   ❌ Could not extract project reference');
  }
}

console.log('\n2. NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!anonKey);
if (anonKey) {
  console.log('   Key length:', anonKey.length);
  console.log('   Key preview:', anonKey.substring(0, 20) + '...');
} else {
  console.log('   ❌ ANON KEY NOT FOUND - This is likely the issue!');
}

console.log('\n=== END TEST ===');
