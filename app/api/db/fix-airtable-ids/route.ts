import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    console.log('🔧 Fixing airtable_record_ids...');

    // Update Scott Sumerford's profile with the airtable_record_id
    const result = await sql`
      UPDATE profiles 
      SET airtable_record_id = 'recq4zQfWclBVJUve'
      WHERE email = 'scottsumerford@gmail.com'
      RETURNING id, name, email, airtable_record_id
    `;

    console.log('✅ Updated profile:', result.rows[0]);

    return NextResponse.json({
      success: true,
      message: 'Airtable IDs fixed',
      updated: result.rows,
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to fix airtable IDs', details: String(error) },
      { status: 500 }
    );
  }
}
