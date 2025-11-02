// Configure database connection
// The POSTGRES_URL environment variable should be set in Vercel
// It must be a POOLED connection string (port 6543, not 5432)

if (!process.env.POSTGRES_URL) {
  console.error('❌ No POSTGRES_URL found in environment variables');
  console.error('Available POSTGRES env vars:', Object.keys(process.env).filter(k => k.includes('POSTGRES')));
} else {
  console.log('✅ POSTGRES_URL is configured');
  // Mask the connection string for security, but show the port to verify it's pooled
  const url = process.env.POSTGRES_URL;
  const portMatch = url.match(/:(\d+)\//);
  const port = portMatch ? portMatch[1] : 'unknown';
  console.log(`   Connection port: ${port} ${port === '6543' ? '(pooled ✅)' : port === '5432' ? '(direct ❌ - should be pooled!)' : ''}`);
}

export {};
