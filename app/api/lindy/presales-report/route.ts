import { NextRequest, NextResponse } from 'next/server';
import { updateEventPresalesStatus } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, event_title, event_description, attendee_email } = body;

    console.log('📄 Starting pre-sales report generation:', {
      event_id,
      event_title
    });

    // Update status to processing
    await updateEventPresalesStatus(event_id, 'processing');

    console.log('✅ Pre-sales report generation initiated successfully');
    
    // The Lindy agent will call the webhook when it's done
    // No need to call the Lindy API directly - the agent is configured to handle this
    
    return NextResponse.json({
      success: true,
      message: 'Pre-sales report generation started. You will be notified when it is ready.',
      event_id
    });
  } catch (error) {
    console.error('Error generating pre-sales report:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate pre-sales report' 
    }, { status: 500 });
  }
}
