import { NextRequest, NextResponse } from 'next/server';
import { updateProfile } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { profile_id } = await request.json();
    
    if (!profile_id) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    console.log('Disconnecting Google Calendar for profile:', profile_id);

    // Clear Google tokens from profile (use undefined instead of null)
    await updateProfile(parseInt(profile_id), {
      google_access_token: undefined,
      google_refresh_token: undefined
    });

    console.log('✅ Successfully disconnected Google Calendar');

    return NextResponse.json({ 
      success: true,
      message: 'Google Calendar disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return NextResponse.json({ 
      error: 'Failed to disconnect Google Calendar',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
