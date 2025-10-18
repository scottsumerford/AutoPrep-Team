// Configure database connection
// This must run before any @vercel/postgres imports
if (!process.env.POSTGRES_URL) {
  // Try different possible environment variable names
  // Priority order: autoprep_POSTGRES_URL (correct) > POSTGRES_PRISMA_URL > POSTGRES_URL_POSTGRES_URL (wrong)
  const possibleVars = [
    'autoprep_POSTGRES_URL',           // Correct connection string (added 2d ago)
    'POSTGRES_PRISMA_URL',
    'POSTGRES_URL_POSTGRES_PRISMA_URL',
    'POSTGRES_URL_POSTGRES_URL'        // Wrong connection string (added 14h ago)
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
