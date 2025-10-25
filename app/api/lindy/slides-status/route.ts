import { NextRequest, NextResponse } from 'next/server';
import { updateEventSlidesStatus, getEventById } from '@/lib/db';

interface AirTableRecord {
  id: string;
  fields: {
    [key: string]: string | number | boolean | null;
  };
}

interface AirTableResponse {
  records: AirTableRecord[];
}

/**
 * GET /api/lindy/slides-status?event_id=123
 * 
 * Polls for the generated slides.
 * First checks the database, then falls back to AirTable.
 * Returns the download link for the slides.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('event_id');

    if (!eventId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing event_id parameter' 
      }, { status: 400 });
    }

    console.log('🔍 [SLIDES_STATUS] Checking slides status for event:', eventId);

    // Get the event from database
    const event = await getEventById(parseInt(eventId));
    
    if (!event) {
      console.error('❌ Event not found:', eventId);
      return NextResponse.json({ 
        success: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }

    // FIRST: Check if the slides are already in the database
    console.log('📊 [SLIDES_STATUS] Checking database for slides...');
    if (event.slides_status === 'completed' && event.slides_url) {
      console.log('✅ [SLIDES_STATUS] Slides found in database:', event.slides_url);
      return NextResponse.json({
        success: true,
        found: true,
        status: 'completed',
        slidesUrl: event.slides_url,
        source: 'database'
      });
    }

    // SECOND: If not in database, check AirTable
    console.log('🌐 [SLIDES_STATUS] Slides not in database, checking AirTable...');

    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const airtableBaseId = process.env.AIRTABLE_BASE_ID;
    const airtableTableId = process.env.AIRTABLE_TABLE_ID;

    if (!airtableApiKey || !airtableBaseId || !airtableTableId) {
      console.error('❌ AirTable credentials not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'AirTable credentials not configured' 
      }, { status: 500 });
    }

    // Query AirTable for records matching the event ID
    const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableId}`;
    
    console.log('🌐 [SLIDES_STATUS] Querying AirTable:', airtableUrl);

    const airtableResponse = await fetch(airtableUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!airtableResponse.ok) {
      console.error('❌ AirTable query failed:', airtableResponse.status);
      return NextResponse.json({ 
        success: false, 
        error: 'AirTable query failed',
        status: airtableResponse.status
      }, { status: 500 });
    }

    const airtableData = await airtableResponse.json() as AirTableResponse;
    console.log('📊 [SLIDES_STATUS] AirTable response records:', airtableData.records.length);

    // Search for a record matching the event ID
    const records = airtableData.records || [];
    const matchingRecord = records.find((record: AirTableRecord) => {
      const fields = record.fields || {};
      // Look for a field that contains the event ID or calendar event ID
      return fields['Calendar Event ID'] === eventId.toString() || 
             fields['Event ID'] === eventId.toString() ||
             fields['event_id'] === eventId.toString();
    });

    if (matchingRecord) {
      const fields = matchingRecord.fields || {};
      const slidesUrl = fields['Slides URL'] || fields['Presentation URL'] || fields['slides_url'];
      const status = fields['Status'] || fields['status'] || 'completed';

      console.log('✅ [SLIDES_STATUS] Slides found in AirTable:', {
        recordId: matchingRecord.id,
        status,
        slidesUrl
      });

      // Update the database with the slides URL
      if (slidesUrl && typeof slidesUrl === 'string') {
        console.log('💾 [SLIDES_STATUS] Updating database with slides URL from AirTable');
        await updateEventSlidesStatus(parseInt(eventId), 'completed', slidesUrl);
        console.log('✅ [SLIDES_STATUS] Database updated with slides URL');
      }

      return NextResponse.json({
        success: true,
        found: true,
        status,
        slidesUrl,
        recordId: matchingRecord.id,
        source: 'airtable'
      });
    }

    console.log('⏳ [SLIDES_STATUS] Slides not yet available');

    return NextResponse.json({
      success: true,
      found: false,
      status: 'processing',
      message: 'Slides are still being generated'
    });

  } catch (error) {
    console.error('[SLIDES_STATUS] Error checking slides status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check slides status',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
