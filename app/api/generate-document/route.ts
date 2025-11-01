import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LindyAgent_v7wfm_SendToAgent } from '@/lib/lindy-agent';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { documentType, companyName, contactInfo } = await request.json();

    // Validate input
    if (!documentType || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields: documentType, companyName' },
        { status: 400 }
      );
    }

    // Create database record with 'pending' status
    const { data, error } = await supabase
      .from('generated_documents')
      .insert({
        document_type: documentType,
        company_name: companyName,
        contact_info: contactInfo || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      );
    }

    // Trigger appropriate agent based on document type
    const agentId =
      documentType === 'pre-sales-report'
        ? '690423efbe4ad7647a0f55d7' // Pre-Sales Report Agent ID
        : '6904249392c408620b21fa44'; // Presentation Slides Agent ID

    try {
      await LindyAgent_v7wfm_SendToAgent({
        agentId,
        message: `Generate ${documentType} for ${companyName}. Document ID: ${data.id}. Contact: ${contactInfo || 'N/A'}`,
      });
    } catch (agentError) {
      console.error('Agent trigger error:', agentError);
      // Continue even if agent trigger fails - document record is created
    }

    return NextResponse.json(
      {
        success: true,
        documentId: data.id,
        status: 'pending',
        message: `${documentType} generation started for ${companyName}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
