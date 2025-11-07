import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/lib/db';
import { dataUrlToBuffer } from '@/lib/pdf-generator';

/**
 * API endpoint to download a pre-sales report as PDF
 * Handles both data URLs (base64) and external URLs
 * 
 * Query params:
 * - eventId: The calendar event ID
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing eventId parameter' },
        { status: 400 }
      );
    }

    // Get the event from database
    const event = await getEventById(parseInt(eventId));

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.presales_report_url) {
      return NextResponse.json(
        { error: 'No report available for this event' },
        { status: 404 }
      );
    }

    // Check if it's a data URL (base64 encoded PDF)
    if (event.presales_report_url.startsWith('data:')) {
      try {
        const buffer = dataUrlToBuffer(event.presales_report_url);
        
        // Generate a filename based on event title and date
        const eventDate = new Date(event.start_time).toISOString().split('T')[0];
        const sanitizedTitle = event.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
        const filename = `PreSales_Report_${sanitizedTitle}_${eventDate}.pdf`;

        // Convert Buffer to Uint8Array for NextResponse
        const uint8Array = new Uint8Array(buffer);

        return new NextResponse(uint8Array, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length.toString(),
          },
        });
      } catch (error) {
        console.error('Error converting data URL to buffer:', error);
        return NextResponse.json(
          { error: 'Failed to process PDF data' },
          { status: 500 }
        );
      }
    }

    // If it's an external URL, redirect to it
    return NextResponse.redirect(event.presales_report_url);

  } catch (error) {
    console.error('Error downloading report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to download report',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
