import { NextRequest, NextResponse } from 'next/server';
import { getProfileById, updateProfile } from '@/lib/db';

/**
 * POST /api/files/upload-text
 * 
 * Saves company information text to the profile in Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, companyInfoText } = body;

    console.log('📝 Company info text save request received:', {
      profileId,
      textLength: companyInfoText?.length,
    });

    // Validation
    if (!profileId) {
      console.error('❌ No profile ID provided');
      return NextResponse.json({ error: 'No profile ID provided' }, { status: 400 });
    }

    if (!companyInfoText || !companyInfoText.trim()) {
      console.error('❌ No company info text provided');
      return NextResponse.json({ error: 'No company info text provided' }, { status: 400 });
    }

    // Get profile
    console.log('🔍 Fetching profile from database...');
    const profile = await getProfileById(parseInt(profileId));

    if (!profile) {
      console.error('❌ Profile not found:', profileId);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    console.log('✅ Profile found:', {
      id: profile.id,
      name: profile.name,
      email: profile.email,
    });

    // Update database with company info text
    console.log('📝 Updating profile with company info text...');
    await updateProfile(profile.id, { 
      company_info_text: companyInfoText.trim() 
    });

    console.log('✅ Company info text saved successfully');
    return NextResponse.json({
      success: true,
      message: 'Company information saved successfully',
    });
  } catch (error) {
    console.error('❌ Unexpected error saving company info text:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('📋 Error message:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Unexpected error', 
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
