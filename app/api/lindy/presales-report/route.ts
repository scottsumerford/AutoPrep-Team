import { NextRequest, NextResponse } from 'next/server';
import { updateEventPresalesStatus, getEventById, markStalePresalesRuns } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Mark any stale presales runs as failed (> 15 minutes)
    await markStalePresalesRuns();

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

    // Get agent ID
    const agentId = process.env.LINDY_PRESALES_AGENT_ID;
    if (!agentId) {
      console.error('❌ Lindy agent ID not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Lindy agent ID not configured' 
      }, { status: 500 });
    }

    console.log('🔗 Triggering Pre-sales Report Lindy agent via direct API');
    console.log('📍 Agent ID:', agentId);

    // Prepare the payload for the agent
    const agentPayload = {
      input: {
        calendar_event_id: event_id,
        event_title: event_title,
        event_description: event_description || '',
        attendee_email: attendee_email,
        webhook_url: process.env.LINDY_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'https://team.autoprep.ai'}/api/lindy/webhook`
      }
    };

    console.log('📤 Sending to Lindy API:', agentPayload);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Try with API key if available
    const lindyApiKey = process.env.LINDY_API_KEY;
    if (lindyApiKey) {
      headers['Authorization'] = `Bearer ${lindyApiKey}`;
      console.log('🔑 Using Lindy API key for authentication');
    } else {
      console.log('⚠️ No Lindy API key configured, attempting without authentication');
    }

    const apiResponse = await fetch(`https://api.lindy.ai/v1/agents/${agentId}/invoke`, {
      method: 'POST',
      headers,
      body: JSON.stringify(agentPayload)
    });

    console.log('📊 Lindy API response status:', apiResponse.status);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('❌ Lindy API failed:', {
        status: apiResponse.status,
        error: errorText
      });

      // Try webhook as fallback
      const webhookUrl = process.env.LINDY_PRESALES_WEBHOOK_URL;
      const webhookSecret = process.env.LINDY_PRESALES_WEBHOOK_SECRET;
      
      if (webhookUrl && webhookSecret) {
        console.log('📌 Attempting fallback to webhook...');
        
        const webhookPayload = {
          calendar_event_id: event_id,
          event_title: event_title,
          event_description: event_description || '',
          attendee_email: attendee_email,
          webhook_url: process.env.LINDY_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'https://team.autoprep.ai'}/api/lindy/webhook`
        };

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${webhookSecret}`,
          },
          body: JSON.stringify(webhookPayload)
        });

        if (webhookResponse.ok) {
          const webhookData = await webhookResponse.json();
          console.log('✅ Pre-sales report generation triggered successfully via webhook');
          return NextResponse.json({
            success: true,
            message: 'Pre-sales report generation started. You will be notified when it is ready.',
            event_id,
            webhook_response: webhookData
          });
        }
      }

      return NextResponse.json({ 
        success: false, 
        error: `Lindy API failed: ${apiResponse.status}` 
      }, { status: 500 });
    }

    const apiData = await apiResponse.json();
    console.log('✅ Pre-sales report generation triggered successfully via Lindy API');
    console.log('📊 API response:', apiData);
    
    return NextResponse.json({
      success: true,
      message: 'Pre-sales report generation started. You will be notified when it is ready.',
      event_id,
      api_response: apiData
    });

  } catch (error) {
    console.error('Error generating pre-sales report:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate pre-sales report' 
    }, { status: 500 });
  }
}
