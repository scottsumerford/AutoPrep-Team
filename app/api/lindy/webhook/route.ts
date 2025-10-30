import { NextRequest, NextResponse } from 'next/server';
import { updateEventPresalesStatus, updateEventSlidesStatus } from '@/lib/db';
import { generatePdfFromContent, bufferToDataUrl } from '@/lib/pdf-generator';
import crypto from 'crypto';

/**
 * Webhook endpoint to receive updates from Lindy agents
 * This endpoint will be called by the Lindy agents when:
 * - Pre-sales report is ready (with optional report_content for PDF generation)
 * - Slides are ready for download
 * 
 * Uses HMAC-SHA256 signature verification for security
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    
    console.log('📨 Received webhook from Lindy agent:', {
      agent_id: body.agent_id,
      calendar_event_id: body.calendar_event_id,
      status: body.status,
      hasPdfUrl: !!body.pdf_url,
      hasReportContent: !!body.report_content,
      reportContentLength: body.report_content ? body.report_content.length : 0
    });

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
      report_content,
      slides_url,
      error_message,
      event_title
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
      
      if (status === 'completed') {
        let finalPdfUrl = pdf_url;
        let finalReportContent = report_content;

        // If we have report content but no PDF URL, generate a PDF
        if (report_content && typeof report_content === 'string' && !pdf_url) {
          console.log('📄 Generating PDF from report content received in webhook...');
          console.log('📝 Report content length:', report_content.length, 'characters');
          
          try {
            const pdfBuffer = await generatePdfFromContent(
              report_content,
              `Pre-Sales Report - ${event_title || 'Calendar Event'}`
            );
            finalPdfUrl = bufferToDataUrl(pdfBuffer, 'application/pdf');
            console.log('✅ PDF generated successfully from webhook content, size:', pdfBuffer.length, 'bytes');
          } catch (pdfError) {
            console.error('❌ Error generating PDF from webhook content:', pdfError);
            // Continue with what we have
          }
        }

        // Update database with report
        if (finalPdfUrl || finalReportContent) {
          await updateEventPresalesStatus(
            calendar_event_id, 
            'completed', 
            finalPdfUrl || undefined,
            finalReportContent || undefined
          );
          console.log('✅ Pre-sales report marked as completed:', {
            hasPdfUrl: !!finalPdfUrl,
            hasContent: !!finalReportContent,
            source: pdf_url ? 'webhook_pdf_url' : 'generated_from_content'
          });
        } else {
          console.warn('⚠️ Pre-sales webhook completed but no PDF URL or report content provided');
          await updateEventPresalesStatus(calendar_event_id, 'completed');
        }
      } else if (status === 'failed') {
        await updateEventPresalesStatus(calendar_event_id, 'failed');
        console.log('❌ Pre-sales report marked as failed:', error_message);
      } else {
        console.warn('⚠️ Pre-sales webhook received with unexpected status:', status);
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
