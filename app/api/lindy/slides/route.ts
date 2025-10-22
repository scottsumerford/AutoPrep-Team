import { NextRequest, NextResponse } from 'next/server';
import { updateEventSlidesStatus, getEventById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, event_title, event_description, attendee_email } = body;

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

    // Get Lindy API key
    const lindyApiKey = process.env.LINDY_API_KEY;
    
    if (!lindyApiKey) {
      console.error('❌ Lindy API key not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Lindy API key not configured' 
      }, { status: 500 });
    }

    const agentId = '68ed392b02927e7ace232732'; // Slides Generation Agent

    console.log('🔗 Triggering Slides Generation Lindy agent via API');
    console.log('📍 Agent ID:', agentId);

    // Prepare the payload for the agent
    const agentPayload = {
      input: {
        calendar_event_id: event_id,
        event_title: event_title,
        event_description: event_description,
        attendee_email: attendee_email,
        webhook_url: process.env.LINDY_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'https://team.autoprep.ai'}/api/lindy/webhook`
      }
    };

    console.log('📤 Sending to agent:', agentPayload);

    // Call the Lindy API to invoke the agent
    const lindyResponse = await fetch(`https://api.lindy.ai/v1/agents/${agentId}/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lindyApiKey}`,
      },
      body: JSON.stringify(agentPayload)
    });

    if (!lindyResponse.ok) {
      const errorText = await lindyResponse.text();
      console.error('❌ Lindy API failed:', {
        status: lindyResponse.status,
        error: errorText
      });
      return NextResponse.json({ 
        success: false, 
        error: `Lindy API failed: ${lindyResponse.status}` 
      }, { status: 500 });
    }

    const lindyData = await lindyResponse.json();
    console.log('✅ Slides generation triggered successfully');
    console.log('📊 Lindy response:', lindyData);
    
    return NextResponse.json({
      success: true,
      message: 'Slides generation started. You will be notified when they are ready.',
      event_id,
      lindy_response: lindyData
    });
  } catch (error) {
    console.error('Error generating slides:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate slides' 
    }, { status: 500 });
  }
}
