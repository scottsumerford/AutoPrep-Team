import { NextRequest, NextResponse } from 'next/server';
import { updateEventSlidesStatus, getEventById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, event_title, event_description, attendee_email, profile_id } = body;

    console.log('🎬 Starting slides generation:', {
      event_id,
      event_title,
      attendee_email
    });

    // Update status to processing
    await updateEventSlidesStatus(event_id, 'processing');

    // Get the full event details from database
    const event = await getEventById(event_id);
    
    if (!event) {
      console.error('❌ Event not found in database:', event_id);
      return NextResponse.json({ 
        success: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }

    // Trigger the Lindy agent via webhook
    const agentWebhookUrl = process.env.LINDY_SLIDES_WEBHOOK_URL;
    
    if (!agentWebhookUrl) {
      console.error('❌ LINDY_SLIDES_WEBHOOK_URL not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Agent webhook URL not configured' 
      }, { status: 500 });
    }

    console.log('🔗 Triggering Lindy agent via webhook:', agentWebhookUrl);

    // Prepare the payload for the agent
    const agentPayload = {
      calendar_event_id: event_id,
      event_title: event_title,
      event_description: event_description,
      attendee_email: attendee_email,
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://team.autoprep.ai'}/api/lindy/webhook`
    };

    console.log('📤 Sending to agent:', agentPayload);

    // Call the agent webhook
    const agentResponse = await fetch(agentWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentPayload)
    });

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('❌ Agent webhook failed:', {
        status: agentResponse.status,
        error: errorText
      });
      return NextResponse.json({ 
        success: false, 
        error: `Agent webhook failed: ${agentResponse.status}` 
      }, { status: 500 });
    }

    console.log('✅ Slides generation triggered successfully');
    
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
