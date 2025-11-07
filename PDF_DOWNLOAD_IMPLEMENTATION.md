# PDF Download Feature Implementation

## Overview
The Pre-Sales Report webhook now receives `report_content` as text and automatically generates a downloadable PDF for users.

## Implementation Details

### 1. Webhook Receives Report Content
The webhook endpoint (`/api/lindy/webhook`) now accepts:
```json
{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": "123",
  "status": "completed",
  "report_content": "Full text content of the pre-sales report...",
  "event_title": "Meeting with Client"
}
```

### 2. Server-Side PDF Generation
When `report_content` is received:
- The webhook handler uses `pdfkit` to generate a PDF from the text content
- The PDF is formatted with:
  - Title (from event title)
  - Timestamp
  - Formatted paragraphs with heading detection
  - Professional styling
- The PDF is converted to a base64 data URL
- Stored in `calendar_events.presales_report_url` column
- Text content also stored in `calendar_events.presales_report_content` column

**File:** `app/api/lindy/webhook/route.ts`
**Function:** `generatePdfFromContent()` in `lib/pdf-generator.ts`

### 3. Download API Endpoint
A new API endpoint handles PDF downloads:

**Endpoint:** `GET /api/reports/download?eventId={eventId}`

**Features:**
- Retrieves the event from database
- Converts base64 data URL back to binary PDF
- Generates a descriptive filename: `PreSales_Report_{EventTitle}_{Date}.pdf`
- Returns PDF with proper headers for download
- Supports both data URLs and external URLs

**File:** `app/api/reports/download/route.ts`

### 4. Client-Side Download Button
The profile page now uses a Button component that triggers the download API:

```tsx
<Button 
  size="sm"
  onClick={() => {
    window.location.href = `/api/reports/download?eventId=${event.id}`;
  }}
  className="flex items-center gap-2 px-3 py-2 bg-green-500 border border-green-600 rounded text-sm text-white hover:bg-green-600 transition-colors shadow-sm"
>
  <Download className="w-4 h-4" />
  Download Report
</Button>
```

**Benefits:**
- Proper filename generation
- Better handling of large PDFs
- Consistent download experience across browsers
- Cleaner separation of concerns

## Database Schema

### calendar_events table
```sql
presales_report_url TEXT,           -- Base64 data URL or external URL
presales_report_content TEXT,       -- Original text content from webhook
presales_report_status VARCHAR(50), -- 'pending', 'processing', 'completed', 'failed'
presales_report_generated_at TIMESTAMP
```

## Webhook Flow

1. **User clicks "Generate Pre-Sales Report"**
   - Frontend calls `/api/lindy/presales-report`
   - Backend triggers Lindy agent webhook
   - Database status set to 'processing'

2. **Lindy Agent processes request**
   - Generates pre-sales report content
   - Sends webhook callback with `report_content`

3. **Webhook receives callback**
   - Validates signature
   - Generates PDF from `report_content`
   - Stores PDF as base64 data URL
   - Updates database status to 'completed'

4. **User downloads report**
   - Clicks "Download Report" button
   - Browser navigates to `/api/reports/download?eventId={id}`
   - API converts data URL to binary PDF
   - Browser downloads file with proper filename

## Testing

### Local Testing
```bash
# Start dev server
bun run dev

# Navigate to profile page
# Click "Generate Pre-Sales Report"
# Wait for completion
# Click "Download Report"
# Verify PDF downloads with correct filename
```

### Testing Environment
**URL:** https://autoprep-team-subdomain-deployment-testing.vercel.app/

**Environment Variables Required:**
```bash
LINDY_PRESALES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa
LINDY_PRESALES_WEBHOOK_SECRET=2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07
LINDY_CALLBACK_URL=https://autoprep-team-subdomain-deployment-testing.vercel.app/api/lindy/webhook
NEXT_PUBLIC_APP_URL=https://autoprep-team-subdomain-deployment-testing.vercel.app
```

### Production Environment
**URL:** https://team.autoprep.ai/

**Environment Variables Required:**
```bash
LINDY_PRESALES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa
LINDY_PRESALES_WEBHOOK_SECRET=2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07
LINDY_CALLBACK_URL=https://team.autoprep.ai/api/lindy/webhook
NEXT_PUBLIC_APP_URL=https://team.autoprep.ai
```

## Files Modified

1. **app/api/reports/download/route.ts** (NEW)
   - Download API endpoint for PDFs

2. **app/profile/[slug]/page.tsx**
   - Updated download button to use API endpoint

3. **app/api/lindy/webhook/route.ts** (Already implemented)
   - Receives `report_content` from webhook
   - Generates PDF using `pdfkit`
   - Stores as base64 data URL

4. **lib/pdf-generator.ts** (Already implemented)
   - `generatePdfFromContent()` - Creates PDF from text
   - `bufferToDataUrl()` - Converts PDF to base64
   - `dataUrlToBuffer()` - Converts base64 back to binary

## Deployment Steps

### 1. Deploy to Testing Environment
```bash
# Commit changes
git add -A
git commit -m "feat: add PDF download API endpoint for pre-sales reports"

# Push to GitHub
git push origin main

# Vercel will auto-deploy to testing environment
# Wait 1-2 minutes
# Test at: https://autoprep-team-subdomain-deployment-testing.vercel.app/
```

### 2. Verify Testing Environment
- Navigate to a profile page
- Generate a pre-sales report
- Wait for completion
- Click "Download Report"
- Verify PDF downloads with correct filename
- Check PDF content is properly formatted

### 3. Deploy to Production
Once testing is successful:
```bash
# Create a release tag
git tag v1.4.0
git push origin v1.4.0

# Or manually deploy via Vercel dashboard
# https://vercel.com/scott-s-projects-53d26130/autoprep-team-subdomain-deployment
```

## Troubleshooting

### PDF Not Generating
**Problem:** Webhook receives `report_content` but PDF not created

**Solutions:**
1. Check server logs for PDF generation errors
2. Verify `pdfkit` is installed: `bun list | grep pdfkit`
3. Check `report_content` is valid text (not empty)
4. Verify `generatePdfFromContent()` function is working

### Download Button Not Working
**Problem:** Click "Download Report" but nothing happens

**Solutions:**
1. Check browser console for errors
2. Verify `/api/reports/download` endpoint is accessible
3. Check `event.presales_report_url` is not null
4. Verify data URL format is correct

### Filename Issues
**Problem:** Downloaded file has generic name like "download.pdf"

**Solutions:**
1. Check `Content-Disposition` header is set correctly
2. Verify filename sanitization is working
3. Check browser download settings

### Large PDF Issues
**Problem:** Large PDFs fail to download or timeout

**Solutions:**
1. Consider storing PDFs in cloud storage (S3, Azure Blob)
2. Implement streaming for large files
3. Add compression to PDF generation
4. Set appropriate timeout limits

## Future Enhancements

- [ ] Store PDFs in cloud storage instead of database
- [ ] Add PDF preview before download
- [ ] Support multiple report formats (PDF, DOCX, HTML)
- [ ] Add email delivery option
- [ ] Implement PDF caching for faster downloads
- [ ] Add watermarking to PDFs
- [ ] Support custom PDF templates
- [ ] Add PDF compression for smaller file sizes

## Support

For issues or questions:
- **Email:** scottsumerford@gmail.com
- **GitHub:** https://github.com/scottsumerford/AutoPrep-Team
- **Testing URL:** https://autoprep-team-subdomain-deployment-testing.vercel.app/
- **Production URL:** https://team.autoprep.ai

---

**Last Updated:** November 6, 2025
**Version:** 1.4.0
**Status:** ✅ Ready for Testing
