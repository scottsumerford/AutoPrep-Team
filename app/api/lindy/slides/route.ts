import { NextRequest, NextResponse } from 'next/server';
import { updateEventSlidesStatus } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, event_title, event_description, attendee_email } = body;

    console.log('🎨 Starting slides generation:', {
      event_id,
      event_title
    });

    // Update status to processing
    await updateEventSlidesStatus(event_id, 'processing');

    console.log('✅ Slides generation initiated successfully');
    
    // The Lindy agent will call the webhook when it's done
    // No need to call the Lindy API directly - the agent is configured to handle this
    
    return NextResponse.json({
      success: true,
      message: 'Slides generation started. You will be notified when it is ready.',
      event_id
    });
  } catch (error) {
    console.error('Error generating slides:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate slides' 
    }, { status: 500 });
  }
}
