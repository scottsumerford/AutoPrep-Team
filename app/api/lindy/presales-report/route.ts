import { NextRequest, NextResponse } from 'next/server';
import { generatePresalesReport } from '@/lib/lindy';
import { trackTokenUsage, getProfileById } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, event_id, event_title, event_description, attendee_email } = body;

    // Get profile to access company info
    const profile = await getProfileById(profile_id);
    
    // Call Lindy agent for pre-sales report
    const result = await generatePresalesReport({
      eventTitle: event_title,
      eventDescription: event_description,
      attendeeEmail: attendee_email,
      companyInfo: profile?.company_info_url,
      apiKey: process.env.LINDY_API_KEY
    });

    // Track token usage
    if (result.success && result.tokens_used) {
      await trackTokenUsage({
        profile_id,
        operation_type: 'presales_report',
        tokens_used: result.tokens_used,
        lindy_agent_id: '68aa4cb7ebbc5f9222a2696e',
        event_id
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating pre-sales report:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate pre-sales report' 
    }, { status: 500 });
  }
}
