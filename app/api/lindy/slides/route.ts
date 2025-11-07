import { NextRequest, NextResponse } from 'next/server';
import { updateEventSlidesStatus, getEventById, markStaleSlidesRuns, getProfileById } from '@/lib/db';

/**
 * POST /api/lindy/slides
 * 
 * Triggers the Lindy Slides Generation agent to generate slides for a calendar event.
 * Sends report_url and template_url to the agent, which will post back to callback_url.
 */
export async function POST(request: NextRequest) {
  try {
    // Mark any stale slides runs as failed (> 15 minutes)
    await markStaleSlidesRuns();

    const body = await request.json();
    const { event_id, event_title, event_description, attendee_email } = body;

    console.log('🎬 [SLIDES_WEBHOOK] Starting slides generation:', {
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

    // Get profile to include slide template
    const profile = await getProfileById(event.profile_id);
    if (!profile) {
      console.error('❌ Profile not found for event:', event_id);
      return NextResponse.json({ 
        success: false, 
        error: 'Profile not found' 
      }, { status: 404 });
    }

    // Get webhook URL and secret from environment
    const webhookUrl = process.env.LINDY_SLIDES_WEBHOOK_URL;
    const webhookSecret = process.env.LINDY_SLIDES_WEBHOOK_SECRET;

    if (!webhookUrl) {
      console.error('❌ Slides webhook URL not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Slides webhook URL not configured' 
      }, { status: 500 });
    }

    if (!webhookSecret) {
      console.error('❌ Slides webhook secret not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Slides webhook secret not configured' 
      }, { status: 500 });
    }

    console.log('🔗 [SLIDES_WEBHOOK] Triggering Slides Generation Lindy agent via webhook');
    console.log('📍 Webhook URL:', webhookUrl);

    // Prepare the callback URL
    const callbackUrl = process.env.LINDY_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'https://team.autoprep.ai'}/api/lindy/webhook`;

    // Prepare the payload for the agent in the expected format
    const agentPayload: {
      report_url?: string;
      template_url?: string;
      callback_url: string;
      calendar_event_id?: number;
      event_title?: string;
      attendee_email?: string;
    } = {
      callback_url: callbackUrl
    };

    // Add report URL if available (pre-sales report)
    if (event.presales_report_url) {
      agentPayload.report_url = event.presales_report_url;
      console.log('📄 Including pre-sales report URL:', event.presales_report_url);
    } else {
      console.warn('⚠️ No pre-sales report URL found for event. Agent may not have report to reference.');
    }

    // Add template URL if available (slides template from profile)
    if (profile.slides_file) {
      agentPayload.template_url = profile.slides_file;
      console.log('📎 Including slides template URL:', profile.slides_file);
    } else {
      console.warn('⚠️ No slides template URL found in profile. Agent will use default template.');
    }

    // Add metadata for tracking
    agentPayload.calendar_event_id = event_id;
    agentPayload.event_title = event_title;
    agentPayload.attendee_email = attendee_email;

    console.log('📤 [SLIDES_WEBHOOK] Sending to agent:', JSON.stringify(agentPayload, null, 2));

    // Call the webhook to invoke the agent
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${webhookSecret}`,
      },
      body: JSON.stringify(agentPayload)
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('❌ [SLIDES_WEBHOOK] Webhook failed:', {
        status: webhookResponse.status,
        error: errorText
      });
      return NextResponse.json({ 
        success: false, 
        error: `Webhook failed: ${webhookResponse.status}` 
      }, { status: 500 });
    }

    const webhookData = await webhookResponse.json();
    console.log('✅ [SLIDES_WEBHOOK] Slides generation triggered successfully');
    console.log('📊 Webhook response:', webhookData);
    
    return NextResponse.json({
      success: true,
      message: 'Slides generation started. You will be notified when they are ready.',
      event_id,
      webhook_response: webhookData
    });
  } catch (error) {
    console.error('[SLIDES_WEBHOOK] Error generating slides:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate slides',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
