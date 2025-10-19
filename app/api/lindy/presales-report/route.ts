import { NextRequest, NextResponse } from 'next/server';
import { generatePresalesReport } from '@/lib/lindy';
import { logTokenUsage, getProfileById, updateEventPresalesStatus } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, event_id, event_title, event_description, attendee_email } = body;

    console.log('📄 Starting pre-sales report generation:', {
      profile_id,
      event_id,
      event_title
    });

    // Update status to processing
    await updateEventPresalesStatus(event_id, 'processing');

    // Get profile to access company info
    const profile = await getProfileById(profile_id);
    
    // Call Lindy agent for pre-sales report with calendar event ID
    const result = await generatePresalesReport({
      calendarEventId: event_id,
      eventTitle: event_title,
      eventDescription: event_description,
      attendeeEmail: attendee_email,
      companyInfo: profile?.company_info_url,
      apiKey: process.env.LINDY_API_KEY
    });

    if (result.success) {
      console.log('✅ Pre-sales report generation initiated successfully');
      
      // Track token usage
      if (result.tokens_used) {
        await logTokenUsage({
          profile_id,
          operation_type: 'presales_report',
          tokens_used: result.tokens_used,
          lindy_agent_id: '68aa4cb7ebbc5f9222a2696e',
          event_id
        });
      }

      // Note: The status will be updated to 'completed' by the webhook when the PDF is ready
      // For now, we keep it as 'processing'
      
      return NextResponse.json({
        success: true,
        message: 'Pre-sales report generation started. You will be notified when it is ready.',
        event_id
      });
    } else {
      console.error('❌ Pre-sales report generation failed:', result.error);
      
      // Update status to failed
      await updateEventPresalesStatus(event_id, 'failed');
      
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to generate pre-sales report' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating pre-sales report:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate pre-sales report' 
    }, { status: 500 });
  }
}
