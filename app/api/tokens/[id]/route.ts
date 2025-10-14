import { NextRequest, NextResponse } from 'next/server';
import { getTotalTokensByType } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stats = await getTotalTokensByType(parseInt(id));
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching token stats:', error);
    return NextResponse.json({ error: 'Failed to fetch token stats' }, { status: 500 });
  }
}
