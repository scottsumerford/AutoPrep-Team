import { NextRequest, NextResponse } from 'next/server';
import { updateEventPresalesStatus, getEventById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, event_title, event_description, attendee_email } = body;

    console.log('📄 Starting pre-sales report generation:', {
      event_id,
      event_title,
      attendee_email
    });

    // Update status to processing
    await updateEventPresalesStatus(event_id, 'processing');

    // Get the full event details from database
    const event = await getEventById(event_id);
    
    if (!event) {
      console.error('❌ Event not found in database:', event_id);
      return NextResponse.json({ 
        success: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }

    // Trigger the Lindy agent via webhook - Pre-sales Report Agent specific webhook
    const webhookUrl = process.env.LINDY_PRESALES_WEBHOOK_URL;
    const webhookSecret = process.env.LINDY_PRESALES_WEBHOOK_SECRET;
    
    if (!webhookUrl) {
      console.error('❌ Pre-sales webhook URL not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Pre-sales webhook URL not configured' 
      }, { status: 500 });
    }

    if (!webhookSecret) {
      console.error('❌ Pre-sales webhook secret not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Pre-sales webhook secret not configured' 
      }, { status: 500 });
    }

    console.log('🔗 Triggering Pre-sales Report Lindy agent via webhook');
    console.log('📍 Webhook URL:', webhookUrl);

    // Prepare the payload for the agent
    const agentPayload = {
      calendar_event_id: event_id,
      event_title: event_title,
      event_description: event_description,
      attendee_email: attendee_email,
      webhook_url: process.env.LINDY_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'https://team.autoprep.ai'}/api/lindy/webhook`
    };

    console.log('📤 Sending to agent:', agentPayload);

    // Call the webhook to invoke the agent
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret,
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

    console.log('✅ Pre-sales report generation triggered successfully');
    
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
