import { NextRequest, NextResponse } from 'next/server';
import { updateProfile, getProfileById } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('Microsoft OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}?error=${encodeURIComponent(error)}`
    );
  }

  // Validate required parameters
  if (!code || !state) {
    console.error('Missing required parameters:', { code: !!code, state: !!state });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}?error=missing_parameters`
    );
  }

  try {
    const profileId = state;
    console.log('Microsoft OAuth callback - Profile ID:', profileId);

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID || '',
        client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/callback/microsoft`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange failed:', errorData);
      throw new Error(errorData.error_description || errorData.error || 'Token exchange failed');
    }

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error('Token response error:', tokens.error, tokens.error_description);
      throw new Error(tokens.error_description || tokens.error);
    }

    console.log('Successfully obtained tokens, updating profile...');

    // Update profile with access token
    await updateProfile(parseInt(profileId), {
      outlook_access_token: tokens.access_token,
      outlook_refresh_token: tokens.refresh_token || undefined
    });

    console.log('Profile updated successfully');

    // Get the profile to retrieve the URL slug
    const profile = await getProfileById(parseInt(profileId));
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
        body: JSON.stringify({ profile_id: profileId }),
      });

      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        console.log('Calendar sync successful:', syncData);
      } else {
        const errorText = await syncResponse.text();
        console.error('Calendar sync failed:', errorText);
      }
    } catch (syncError) {
      console.error('Error triggering calendar sync:', syncError);
      // Don't fail the OAuth flow if sync fails
    }

    // Redirect back to profile page using URL slug
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/profile/${profile.url_slug}?synced=true`;
    console.log('Redirecting to:', redirectUrl);
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Microsoft OAuth callback error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}?error=${encodeURIComponent(
        error instanceof Error ? error.message : 'Authentication failed'
      )}`
    );
  }
}
