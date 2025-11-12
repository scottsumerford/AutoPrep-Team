import { NextRequest, NextResponse } from 'next/server';
import { updateProfile, getProfileById } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const profileId = searchParams.get('profile_id');
  const code = searchParams.get('code');

  // If no code, redirect to Microsoft OAuth
  if (!code) {
    const clientId = process.env.MICROSOFT_CLIENT_ID || process.env.OUTLOOK_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/outlook`;
    
    const microsoftAuthUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
    microsoftAuthUrl.searchParams.append('client_id', clientId || '');
    microsoftAuthUrl.searchParams.append('redirect_uri', redirectUri);
    microsoftAuthUrl.searchParams.append('response_type', 'code');
    microsoftAuthUrl.searchParams.append('scope', 'Calendars.Read User.Read offline_access');
    microsoftAuthUrl.searchParams.append('response_mode', 'query');
    microsoftAuthUrl.searchParams.append('state', profileId || '');

    return NextResponse.redirect(microsoftAuthUrl.toString());
  }

  // Handle OAuth callback
  try {
    const state = searchParams.get('state');
    const actualProfileId = state || profileId;

    if (!actualProfileId) {
      throw new Error('Profile ID is required');
    }

    console.log('Outlook OAuth callback - Profile ID:', actualProfileId);

    // Exchange code for tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID || process.env.OUTLOOK_CLIENT_ID || '',
        client_secret: process.env.MICROSOFT_CLIENT_SECRET || process.env.OUTLOOK_CLIENT_SECRET || '',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/outlook`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error('Outlook token error:', tokens.error, tokens.error_description);
      throw new Error(tokens.error_description || tokens.error);
    }

    console.log('Updating profile with Outlook tokens...');
    // Update profile with access token using the shared database module
    await updateProfile(parseInt(actualProfileId), {
      outlook_access_token: tokens.access_token,
      outlook_refresh_token: tokens.refresh_token || undefined
    });
    console.log('Profile updated successfully');

    // Get the profile to retrieve the URL slug
    const profile = await getProfileById(parseInt(actualProfileId));
    if (!profile) {
      throw new Error('Profile not found after update');
    }

    // Trigger calendar sync
    try {
      console.log('Triggering calendar sync...');
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      const syncResponse = await fetch(`${baseUrl}/api/calendar/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_id: actualProfileId }),
      });

      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        console.log('Calendar sync successful:', syncData);
      } else {
        console.error('Calendar sync failed:', await syncResponse.text());
      }
    } catch (syncError) {
      console.error('Error triggering calendar sync:', syncError);
      // Don't fail the OAuth flow if sync fails
    }

    // Redirect back to profile page using URL slug
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/profile/${profile.url_slug}?synced=true`);
  } catch (error) {
    console.error('Outlook OAuth error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to authenticate with Outlook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
