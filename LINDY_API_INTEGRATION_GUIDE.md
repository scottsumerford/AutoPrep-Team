# Lindy API Integration Guide

## Overview
This guide explains how the AutoPrep application triggers Lindy agents to generate PDF pre-sales reports and presentation slides.

## Architecture

### Data Flow
```
1. User clicks "PDF Pre-sales Report" or "Create Slides" button
   ↓
2. Frontend sends POST to /api/lindy/presales-report or /api/lindy/slides
   ↓
3. Backend updates database status to "processing"
   ↓
4. Backend calls Lindy API: https://api.lindy.ai/v1/agents/{agentId}/invoke
   ↓
5. Lindy agent receives event data and processes request
   ↓
6. Agent calls /api/lindy/webhook with results (PDF URL or error)
   ↓
7. Backend updates database with PDF URL and status "completed"
   ↓
8. Frontend auto-refresh detects status change
   ↓
9. Button turns green "Download PDF Report" or "Download Slides"
```

## Environment Configuration

### Required Environment Variables

Add these to your Vercel environment variables:

```bash
# Lindy API Key (required)
LINDY_API_KEY=your_lindy_api_key_here

# Agent IDs (hardcoded in endpoints, but documented here)
LINDY_PRESALES_AGENT_ID=68aa4cb7ebbc5f9222a2696e
LINDY_SLIDES_AGENT_ID=68ed392b02927e7ace232732

# Application URL (for webhook callback)
NEXT_PUBLIC_APP_URL=https://team.autoprep.ai
```

### How to Get Your Lindy API Key

1. Go to [Lindy Dashboard](https://app.lindy.ai)
2. Navigate to Settings → API Keys
3. Create a new API key
4. Copy the key and add it to your environment variables

## API Endpoints

### POST /api/lindy/presales-report

Triggers the pre-sales report generation agent.

**Request Body:**
```json
{
  "event_id": 123,
  "event_title": "ATT intro call test",
  "event_description": "Meeting description from calendar",
  "attendee_email": "jim-jimmytonsmit@att.com",
  "profile_id": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pre-sales report generation started. You will be notified when it is ready.",
  "event_id": 123
}
```

**What Happens:**
1. Database status updated to "processing"
2. Lindy agent triggered via API
3. Agent receives event data and webhook callback URL
4. Agent generates PDF and calls webhook with results

### POST /api/lindy/slides

Triggers the slides generation agent.

**Request Body:**
```json
{
  "event_id": 123,
  "event_title": "ATT intro call test",
  "event_description": "Meeting description from calendar",
  "attendee_email": "jim-jimmytonsmit@att.com",
  "profile_id": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Slides generation started. You will be notified when it is ready.",
  "event_id": 123
}
```

### POST /api/lindy/webhook

Webhook endpoint that receives completion notifications from Lindy agents.

**Request Body (Success):**
```json
{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": 123,
  "status": "completed",
  "pdf_url": "https://storage.example.com/reports/presales-report.pdf"
}
```

**Request Body (Failure):**
```json
{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": 123,
  "status": "failed",
  "error_message": "Failed to retrieve company information for attendee"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

## Lindy Agent Configuration

### Pre-sales Report Agent (68aa4cb7ebbc5f9222a2696e)

**Input Variables:**
- `calendar_event_id` (number) - ID of the calendar event
- `event_title` (string) - Title of the meeting
- `event_description` (string) - Description/notes from calendar
- `attendee_email` (string) - Email of the attendee to research
- `webhook_url` (string) - URL to call when processing is complete

**Agent Responsibilities:**
1. Research the attendee's company using their email domain
2. Generate a professional PDF pre-sales report
3. Include company information, industry insights, and talking points
4. Call the webhook with the PDF URL when complete

**Webhook Callback:**
```json
{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": 123,
  "status": "completed",
  "pdf_url": "https://storage.example.com/reports/presales-report.pdf"
}
```

### Slides Generation Agent (68ed392b02927e7ace232732)

**Input Variables:**
- `calendar_event_id` (number) - ID of the calendar event
- `event_title` (string) - Title of the meeting
- `event_description` (string) - Description/notes from calendar
- `attendee_email` (string) - Email of the attendee
- `webhook_url` (string) - URL to call when processing is complete

**Agent Responsibilities:**
1. Create a professional presentation deck
2. Include company overview, value proposition, and key talking points
3. Format as slides (PowerPoint, Google Slides, or PDF)
4. Call the webhook with the slides URL when complete

**Webhook Callback:**
```json
{
  "agent_id": "68ed392b02927e7ace232732",
  "calendar_event_id": 123,
  "status": "completed",
  "slides_url": "https://storage.example.com/slides/presentation.pptx"
}
```

## Database Schema

The `calendar_events` table includes these columns for tracking generation status:

```sql
-- Pre-sales Report Tracking
presales_report_status VARCHAR(50) DEFAULT 'pending'  -- pending, processing, completed, failed
presales_report_url TEXT                               -- URL to download the PDF
presales_report_generated_at TIMESTAMP                 -- When the PDF was completed

-- Slides Tracking
slides_status VARCHAR(50) DEFAULT 'pending'            -- pending, processing, completed, failed
slides_url TEXT                                        -- URL to download the slides
slides_generated_at TIMESTAMP                          -- When the slides were completed
```

## Frontend Button States

### Pre-sales Report Button

1. **Pending** (default):
   - Text: "PDF Pre-sales Report"
   - Style: Blue button
   - Action: Click to trigger generation

2. **Processing**:
   - Text: "Generating Report..."
   - Style: Blue button with spinner
   - State: Disabled

3. **Completed**:
   - Text: "Download PDF Report"
   - Style: Green button
   - Action: Click to download PDF

4. **Failed**:
   - Text: "Retry Report"
   - Style: Red button
   - Action: Click to retry generation

### Slides Button

Same states as pre-sales report button, but with "Slides" instead of "Report".

## Auto-Refresh Mechanism

The frontend polls for status updates every 10 seconds:

```typescript
// Polls /api/profiles/[id] endpoint
// Checks presales_report_status and slides_status
// Updates button states when status changes
```

## Error Handling

### Missing LINDY_API_KEY

If `LINDY_API_KEY` is not configured:
- Endpoint returns 500 error
- Database status remains "processing"
- Frontend shows "Generating Report..." indefinitely
- Check Vercel environment variables

### Lindy API Failure

If the Lindy API call fails:
- Endpoint returns 500 error with Lindy API status
- Database status remains "processing"
- Frontend shows "Generating Report..." indefinitely
- Check Lindy API key and agent IDs

### Agent Processing Failure

If the agent fails to process:
- Agent calls webhook with `status: "failed"`
- Database status updated to "failed"
- Frontend shows "Retry Report" button
- User can click to retry

## Troubleshooting

### "Generating Report..." Button Stuck

**Possible Causes:**
1. `LINDY_API_KEY` not configured in Vercel
2. Lindy API key is invalid or expired
3. Agent ID is incorrect
4. Lindy agent is not configured properly
5. Network issue between backend and Lindy API

**Solution:**
1. Check Vercel environment variables
2. Verify Lindy API key in Lindy dashboard
3. Check agent IDs in code
4. Check Lindy agent configuration
5. Check server logs for error messages

### "Retry Report" Button Appears

**Possible Causes:**
1. Agent failed to generate PDF
2. Company information lookup failed
3. PDF generation error

**Solution:**
1. Check Lindy agent logs
2. Verify attendee email is valid
3. Check agent error message in webhook callback

### PDF URL Not Accessible

**Possible Causes:**
1. Storage service is down
2. PDF URL is incorrect
3. PDF file was deleted

**Solution:**
1. Check storage service status
2. Verify PDF URL in database
3. Regenerate the report

## Testing

### Manual Testing

1. Navigate to a profile with calendar events
2. Click "PDF Pre-sales Report" button
3. Verify button shows "Generating Report..." with spinner
4. Wait for agent to process (typically 30-60 seconds)
5. Verify button changes to "Download PDF Report"
6. Click to download and verify PDF content

### Testing with Curl

```bash
# Trigger pre-sales report generation
curl -X POST https://team.autoprep.ai/api/lindy/presales-report \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 123,
    "event_title": "Test Meeting",
    "event_description": "Test description",
    "attendee_email": "test@example.com",
    "profile_id": 3
  }'

# Simulate webhook callback
curl -X POST https://team.autoprep.ai/api/lindy/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "68aa4cb7ebbc5f9222a2696e",
    "calendar_event_id": 123,
    "status": "completed",
    "pdf_url": "https://example.com/report.pdf"
  }'
```

## Deployment Checklist

- [ ] Add `LINDY_API_KEY` to Vercel environment variables
- [ ] Verify `NEXT_PUBLIC_APP_URL` is set to production URL
- [ ] Test pre-sales report generation with a test event
- [ ] Test slides generation with a test event
- [ ] Verify webhook callbacks are received
- [ ] Check database status updates
- [ ] Verify button states change correctly
- [ ] Test PDF/slides download functionality

## Support

For issues with:
- **Lindy API**: Check [Lindy Documentation](https://docs.lindy.ai)
- **AutoPrep Backend**: Check server logs in Vercel
- **Database**: Check Vercel Postgres logs
- **Frontend**: Check browser console for errors
