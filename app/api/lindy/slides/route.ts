import { NextRequest, NextResponse } from 'next/server';
import { generateSlides } from '@/lib/lindy';
import { logTokenUsage, getProfileById, updateEventSlidesStatus } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, event_id, event_title, event_description, attendee_email } = body;

    console.log('📊 Starting slides generation:', {
      profile_id,
      event_id,
      event_title
    });

    // Update status to processing
    await updateEventSlidesStatus(event_id, 'processing');

    // Get profile to access slide template and company info
    const profile = await getProfileById(profile_id);
    
    // Call Lindy agent for slides generation with calendar event ID
    const result = await generateSlides({
      calendarEventId: event_id,
      eventTitle: event_title,
      eventDescription: event_description,
      attendeeEmail: attendee_email,
      slideTemplate: profile?.slide_template_url,
      companyInfo: profile?.company_info_url,
      apiKey: process.env.LINDY_API_KEY
    });

    if (result.success) {
      console.log('✅ Slides generation initiated successfully');
      
      // Track token usage
      if (result.tokens_used) {
        await logTokenUsage({
          profile_id,
          operation_type: 'slides_generation',
          tokens_used: result.tokens_used,
          lindy_agent_id: '68ed392b02927e7ace232732',
          event_id
        });
      }

      // Note: The status will be updated to 'completed' by the webhook when the slides are ready
      // For now, we keep it as 'processing'
      
      return NextResponse.json({
        success: true,
        message: 'Slides generation started. You will be notified when they are ready.',
        event_id
      });
    } else {
      console.error('❌ Slides generation failed:', result.error);
      
      // Update status to failed
      await updateEventSlidesStatus(event_id, 'failed');
      
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to generate slides' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating slides:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate slides' 
    }, { status: 500 });
  }
}
