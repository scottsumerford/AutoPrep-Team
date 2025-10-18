// Configure database connection
// This must run before any @vercel/postgres imports
if (!process.env.POSTGRES_URL) {
  // Try different possible environment variable names
  const possibleVars = [
    'POSTGRES_URL_POSTGRES_URL',
    'autoprep_POSTGRES_URL',
    'POSTGRES_PRISMA_URL',
    'POSTGRES_URL_POSTGRES_PRISMA_URL'
  ];
  
  for (const varName of possibleVars) {
    if (process.env[varName]) {
      console.log(`Setting POSTGRES_URL from ${varName}`);
      process.env.POSTGRES_URL = process.env[varName];
      break;
    }
  }
  
  if (!process.env.POSTGRES_URL) {
    console.error('No POSTGRES_URL found in environment variables');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('POSTGRES')));
  }
}

export {};
