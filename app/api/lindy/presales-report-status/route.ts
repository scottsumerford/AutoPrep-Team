import { NextRequest, NextResponse } from 'next/server';
import { updateEventPresalesStatus, getEventById } from '@/lib/db';

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
 * GET /api/lindy/presales-report-status?event_id=123
 * 
 * Polls AirTable for the generated pre-sales report.
 * This endpoint checks if the report has been generated and returns the download link.
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

    console.log('🔍 [PRESALES_STATUS] Checking AirTable for report status:', eventId);

    // Get the event from database to find the associated profile
    const event = await getEventById(parseInt(eventId));
    
    if (!event) {
      console.error('❌ Event not found:', eventId);
      return NextResponse.json({ 
        success: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }

    // Query AirTable for the report
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
    
    console.log('🌐 [PRESALES_STATUS] Querying AirTable:', airtableUrl);

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
    console.log('📊 [PRESALES_STATUS] AirTable response:', JSON.stringify(airtableData, null, 2));

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
      const reportUrl = fields['Report URL'] || fields['PDF URL'] || fields['report_url'];
      const status = fields['Status'] || fields['status'] || 'completed';

      console.log('✅ [PRESALES_STATUS] Report found in AirTable:', {
        recordId: matchingRecord.id,
        status,
        reportUrl
      });

      // Update the database with the report URL
      if (reportUrl && typeof reportUrl === 'string') {
        await updateEventPresalesStatus(parseInt(eventId), 'completed', reportUrl);
        console.log('✅ [PRESALES_STATUS] Database updated with report URL');
      }

      return NextResponse.json({
        success: true,
        found: true,
        status,
        reportUrl,
        recordId: matchingRecord.id
      });
    }

    console.log('⏳ [PRESALES_STATUS] Report not yet available in AirTable');

    return NextResponse.json({
      success: true,
      found: false,
      status: 'processing',
      message: 'Report is still being generated'
    });

  } catch (error) {
    console.error('[PRESALES_STATUS] Error checking report status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check report status',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
