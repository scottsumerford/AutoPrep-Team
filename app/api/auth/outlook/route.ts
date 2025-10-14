import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const profileId = searchParams.get('profile_id');
  const code = searchParams.get('code');

  // If no code, redirect to Microsoft OAuth
  if (!code) {
    const clientId = process.env.OUTLOOK_CLIENT_ID;
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

    // Exchange code for tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.OUTLOOK_CLIENT_ID || '',
        client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/outlook`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      throw new Error(tokens.error_description || tokens.error);
    }

    // Update profile with access token
    const { sql } = await import('@vercel/postgres');
    await sql`
      UPDATE profiles 
      SET outlook_access_token = ${tokens.access_token},
          outlook_refresh_token = ${tokens.refresh_token || null}
      WHERE id = ${actualProfileId}
    `;

    // Redirect back to profile page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/profile/${actualProfileId}`);
  } catch (error) {
    console.error('Outlook OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Outlook' },
      { status: 500 }
    );
  }
}
