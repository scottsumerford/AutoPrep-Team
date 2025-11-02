# Lindy Agent Integration - Implementation Summary

## Overview
Successfully connected the calendar event buttons to Lindy agents for automated PDF pre-sales report generation and slides creation.

## Changes Made

### 1. Database Schema Updates
Added new columns to `calendar_events` table to track generation status:
- `presales_report_status` - Status: 'pending', 'processing', 'completed', 'failed'
- `presales_report_url` - Download URL for the generated PDF
- `presales_report_generated_at` - Timestamp when PDF was completed
- `slides_status` - Status: 'pending', 'processing', 'completed', 'failed'
- `slides_url` - Download URL for the generated slides
- `slides_generated_at` - Timestamp when slides were completed

**Migration File**: `add-pdf-tracking-columns.sql`

To apply the migration to production database:
```sql
-- Run this SQL on your Vercel Postgres database
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS presales_report_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS presales_report_url TEXT,
ADD COLUMN IF NOT EXISTS presales_report_generated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS slides_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS slides_url TEXT,
ADD COLUMN IF NOT EXISTS slides_generated_at TIMESTAMP;
```

### 2. Database Functions (lib/db/index.ts)
Added three new functions:
- `updateEventPresalesStatus(eventId, status, reportUrl?)` - Update pre-sales report status
- `updateEventSlidesStatus(eventId, status, slidesUrl?)` - Update slides status
- `getEventById(eventId)` - Retrieve event by ID

### 3. Lindy Library Updates (lib/lindy.ts)
- Updated to pass `calendar_event_id` to both agents
- Added `pdf_url` and `slides_url` to response interface
- Modified `generatePresalesReport()` to include calendar event ID
- Modified `generateSlides()` to include calendar event ID

### 4. API Endpoints

#### Updated Endpoints:
- **`/api/lindy/presales-report`** - Triggers pre-sales report generation
  - Sets status to 'processing'
  - Calls Lindy agent with calendar_event_id
  - Tracks token usage
  
- **`/api/lindy/slides`** - Triggers slides generation
  - Sets status to 'processing'
  - Calls Lindy agent with calendar_event_id
  - Tracks token usage

#### New Webhook Endpoint:
- **`/api/lindy/webhook`** - Receives completion notifications from Lindy agents
  - Accepts POST requests with: `agent_id`, `calendar_event_id`, `status`, `pdf_url`/`slides_url`
  - Updates event status to 'completed' with download URL
  - Handles failure cases

### 5. Frontend Updates (app/profile/[id]/page.tsx)

#### Button States:
1. **Pending** (default):
   - "PDF Pre-sales Report" button (blue)
   - "Create Slides" button (outline)

2. **Processing**:
   - Shows loading spinner
   - Button disabled with "Generating Report..." or "Creating Slides..."

3. **Completed**:
   - "Download PDF Report" button (green)
   - "Download Slides" button (green outline)
   - Clicking opens the file in a new tab

4. **Failed**:
   - "Retry Report" or "Retry Slides" button (red)
   - Allows user to retry the generation

#### Auto-Refresh:
- Polls for status updates every 10 seconds
- Automatically updates button states when PDFs/slides are ready

## Lindy Agent Configuration

### Agent IDs:
- **Pre-sales Report Agent**: `68aa4cb7ebbc5f9222a2696e`
- **Slides Generation Agent**: `68ed392b02927e7ace232732`

### Required Agent Configuration:

#### 1. Pre-sales Report Agent (68aa4cb7ebbc5f9222a2696e)

**Input Variables:**
```json
{
  "calendar_event_id": "number",
  "event_title": "string",
  "event_description": "string",
  "attendee_email": "string",
  "company_info": "string (URL)"
}
```

**Expected Behavior:**
1. Receive the calendar event details
2. Research the attendee/company
3. Generate a comprehensive pre-sales report PDF
4. Upload the PDF to a publicly accessible URL
5. Call the webhook with completion status

**Webhook Call (when PDF is ready):**
```javascript
POST https://team.autoprep.ai/api/lindy/webhook
Content-Type: application/json

{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": 123,
  "status": "completed",
  "pdf_url": "https://your-storage.com/reports/report-123.pdf"
}
```

**Webhook Call (on failure):**
```javascript
POST https://team.autoprep.ai/api/lindy/webhook
Content-Type: application/json

{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": 123,
  "status": "failed",
  "error_message": "Description of what went wrong"
}
```

#### 2. Slides Generation Agent (68ed392b02927e7ace232732)

**Input Variables:**
```json
{
  "calendar_event_id": "number",
  "event_title": "string",
  "event_description": "string",
  "attendee_email": "string",
  "slide_template": "string (URL)",
  "company_info": "string (URL)"
}
```

**Expected Behavior:**
1. Receive the calendar event details
2. Research the attendee/company
3. Generate customized presentation slides
4. Upload the slides to a publicly accessible URL
5. Call the webhook with completion status

**Webhook Call (when slides are ready):**
```javascript
POST https://team.autoprep.ai/api/lindy/webhook
Content-Type: application/json

{
  "agent_id": "68ed392b02927e7ace232732",
  "calendar_event_id": 123,
  "status": "completed",
  "slides_url": "https://your-storage.com/slides/slides-123.pptx"
}
```

## Environment Variables

Ensure these are set in Vercel:
```bash
LINDY_API_KEY=your_lindy_api_key
LINDY_PRESALES_AGENT_ID=68aa4cb7ebbc5f9222a2696e
LINDY_SLIDES_AGENT_ID=68ed392b02927e7ace232732
```

## Testing the Integration

### 1. Test Pre-sales Report Generation:
```bash
curl -X POST https://team.autoprep.ai/api/lindy/presales-report \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": 1,
    "event_id": 123,
    "event_title": "Sales Meeting with Acme Corp",
    "event_description": "Discuss Q4 partnership opportunities",
    "attendee_email": "john@acmecorp.com"
  }'
```

### 2. Test Webhook (simulate agent completion):
```bash
curl -X POST https://team.autoprep.ai/api/lindy/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "68aa4cb7ebbc5f9222a2696e",
    "calendar_event_id": 123,
    "status": "completed",
    "pdf_url": "https://example.com/test-report.pdf"
  }'
```

### 3. Test Slides Generation:
```bash
curl -X POST https://team.autoprep.ai/api/lindy/slides \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": 1,
    "event_id": 123,
    "event_title": "Sales Meeting with Acme Corp",
    "event_description": "Discuss Q4 partnership opportunities",
    "attendee_email": "john@acmecorp.com"
  }'
```

## User Flow

1. User connects their Google/Outlook calendar
2. Calendar events are synced and displayed
3. User clicks "PDF Pre-sales Report" button
   - Button changes to "Generating Report..." with spinner
   - Lindy agent receives the request with calendar_event_id
4. Lindy agent processes the request (researches, generates PDF)
5. When complete, agent calls webhook with PDF URL
6. Button turns green: "Download PDF Report"
7. User clicks to download the PDF

Same flow applies for "Create Slides" button.

## Next Steps

### For Lindy Agent Configuration:
1. Configure both agents to accept the input variables listed above
2. Set up the agents to call the webhook URL when processing is complete
3. Ensure the PDF/slides URLs are publicly accessible (no authentication required)
4. Test the webhook integration

### For Production Deployment:
1. Run the database migration on Vercel Postgres
2. Verify environment variables are set in Vercel
3. Test the complete flow with real calendar events
4. Monitor webhook logs for any issues

## Webhook URL
```
Production: https://team.autoprep.ai/api/lindy/webhook
```

## Support
For issues or questions, check the server logs in Vercel or contact the development team.
