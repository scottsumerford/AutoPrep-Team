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
 * Polls for the generated pre-sales report.
 * First checks the database, then falls back to AirTable.
 * Returns:
 * - PDF URL (for download)
 * - Report Content (text document version)
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

    console.log('🔍 [PRESALES_STATUS] Checking report status for event:', eventId);

    // Get the event from database
    const event = await getEventById(parseInt(eventId));
    
    if (!event) {
      console.error('❌ Event not found:', eventId);
      return NextResponse.json({ 
        success: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }

    // FIRST: Check if the report is already in the database
    console.log('📊 [PRESALES_STATUS] Checking database for report...');
    if (event.presales_report_status === 'completed' && event.presales_report_url) {
      console.log('✅ [PRESALES_STATUS] Report found in database:', event.presales_report_url);
      return NextResponse.json({
        success: true,
        found: true,
        status: 'completed',
        reportUrl: event.presales_report_url,
        reportContent: null,
        source: 'database'
      });
    }

    // SECOND: If not in database, check AirTable
    console.log('🌐 [PRESALES_STATUS] Report not in database, checking AirTable...');

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
    console.log('📊 [PRESALES_STATUS] AirTable response records:', airtableData.records.length);

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
      const reportContent = fields['Report Content'] || fields['report_content'] || null;
      const status = fields['Status'] || fields['status'] || 'completed';

      console.log('✅ [PRESALES_STATUS] Report found in AirTable:', {
        recordId: matchingRecord.id,
        status,
        reportUrl,
        hasReportContent: !!reportContent
      });

      // Update the database with the report URL
      if (reportUrl && typeof reportUrl === 'string') {
        console.log('💾 [PRESALES_STATUS] Updating database with report URL from AirTable');
        await updateEventPresalesStatus(parseInt(eventId), 'completed', reportUrl);
        console.log('✅ [PRESALES_STATUS] Database updated with report URL');
      }

      return NextResponse.json({
        success: true,
        found: true,
        status,
        reportUrl,
        reportContent: reportContent || null,
        recordId: matchingRecord.id,
        source: 'airtable'
      });
    }

    console.log('⏳ [PRESALES_STATUS] Report not yet available');

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
