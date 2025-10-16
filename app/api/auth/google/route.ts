import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const profileId = searchParams.get('profile_id');
  const code = searchParams.get('code');

  // If no code, redirect to Google OAuth
  if (!code) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/google`;
    
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', clientId || '');
    googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.append('response_type', 'code');
    googleAuthUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email');
    googleAuthUrl.searchParams.append('access_type', 'offline');
    googleAuthUrl.searchParams.append('prompt', 'consent');
    googleAuthUrl.searchParams.append('state', profileId || '');

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // Handle OAuth callback
  try {
    const state = searchParams.get('state');
    const actualProfileId = state || profileId;

    console.log('Google OAuth callback - Profile ID:', actualProfileId);

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/google`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();
    console.log('Token response status:', tokenResponse.status);

    if (tokens.error) {
      console.error('Google token error:', tokens.error, tokens.error_description);
      throw new Error(tokens.error_description || tokens.error);
    }

    // Update profile with access token - using default sql import
    console.log('Updating profile with tokens...');
    await sql`
      UPDATE profiles 
      SET google_access_token = ${tokens.access_token},
          google_refresh_token = ${tokens.refresh_token || null}
      WHERE id = ${actualProfileId}
    `;
    console.log('Profile updated successfully');

    // Redirect back to profile page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/profile/${actualProfileId}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to authenticate with Google',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
