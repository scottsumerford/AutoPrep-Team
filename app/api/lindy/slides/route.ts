import { NextRequest, NextResponse } from 'next/server';
import { updateEventSlidesStatus, getEventById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, event_title, event_description, attendee_email, file_id } = body;

    console.log('🎬 Starting slides generation:', {
      event_id,
      event_title,
      attendee_email,
      file_id
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

    // Validate file_id is provided (required for slides generation)
    if (!file_id) {
      console.error('❌ File ID not provided for slides generation');
      return NextResponse.json({ 
        success: false, 
        error: 'File ID is required for slides generation' 
      }, { status: 400 });
    }

    const webhookUrl = 'https://api.lindy.ai/webhook/66bf87f2-034e-463b-a7da-83e9adbf03d4';

    console.log('🔗 Triggering Slides Generation Lindy agent via webhook');
    console.log('📍 Webhook URL:', webhookUrl);

    // Prepare the payload for the agent
    // Note: Slides agent expects the pre-sales report file ID
    const agentPayload = {
      fileId: file_id,
      mimeType: 'application/pdf',
      format: 'Google Slides',
      // Additional context for the agent
      meeting_title: event_title,
      attendee_email: attendee_email,
      webhook_url: process.env.LINDY_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'https://team.autoprep.ai'}/api/lindy/webhook`,
      calendar_event_id: event_id
    };

    console.log('📤 Sending to agent:', agentPayload);

    // Call the webhook to invoke the agent (no authentication required for slides)
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentPayload)
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('❌ Webhook failed:', {
        status: webhookResponse.status,
        error: errorText
      });
      return NextResponse.json({ 
        success: false, 
        error: `Webhook failed: ${webhookResponse.status}` 
      }, { status: 500 });
    }

    const webhookData = await webhookResponse.json();
    console.log('✅ Slides generation triggered successfully');
    console.log('📊 Webhook response:', webhookData);
    
    return NextResponse.json({
      success: true,
      message: 'Slides generation started. You will be notified when they are ready.',
      event_id,
      webhook_response: webhookData
    });
  } catch (error) {
    console.error('Error generating slides:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate slides' 
    }, { status: 500 });
  }
}
