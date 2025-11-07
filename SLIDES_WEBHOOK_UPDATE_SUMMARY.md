# Slides Generation Webhook Update - November 7, 2025

## Summary

Updated the Generate Slides button webhook integration to send the required file URLs to the Slides Generation Lindy agent and handle the Supabase storage response.

## Changes Made

### 1. Updated Slides Generation Route (`app/api/lindy/slides/route.ts`)

**Previous Behavior:**
- Sent generic event data to the agent
- Included `slides_template_url`, `company_info_text`, and `company_info_file_url`
- Used `webhook_url` as callback parameter

**New Behavior:**
- Sends **exactly** the format the agent expects:
  ```json
  {
    "report_url": "https://example.com/presales-report.pdf",
    "template_url": "https://example.com/slides-template.pptx",
    "callback_url": "https://team.autoprep.ai/api/lindy/webhook"
  }
  ```

**Key Changes:**
- `report_url`: Pulls from `event.presales_report_url` (the generated pre-sales report)
- `template_url`: Pulls from `profile.slides_file` (the uploaded slides template)
- `callback_url`: The webhook endpoint where the agent posts the completed presentation
- Added metadata fields for tracking: `calendar_event_id`, `event_title`, `attendee_email`
- Added warning logs when report_url or template_url are missing

### 2. Updated Webhook Callback Handler (`app/api/lindy/webhook/route.ts`)

**Previous Behavior:**
- Expected `slides_url` in the response

**New Behavior:**
- Now accepts **both** `presentation_url` (primary) and `slides_url` (fallback)
- Handles the Supabase storage response format:
  ```json
  {
    "presentation_url": "https://[PROJECT_REF].supabase.co/storage/v1/object/public/presentations/[FILENAME].pptx",
    "status": "completed",
    "filename": "[FILENAME].pptx",
    "created_at": "2025-11-07T22:14:00.000Z"
  }
  ```

**Key Changes:**
- Prioritizes `presentation_url` over `slides_url`
- Logs additional metadata: `filename`, `created_at`
- Maintains backward compatibility with old `slides_url` format

## Agent Workflow

### Outbound Request (App → Agent)

```json
POST https://public.lindy.ai/api/v1/webhooks/lindy/66bf87f2-034e-463b-a7da-83e9adbf03d4
Authorization: Bearer f395b62647c72da770de97f7715ee68824864b21b9a2435bdaab7004762359c5

{
  "report_url": "https://team.autoprep.ai/reports/presales-123.pdf",
  "template_url": "https://supabase.co/storage/v1/object/public/slides/template.pptx",
  "callback_url": "https://team.autoprep.ai/api/lindy/webhook",
  "calendar_event_id": 123,
  "event_title": "Meeting with Acme Corp",
  "attendee_email": "contact@acmecorp.com"
}
```

### Callback Response (Agent → App)

```json
POST https://team.autoprep.ai/api/lindy/webhook
x-lindy-signature: <hmac-sha256-signature>

{
  "agent_id": "68ed392b02927e7ace232732",
  "calendar_event_id": 123,
  "status": "completed",
  "presentation_url": "https://[PROJECT_REF].supabase.co/storage/v1/object/public/presentations/slides-123.pptx",
  "filename": "slides-123.pptx",
  "created_at": "2025-11-07T22:14:00.000Z"
}
```

## Data Flow

1. **User clicks "Generate Slides" button** on profile page
2. **Frontend calls** `/api/lindy/slides` with event details
3. **Backend retrieves:**
   - Event data (including `presales_report_url`)
   - Profile data (including `slides_file` template URL)
4. **Backend sends webhook** to Lindy agent with:
   - `report_url`: Pre-sales report to reference
   - `template_url`: Slides template to use
   - `callback_url`: Where to post the result
5. **Agent processes:**
   - Downloads the pre-sales report
   - Downloads the slides template
   - Generates PowerPoint presentation
   - Uploads to Supabase storage
6. **Agent posts callback** with `presentation_url`
7. **Backend updates database** with the Supabase URL
8. **User sees "Download Slides" button** with the Supabase link

## Database Fields Used

### Profile Table
- `slides_file` (text): URL to uploaded slides template file

### Calendar Events Table
- `presales_report_url` (text): URL to generated pre-sales report
- `slides_url` (text): URL to generated slides presentation
- `slides_status` (enum): 'pending' | 'processing' | 'completed' | 'failed'

## Environment Variables

No new environment variables required. Uses existing:
- `LINDY_SLIDES_WEBHOOK_URL`: Agent webhook endpoint
- `LINDY_SLIDES_WEBHOOK_SECRET`: Authentication token
- `LINDY_CALLBACK_URL`: Callback endpoint URL
- `LINDY_WEBHOOK_SECRET`: Signature verification secret

## Testing Checklist

- [ ] Pre-sales report is generated first (provides `report_url`)
- [ ] Slides template is uploaded to profile (provides `template_url`)
- [ ] Click "Generate Slides" button
- [ ] Verify webhook payload includes both URLs
- [ ] Agent receives webhook and processes files
- [ ] Agent uploads to Supabase storage
- [ ] Agent posts callback with `presentation_url`
- [ ] Database updates with Supabase URL
- [ ] "Download Slides" button appears with correct link
- [ ] Clicking download opens/downloads the PPTX file

## Error Handling

### Missing Pre-sales Report
- **Warning logged**: "No pre-sales report URL found for event"
- **Behavior**: Webhook still sent, agent may use default content

### Missing Slides Template
- **Warning logged**: "No slides template URL found in profile"
- **Behavior**: Webhook still sent, agent uses default template

### Agent Failure
- **Status**: `failed` posted to callback
- **Database**: `slides_status` set to 'failed'
- **UI**: Shows "Slides Failed" message

## Files Modified

1. `app/api/lindy/slides/route.ts` - Updated webhook payload format
2. `app/api/lindy/webhook/route.ts` - Updated callback response handling

## Build Status

✅ Build completed successfully
✅ No TypeScript errors
✅ No breaking changes
✅ Backward compatible with existing webhooks

## Next Steps

1. **Commit changes** to Git
2. **Push to GitHub** for auto-deployment
3. **Test in production** with real agent
4. **Verify Supabase URLs** are accessible
5. **Monitor webhook logs** for any issues

## Deployment Command

```bash
git add -A
git commit -m "feat(slides): update webhook to send report_url and template_url, handle Supabase response"
git push origin main
```

---

**Last Updated:** November 7, 2025, 4:38 PM CST
**Status:** ✅ Ready for Testing
**Build:** Successful
