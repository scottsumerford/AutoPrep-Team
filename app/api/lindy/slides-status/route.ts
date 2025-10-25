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
 * Polls AirTable for the generated slides.
 * This endpoint checks if the slides have been generated and returns the download link.
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

    console.log('🔍 [SLIDES_STATUS] Checking AirTable for slides status:', eventId);

    // Get the event from database to find the associated profile
    const event = await getEventById(parseInt(eventId));
    
    if (!event) {
      console.error('❌ Event not found:', eventId);
      return NextResponse.json({ 
        success: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }

    // Query AirTable for the slides
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
    console.log('📊 [SLIDES_STATUS] AirTable response:', JSON.stringify(airtableData, null, 2));

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
        await updateEventSlidesStatus(parseInt(eventId), 'completed', slidesUrl);
        console.log('✅ [SLIDES_STATUS] Database updated with slides URL');
      }

      return NextResponse.json({
        success: true,
        found: true,
        status,
        slidesUrl,
        recordId: matchingRecord.id
      });
    }

    console.log('⏳ [SLIDES_STATUS] Slides not yet available in AirTable');

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
