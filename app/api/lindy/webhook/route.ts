import { NextRequest, NextResponse } from 'next/server';
import { updateEventPresalesStatus, updateEventSlidesStatus } from '@/lib/db';
import { generatePdfFromContent, bufferToDataUrl } from '@/lib/pdf-generator';
import { uploadFileToSupabase, isSupabaseConfigured } from '@/lib/supabase';
import crypto from 'crypto';

/**
 * Webhook endpoint to receive updates from Lindy agents
 * This endpoint will be called by the Lindy agents when:
 * - Pre-sales report is ready (with pdf_url/presales_report_url from Supabase storage or report_content for PDF generation)
 * - Slides are ready for download (with presentation_url from Supabase)
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
      hasPresalesReportUrl: !!body.presales_report_url,
      hasReportContent: !!body.report_content,
      hasPresentationUrl: !!body.presentation_url,
      hasSlidesUrl: !!body.slides_url,
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
      presales_report_url,
      report_content,
      slides_url,
      presentation_url,
      filename,
      created_at,
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
        // Accept both pdf_url and presales_report_url field names
        let finalPdfUrl = presales_report_url || pdf_url;
        const finalReportContent = report_content;

        // PRIORITIZE presales_report_url or pdf_url (Supabase storage URL) if provided by agent
        if (finalPdfUrl) {
          console.log('📄 Using PDF URL from agent (Supabase storage):', finalPdfUrl);
          console.log('📄 URL field name:', presales_report_url ? 'presales_report_url' : 'pdf_url');
        } 
        // If no URL but we have report_content, generate PDF and upload to Supabase
        else if (report_content && typeof report_content === 'string') {
          console.log('📄 No PDF URL provided, generating PDF from report content...');
          console.log('📝 Report content length:', report_content.length, 'characters');
          
          try {
            // Generate PDF from content
            const pdfBuffer = await generatePdfFromContent(
              report_content,
              `Pre-Sales Report - ${event_title || 'Calendar Event'}`
            );
            console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');

            // Upload to Supabase storage if configured
            if (isSupabaseConfigured()) {
              console.log('📤 Uploading PDF to Supabase storage...');
              const timestamp = Date.now();
              const sanitizedTitle = (event_title || 'report')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
              const filename = `presales-report-${calendar_event_id}-${sanitizedTitle}-${timestamp}.pdf`;
              
              try {
                finalPdfUrl = await uploadFileToSupabase(
                  'Reports',
                  filename,
                  pdfBuffer,
                  'application/pdf'
                );
                console.log('✅ PDF uploaded to Supabase storage:', finalPdfUrl);
              } catch (uploadError) {
                console.error('❌ Error uploading PDF to Supabase:', uploadError);
                // Fallback to data URL if upload fails
                finalPdfUrl = bufferToDataUrl(pdfBuffer, 'application/pdf');
                console.log('⚠️ Falling back to data URL due to upload error');
              }
            } else {
              // No Supabase configured, use data URL
              finalPdfUrl = bufferToDataUrl(pdfBuffer, 'application/pdf');
              console.log('⚠️ Supabase not configured, using data URL');
            }
          } catch (pdfError) {
            console.error('❌ Error generating PDF from webhook content:', pdfError);
            // Continue with what we have
          }
        }

        // Update database with report
        if (finalPdfUrl || finalReportContent) {
          await updateEventPresalesStatus(
            parseInt(calendar_event_id as string), 
            'completed', 
            finalPdfUrl || undefined,
            finalReportContent || undefined
          );
          console.log('✅ Pre-sales report marked as completed:', {
            hasPdfUrl: !!finalPdfUrl,
            pdfUrl: finalPdfUrl,
            hasContent: !!finalReportContent,
            urlType: finalPdfUrl?.startsWith('https://') ? 'supabase_storage_url' : 'data_url',
            source: (presales_report_url || pdf_url) ? 'agent_provided' : 'generated_and_uploaded'
          });
        } else {
          console.warn('⚠️ Pre-sales webhook completed but no PDF URL or report content provided');
          await updateEventPresalesStatus(parseInt(calendar_event_id as string), 'completed');
        }
      } else if (status === 'failed') {
        await updateEventPresalesStatus(parseInt(calendar_event_id as string), 'failed');
        console.log('❌ Pre-sales report marked as failed:', error_message);
      } else {
        console.warn('⚠️ Pre-sales webhook received with unexpected status:', status);
      }
    }
    
    // Handle slides generation agent webhook
    else if (agent_id === '68ed392b02927e7ace232732') {
      console.log('📊 Processing slides generation webhook');
      
      if (status === 'completed') {
        // The agent sends presentation_url from Supabase storage
        const finalSlidesUrl = presentation_url || slides_url;
        
        if (finalSlidesUrl) {
          await updateEventSlidesStatus(parseInt(calendar_event_id as string), 'completed', finalSlidesUrl);
          console.log('✅ Slides marked as completed with URL:', {
            url: finalSlidesUrl,
            filename: filename,
            created_at: created_at
          });
        } else {
          console.warn('⚠️ Slides webhook completed but no presentation_url or slides_url provided');
          await updateEventSlidesStatus(parseInt(calendar_event_id as string), 'completed');
        }
      } else if (status === 'failed') {
        await updateEventSlidesStatus(parseInt(calendar_event_id as string), 'failed');
        console.log('❌ Slides marked as failed:', error_message);
      } else {
        console.warn('⚠️ Slides webhook received with unexpected status:', status);
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
