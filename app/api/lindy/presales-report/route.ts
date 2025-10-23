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

    // Get Lindy API key from environment
    const lindy_api_key = process.env.LINDY_API_KEY;
    const agent_id = process.env.LINDY_PRESALES_AGENT_ID || '68aa4cb7ebbc5f9222a2696e';
    
    if (!lindy_api_key) {
      console.error('❌ Lindy API key not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Lindy API key not configured' 
      }, { status: 500 });
    }

    console.log('🔗 Triggering Pre-sales Report Lindy agent via API');
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
    console.log('✅ Pre-sales report generation triggered successfully');
    console.log('📊 Agent response:', agentData);
    
    return NextResponse.json({
      success: true,
      message: 'Pre-sales report generation started. You will be notified when it is ready.',
      event_id,
      agent_response: agentData
    });
  } catch (error) {
    console.error('Error generating pre-sales report:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate pre-sales report' 
    }, { status: 500 });
  }
}
