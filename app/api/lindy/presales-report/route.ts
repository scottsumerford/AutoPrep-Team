import { NextRequest, NextResponse } from 'next/server';
import { updateEventPresalesStatus, getEventById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_id, event_title, event_description, attendee_email, profile_id } = body;

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

    // Trigger the Lindy agent via Lindy API
    const lindyApiKey = process.env.LINDY_API_KEY;
    const agentId = '68aa4cb7ebbc5f9222a2696e'; // Pre-sales Report Agent
    
    if (!lindyApiKey) {
      console.error('❌ LINDY_API_KEY not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Lindy API key not configured' 
      }, { status: 500 });
    }

    console.log('🔗 Triggering Lindy agent via API:', agentId);

    // Prepare the payload for the agent
    const agentPayload = {
      calendar_event_id: event_id,
      event_title: event_title,
      event_description: event_description,
      attendee_email: attendee_email,
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://team.autoprep.ai'}/api/lindy/webhook`
    };

    console.log('📤 Sending to agent:', agentPayload);

    // Call the Lindy API to invoke the agent
    const agentResponse = await fetch(
      `https://api.lindy.ai/v1/agents/${agentId}/invoke`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lindyApiKey}`,
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
