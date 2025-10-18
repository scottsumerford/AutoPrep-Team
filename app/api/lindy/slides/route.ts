import { NextRequest, NextResponse } from 'next/server';
import { generateSlides } from '@/lib/lindy';
import { logTokenUsage, getProfileById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, event_id, event_title, event_description, attendee_email } = body;

    // Get profile to access slide template and company info
    const profile = await getProfileById(profile_id);
    
    // Call Lindy agent for slides generation
    const result = await generateSlides({
      eventTitle: event_title,
      eventDescription: event_description,
      attendeeEmail: attendee_email,
      slideTemplate: profile?.slide_template_url,
      companyInfo: profile?.company_info_url,
      apiKey: process.env.LINDY_API_KEY
    });

    // Track token usage
    if (result.success && result.tokens_used) {
      await logTokenUsage({
        profile_id,
        operation_type: 'slides_generation',
        tokens_used: result.tokens_used,
        lindy_agent_id: '68ed392b02927e7ace232732',
        event_id
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating slides:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate slides' 
    }, { status: 500 });
  }
}
