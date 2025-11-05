import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  const postgresUrl = process.env.POSTGRES_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  let projectRef = null;
  let supabaseUrl = null;
  
  if (postgresUrl) {
    const match = postgresUrl.match(/postgres\.([a-z0-9]+):/);
    if (match) {
      projectRef = match[1];
      supabaseUrl = `https://${projectRef}.supabase.co`;
    }
  }
  
  return NextResponse.json({
    configured: isSupabaseConfigured(),
    hasPostgresUrl: !!postgresUrl,
    hasAnonKey: !!anonKey,
    projectRef,
    supabaseUrl,
    anonKeyLength: anonKey?.length || 0,
    timestamp: new Date().toISOString(),
  });
}
