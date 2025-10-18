// Database client configuration
// This module provides a database client that explicitly uses POSTGRES_URL
// and ignores all the auto-generated POSTGRES_URL_* variables

import { createClient, VercelClient } from '@vercel/postgres';

let client: VercelClient | null = null;

export function getDbClient(): VercelClient {
  if (!process.env.POSTGRES_URL) {
    throw new Error('❌ POSTGRES_URL environment variable is not set');
  }
  
  if (!client) {
    console.log('✅ Creating database client with POSTGRES_URL');
    const url = process.env.POSTGRES_URL;
    const portMatch = url.match(/:(\d+)\//);
    const port = portMatch ? portMatch[1] : 'unknown';
    console.log(`   Connection port: ${port} ${port === '6543' ? '(pooled ✅)' : port === '5432' ? '(direct ❌)' : ''}`);
    
    client = createClient({
      connectionString: process.env.POSTGRES_URL
    });
  }
  
  return client;
}

export function isDatabaseConfigured(): boolean {
  return !!process.env.POSTGRES_URL;
}

// Execute a query using the explicit client
export async function query<T = unknown>(text: string, params?: unknown[]): Promise<{ rows: T[] }> {
  const client = getDbClient();
  await client.connect();
  try {
    const result = await client.query(text, params);
    return { rows: result.rows as T[] };
  } finally {
    await client.end();
  }
}
