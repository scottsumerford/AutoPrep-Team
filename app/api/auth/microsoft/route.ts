import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const profileId = searchParams.get('profile_id');

  if (!profileId) {
    return NextResponse.json(
      { error: 'Profile ID is required' },
      { status: 400 }
    );
  }

  // Build Microsoft OAuth authorization URL
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/callback/microsoft`;
  
  if (!clientId) {
    console.error('MICROSOFT_CLIENT_ID is not configured');
    return NextResponse.json(
      { error: 'Microsoft OAuth is not configured' },
      { status: 500 }
    );
  }

  const microsoftAuthUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
  microsoftAuthUrl.searchParams.append('client_id', clientId);
  microsoftAuthUrl.searchParams.append('redirect_uri', redirectUri);
  microsoftAuthUrl.searchParams.append('response_type', 'code');
  microsoftAuthUrl.searchParams.append('scope', 'Calendars.Read User.Read offline_access');
  microsoftAuthUrl.searchParams.append('response_mode', 'query');
  microsoftAuthUrl.searchParams.append('state', profileId);

  console.log('Redirecting to Microsoft OAuth:', {
    clientId: clientId.substring(0, 8) + '...',
    redirectUri,
    profileId
  });

  return NextResponse.redirect(microsoftAuthUrl.toString());
}
