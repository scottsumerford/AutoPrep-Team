import { NextRequest, NextResponse } from 'next/server';
import { getTotalTokensByType } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stats = await getTotalTokensByType(parseInt(params.id));
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching token stats:', error);
    return NextResponse.json({ error: 'Failed to fetch token stats' }, { status: 500 });
  }
}
