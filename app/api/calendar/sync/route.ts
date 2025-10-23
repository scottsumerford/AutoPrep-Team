import { NextRequest, NextResponse } from 'next/server';
import { getProfileById, saveCalendarEvent, deleteRemovedCalendarEvents } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { profile_id } = await request.json();
    
    if (!profile_id) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    const profile = await getProfileById(parseInt(profile_id));
    
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let syncedEvents = 0;
    let deletedEvents = 0;

    // Sync Google Calendar if connected
    if (profile.google_access_token) {
      try {
        let accessToken = profile.google_access_token;
        
        // Try to fetch events, refresh token if needed
        let googleEvents;
        try {
          googleEvents = await fetchGoogleCalendarEvents(accessToken);
        } catch (error) {
          // If 401 error and we have a refresh token, try to refresh
          if (error instanceof Error && error.message.includes('Request had invalid') && profile.google_refresh_token) {
            console.log('🔄 Access token expired, refreshing...');
            accessToken = await refreshGoogleAccessToken(profile.google_refresh_token, parseInt(profile_id));
            googleEvents = await fetchGoogleCalendarEvents(accessToken);
          } else {
            throw error;
          }
        }
        
        console.log(`📥 Fetched ${googleEvents.length} events from Google Calendar`);
        
        // Delete events that no longer exist in Google Calendar
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const googleEventIds = googleEvents.map((e: any) => e.id);
        const deleted = await deleteRemovedCalendarEvents(parseInt(profile_id), 'google', googleEventIds);
        deletedEvents += deleted;
        
        for (const event of googleEvents) {
          console.log(`💾 Saving Google event: ${event.summary || 'No Title'} (ID: ${event.id})`);
          try {
            await saveCalendarEvent({
              profile_id: parseInt(profile_id),
              event_id: event.id,
              title: event.summary || 'No Title',
              description: event.description,
              start_time: new Date(event.start.dateTime || event.start.date),
              end_time: new Date(event.end.dateTime || event.end.date),
              attendees: event.attendees?.map((a: { email: string }) => a.email) || [],
              source: 'google'
            });
            syncedEvents++;
            console.log(`✅ Successfully saved event: ${event.summary || 'No Title'}`);
          } catch (saveError) {
            console.error(`❌ Failed to save event ${event.summary || 'No Title'}:`, saveError);
            throw new Error(`Failed to save event: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`);
          }
        }
      } catch (error) {
        console.error('Error syncing Google Calendar:', error);
        return NextResponse.json({ 
          error: 'Failed to sync Google Calendar',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Sync Outlook Calendar if connected
    if (profile.outlook_access_token) {
      try {
        const outlookEvents = await fetchOutlookCalendarEvents(profile.outlook_access_token);
        
        console.log(`📥 Fetched ${outlookEvents.length} events from Outlook Calendar`);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const outlookEventIds = outlookEvents.map((e: any) => e.id);
        // Delete events that no longer exist in Outlook Calendar

        const deleted = await deleteRemovedCalendarEvents(parseInt(profile_id), 'outlook', outlookEventIds);
        deletedEvents += deleted;
        
        for (const event of outlookEvents) {
          console.log(`💾 Saving Outlook event: ${event.subject || 'No Title'} (ID: ${event.id})`);
          await saveCalendarEvent({
            profile_id: parseInt(profile_id),
            event_id: event.id,
            title: event.subject || 'No Title',
            description: event.bodyPreview,
            start_time: new Date(event.start.dateTime),
            end_time: new Date(event.end.dateTime),
            attendees: event.attendees?.map((a: { emailAddress: { address: string } }) => a.emailAddress.address) || [],
            source: 'outlook'
          });
          syncedEvents++;
        }
      } catch (error) {
        console.error('Error syncing Outlook Calendar:', error);
        return NextResponse.json({ 
          error: 'Failed to sync Outlook Calendar',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      synced_events: syncedEvents,
      deleted_events: deletedEvents,
      message: `Successfully synced ${syncedEvents} events and deleted ${deletedEvents} removed events`
    });
  } catch (error) {
    console.error('Error syncing calendar:', error);
    return NextResponse.json({ 
      error: 'Failed to sync calendar',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


async function refreshGoogleAccessToken(refreshToken: string, profileId: number): Promise<string> {
  console.log('🔄 Refreshing Google access token...');
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Failed to refresh token:', error);
    throw new Error(`Failed to refresh Google token: ${error.error_description || error.error}`);
  }

  const tokens = await response.json();
  console.log('✅ Successfully refreshed access token');

  // Update profile with new access token
  const { updateProfile } = await import('@/lib/db');
  await updateProfile(profileId, {
    google_access_token: tokens.access_token,
  });

  return tokens.access_token;
}

async function fetchGoogleCalendarEvents(accessToken: string) {
  const now = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${now.toISOString()}&` +
    `timeMax=${oneMonthFromNow.toISOString()}&` +
    `singleEvents=true&` +
    `orderBy=startTime`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Google Calendar API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.items || [];
}

async function fetchOutlookCalendarEvents(accessToken: string) {
  const now = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/calendar/events?` +
    `$filter=start/dateTime ge '${now.toISOString()}' and start/dateTime le '${oneMonthFromNow.toISOString()}'&` +
    `$orderby=start/dateTime`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Outlook Calendar API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.value || [];
}
