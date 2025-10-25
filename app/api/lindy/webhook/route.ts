import { NextRequest, NextResponse } from 'next/server';
import { updateEventPresalesStatus, updateEventSlidesStatus } from '@/lib/db';
import crypto from 'crypto';

/**
 * Webhook endpoint to receive updates from Lindy agents
 * This endpoint will be called by the Lindy agents when:
 * - Pre-sales report PDF is ready for download
 * - Slides are ready for download
 * 
 * Uses HMAC-SHA256 signature verification for security
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    
    console.log('📨 Received webhook from Lindy agent:', body);

    // Verify HMAC-SHA256 signature
    const signature = request.headers.get('x-lindy-signature');
    if (signature) {
      const secret = process.env.LINDY_WEBHOOK_SECRET;
      if (!secret) {
        console.error('❌ LINDY_WEBHOOK_SECRET not configured');
        return NextResponse.json({ 
          success: false, 
          error: 'Webhook secret not configured' 
        }, { status: 500 });
      }

      const hash = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      if (hash !== signature) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid signature' 
        }, { status: 401 });
      }
      console.log('✅ Webhook signature verified');
    } else {
      console.warn('⚠️ No signature provided in webhook');
    }

    const { 
      agent_id, 
      calendar_event_id, 
      status, 
      pdf_url, 
      slides_url,
      error_message 
    } = body;

    if (!calendar_event_id) {
      console.error('❌ Missing calendar_event_id in webhook payload');
      return NextResponse.json({ 
        success: false, 
        error: 'Missing calendar_event_id' 
      }, { status: 400 });
    }

    // Handle pre-sales report agent webhook
    if (agent_id === '68aa4cb7ebbc5f9222a2696e') {
      console.log('📄 Processing pre-sales report webhook');
      
      if (status === 'completed' && pdf_url) {
        await updateEventPresalesStatus(calendar_event_id, 'completed', pdf_url);
        console.log('✅ Pre-sales report marked as completed with URL:', pdf_url);
      } else if (status === 'failed') {
        await updateEventPresalesStatus(calendar_event_id, 'failed');
        console.log('❌ Pre-sales report marked as failed:', error_message);
      } else {
        console.warn('⚠️ Pre-sales webhook received but status or pdf_url missing:', { status, pdf_url });
      }
    }
    
    // Handle slides generation agent webhook
    else if (agent_id === '68ed392b02927e7ace232732') {
      console.log('📊 Processing slides generation webhook');
      
      if (status === 'completed' && slides_url) {
        await updateEventSlidesStatus(calendar_event_id, 'completed', slides_url);
        console.log('✅ Slides marked as completed with URL:', slides_url);
      } else if (status === 'failed') {
        await updateEventSlidesStatus(calendar_event_id, 'failed');
        console.log('❌ Slides marked as failed:', error_message);
      } else {
        console.warn('⚠️ Slides webhook received but status or slides_url missing:', { status, slides_url });
      }
    }
    
    else {
      console.warn('⚠️ Unknown agent_id:', agent_id);
      return NextResponse.json({ 
        success: false, 
        error: 'Unknown agent_id' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process webhook',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
