import { NextRequest, NextResponse } from 'next/server';
import { getProfileBySlug } from '@/lib/db';

/**
 * GET /api/profiles/slug/[slug]
 * Fetch a profile by its URL slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    console.log('🔍 Fetching profile by slug:', slug);
    
    const profile = await getProfileBySlug(slug);
    
    if (!profile) {
      console.log('❌ Profile not found with slug:', slug);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Profile found:', { id: profile.id, name: profile.name, slug: profile.url_slug });
    return NextResponse.json(profile);
  } catch (error) {
    console.error('❌ Error fetching profile by slug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
