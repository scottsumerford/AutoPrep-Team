import { NextRequest, NextResponse } from 'next/server';
import { getCalendarEvents } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const keywordFilter = searchParams.get('filter') || undefined;
    
    const events = await getCalendarEvents(parseInt(id), keywordFilter);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}
