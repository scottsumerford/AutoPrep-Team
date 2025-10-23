import { NextRequest, NextResponse } from 'next/server';
import { updateEventSlidesStatus, getEventById, markStaleSlidesRuns } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Mark any stale slides runs as failed (> 15 minutes)
    await markStaleSlidesRuns();

    const body = await request.json();
    const { event_id, event_title, event_description, attendee_email } = body;

    console.log('🎨 Starting slides generation:', {
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

    // Get Lindy API key from environment
    const lindy_api_key = process.env.LINDY_API_KEY;
    const agent_id = process.env.LINDY_SLIDES_AGENT_ID || '68ed392b02927e7ace232732';
    
    if (!lindy_api_key) {
      console.error('❌ Lindy API key not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Lindy API key not configured' 
      }, { status: 500 });
    }

    console.log('🔗 Triggering Slides Lindy agent via API');
    console.log('📍 Agent ID:', agent_id);

    // Prepare the payload for the agent
    const agentPayload = {
      calendar_event_id: event_id,
      event_title: event_title,
      event_description: event_description || '',
      attendee_email: attendee_email,
      webhook_url: process.env.LINDY_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'https://team.autoprep.ai'}/api/lindy/webhook`
    };

    console.log('📤 Sending to agent:', agentPayload);

    // Call the Lindy API to invoke the agent
    const agentResponse = await fetch(
      `https://api.lindy.ai/v1/agents/${agent_id}/invoke`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lindy_api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: agentPayload })
      }
    );

    if (!agentResponse.ok) {
      const errorText = await agentResponse.text();
      console.error('❌ Lindy API failed:', {
        status: agentResponse.status,
        error: errorText
      });
      return NextResponse.json({ 
        success: false, 
        error: `Lindy API failed: ${agentResponse.status}` 
      }, { status: 500 });
    }

    const agentData = await agentResponse.json();
    console.log('✅ Slides generation triggered successfully');
    console.log('📊 Agent response:', agentData);
    
    return NextResponse.json({
      success: true,
      message: 'Slides generation started. You will be notified when it is ready.',
      event_id,
      agent_response: agentData
    });
  } catch (error) {
    console.error('Error generating slides:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate slides' 
    }, { status: 500 });
  }
}
