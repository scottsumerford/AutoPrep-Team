// Configure database connection
// This must run before any @vercel/postgres imports
if (!process.env.POSTGRES_URL && process.env.autoprep_POSTGRES_URL) {
  process.env.POSTGRES_URL = process.env.autoprep_POSTGRES_URL;
}

export {};
