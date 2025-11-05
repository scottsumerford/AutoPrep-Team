import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Extract Supabase URL from POSTGRES_URL
    const postgresUrl = process.env.POSTGRES_URL;
    if (!postgresUrl) {
      return NextResponse.json({ error: 'POSTGRES_URL not configured' }, { status: 500 });
    }

    const match = postgresUrl.match(/postgres\.([a-z0-9]+):/);
    if (!match) {
      return NextResponse.json({ error: 'Could not extract Supabase project reference' }, { status: 500 });
    }

    const projectRef = match[1];
    const supabaseUrl = `https://${projectRef}.supabase.co`;
    
    // Use service role key (password from connection string)
    const passwordMatch = postgresUrl.match(/:([^@]+)@/);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Could not extract service role key' }, { status: 500 });
    }

    const serviceRoleKey = passwordMatch[1];
    
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔧 Running storage policy fix...');

    // Run the SQL fixes
    const sqlCommands = [
      // Update bucket to be public
      `UPDATE storage.buckets SET public = true WHERE name = 'Files'`,
      
      // Drop existing policies
      `DROP POLICY IF EXISTS "Allow public read access" ON storage.objects`,
      `DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects`,
      `DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects`,
      `DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects`,
      `DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects`,
      `DROP POLICY IF EXISTS "Allow public updates" ON storage.objects`,
      `DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects`,
      
      // Create new policies
      `CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'Files')`,
      `CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'Files')`,
      `CREATE POLICY "Allow public updates" ON storage.objects FOR UPDATE USING (bucket_id = 'Files') WITH CHECK (bucket_id = 'Files')`,
      `CREATE POLICY "Allow public deletes" ON storage.objects FOR DELETE USING (bucket_id = 'Files')`,
    ];

    const results = [];
    for (const sql of sqlCommands) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        if (error) {
          console.error('❌ Error executing SQL:', sql, error);
          results.push({ sql: sql.substring(0, 50) + '...', error: error.message });
        } else {
          console.log('✅ Executed:', sql.substring(0, 50) + '...');
          results.push({ sql: sql.substring(0, 50) + '...', success: true });
        }
      } catch (err) {
        console.error('❌ Exception executing SQL:', err);
        results.push({ sql: sql.substring(0, 50) + '...', error: String(err) });
      }
    }

    return NextResponse.json({
      message: 'Storage policy fix attempted',
      results,
      note: 'If this fails, please run the SQL manually in Supabase Dashboard SQL Editor'
    });

  } catch (error) {
    console.error('❌ Error in fix-storage endpoint:', error);
    return NextResponse.json({
      error: 'Failed to fix storage policies',
      message: error instanceof Error ? error.message : String(error),
      instructions: 'Please run the SQL manually in Supabase Dashboard: https://supabase.com/dashboard → SQL Editor → Run SUPABASE_STORAGE_FIX.sql'
    }, { status: 500 });
  }
}
