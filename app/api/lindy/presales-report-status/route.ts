import { NextRequest, NextResponse } from 'next/server';
import { updateEventPresalesStatus, getEventById } from '@/lib/db';
import { generatePdfFromContent, bufferToDataUrl } from '@/lib/pdf-generator';

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
 * 1. First checks the database
 * 2. Then queries AirTable for "Report Content" field matching calendarEventId
 * 3. If report content is found, generates a PDF and stores it
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
        reportContent: event.presales_report_content || null,
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
    console.log('🔍 [PRESALES_STATUS] Looking for record with Calendar Event ID:', eventId);

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
    console.log('🔎 [PRESALES_STATUS] Searching through', records.length, 'records for matching Calendar Event ID');

    const matchingRecord = records.find((record: AirTableRecord) => {
      const fields = record.fields || {};
      const calendarEventId = fields['Calendar Event ID'] || fields['calendar_event_id'] || fields['Event ID'] || fields['event_id'];
      
      console.log(`  📋 Checking record ${record.id}:`, {
        calendarEventId,
        hasReportContent: !!fields['Report Content'],
        hasReportUrl: !!fields['Report URL']
      });

      // Match by Calendar Event ID (as string comparison)
      return calendarEventId?.toString() === eventId.toString();
    });

    if (matchingRecord) {
      const fields = matchingRecord.fields || {};
      const reportContent = fields['Report Content'] || fields['report_content'];
      const reportUrl = fields['Report URL'] || fields['PDF URL'] || fields['report_url'];
      const status = fields['Status'] || fields['status'] || 'completed';

      console.log('✅ [PRESALES_STATUS] Report found in AirTable:', {
        recordId: matchingRecord.id,
        status,
        hasReportUrl: !!reportUrl,
        hasReportContent: !!reportContent,
        reportContentLength: typeof reportContent === 'string' ? reportContent.length : 0
      });

      let pdfUrl: string | undefined;
      const storedContent: string | undefined = typeof reportContent === 'string' ? reportContent : undefined;

      // If we have report content, generate a PDF
      if (reportContent && typeof reportContent === 'string') {
        console.log('📄 [PRESALES_STATUS] Generating PDF from report content...');
        console.log('📝 [PRESALES_STATUS] Report content length:', reportContent.length, 'characters');
        
        try {
          const pdfBuffer = await generatePdfFromContent(
            reportContent,
            `Pre-Sales Report - ${event.title}`
          );
          pdfUrl = bufferToDataUrl(pdfBuffer, 'application/pdf');
          console.log('✅ [PRESALES_STATUS] PDF generated successfully, size:', pdfBuffer.length, 'bytes');
        } catch (pdfError) {
          console.error('❌ [PRESALES_STATUS] Error generating PDF:', pdfError);
          // Continue without PDF, we still have the content
        }
      } else if (reportUrl && typeof reportUrl === 'string') {
        // If there's already a report URL in AirTable, use it
        pdfUrl = reportUrl;
        console.log('✅ [PRESALES_STATUS] Using existing Report URL from AirTable:', pdfUrl);
      }

      // Update the database with the report URL and content
      if ((pdfUrl && typeof pdfUrl === 'string') || (storedContent && typeof storedContent === 'string')) {
        console.log('💾 [PRESALES_STATUS] Updating database with report from AirTable');
        const updatedEvent = await updateEventPresalesStatus(
          parseInt(eventId), 
          'completed', 
          pdfUrl || undefined,
          storedContent || undefined
        );
        console.log('✅ [PRESALES_STATUS] Database updated with report');
        
        if (updatedEvent) {
          console.log('📊 [PRESALES_STATUS] Updated event:', {
            id: updatedEvent.id,
            status: updatedEvent.presales_report_status,
            hasPdfUrl: !!updatedEvent.presales_report_url,
            hasContent: !!updatedEvent.presales_report_content
          });
        }
      }

      return NextResponse.json({
        success: true,
        found: true,
        status,
        reportUrl: pdfUrl,
        reportContent: storedContent || null,
        recordId: matchingRecord.id,
        source: 'airtable'
      });
    }

    console.log('⏳ [PRESALES_STATUS] Report not yet available in AirTable');
    console.log('📋 [PRESALES_STATUS] Available records in AirTable:');
    records.forEach((record: AirTableRecord) => {
      const fields = record.fields || {};
      const calendarEventId = fields['Calendar Event ID'] || fields['calendar_event_id'] || fields['Event ID'] || fields['event_id'];
      console.log(`  - Record ${record.id}: Calendar Event ID = ${calendarEventId}`);
    });

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
