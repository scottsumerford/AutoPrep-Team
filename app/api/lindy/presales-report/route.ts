import { NextRequest, NextResponse } from 'next/server';
import { updateEventPresalesStatus, getEventById, markStalePresalesRuns, getProfileById } from '@/lib/db';

/**
 * POST /api/lindy/presales-report
 * 
 * Triggers the Lindy Pre-Sales Report agent to generate a report for a calendar event.
 * Uses webhook-based integration with proper authentication.
 */
export async function POST(request: NextRequest) {
  try {
    // Mark any stale presales runs as failed (> 15 minutes)
    await markStalePresalesRuns();

    const body = await request.json();
    const { event_id, event_title, event_description, attendee_email } = body;

    console.log('📄 [PRESALES_REPORT_WEBHOOK] Starting pre-sales report generation:', {
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

    // Get profile to include airtable_record_id
    const profile = await getProfileById(event.profile_id);
    if (!profile) {
      console.error('❌ Profile not found for event:', event_id);
      return NextResponse.json({ 
        success: false, 
        error: 'Profile not found' 
      }, { status: 404 });
    }

    // Get webhook URL and secret
    const webhookUrl = process.env.LINDY_PRESALES_WEBHOOK_URL;
    const webhookSecret = process.env.LINDY_PRESALES_WEBHOOK_SECRET;
    
    if (!webhookUrl) {
      console.error('❌ Lindy presales webhook URL not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Lindy presales webhook URL not configured' 
      }, { status: 500 });
    }

    if (!webhookSecret) {
      console.error('❌ Lindy presales webhook secret not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Lindy presales webhook secret not configured' 
      }, { status: 500 });
    }

    console.log('🔗 [PRESALES_REPORT_WEBHOOK] Triggering Pre-sales Report Lindy agent via webhook');

    // Prepare the payload for the webhook
    const webhookPayload = {
      calendar_event_id: event_id,
      event_title: event_title,
      event_description: event_description || '',
      attendee_email: attendee_email,
      airtable_record_id: profile.airtable_record_id || '',
      user_profile_id: profile.id,
      webhook_callback_url: process.env.LINDY_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'https://team.autoprep.ai'}/api/lindy/webhook`
    };

    console.log('📤 [PRESALES_REPORT_WEBHOOK] Payload:', JSON.stringify(webhookPayload, null, 2));

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${webhookSecret}`,
    };

    console.log('🔑 [PRESALES_REPORT_WEBHOOK] Using Authorization Bearer token for authentication');
    console.log('🌐 [PRESALES_REPORT_WEBHOOK] Calling Lindy webhook:', webhookUrl);

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(webhookPayload)
    });

    console.log('📊 [PRESALES_REPORT_WEBHOOK] Webhook response status:', webhookResponse.status);
    const responseText = await webhookResponse.text();
    console.log('📊 [PRESALES_REPORT_WEBHOOK] Webhook response body:', responseText);

    if (!webhookResponse.ok) {
      console.error('❌ [PRESALES_REPORT_WEBHOOK] Webhook failed with status:', webhookResponse.status);
      
      return NextResponse.json({ 
        success: false, 
        error: `Webhook failed: ${webhookResponse.status}`,
        details: responseText
      }, { status: 500 });
    }

    console.log('✅ [PRESALES_REPORT_WEBHOOK] Pre-sales report generation triggered successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Pre-sales report generation started. You will be notified when it is ready.',
      event_id,
      status: 'processing'
    });

  } catch (error) {
    console.error('[PRESALES_REPORT_WEBHOOK] Error generating pre-sales report:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate pre-sales report',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
