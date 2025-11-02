# 🔗 Webhook Trigger Implementation Guide

**Date**: October 21, 2025 12:01 AM CST
**Status**: ✅ IMPLEMENTED & READY FOR CONFIGURATION

---

## 📋 Overview

The AutoPrep application now uses **webhook triggers** to invoke Lindy agents for pre-sales report and slides generation. This replaces the previous API-based approach with a simpler, more reliable webhook mechanism.

---

## 🔄 How It Works

### Workflow Flow

```
1. User clicks "PDF Pre-sales Report" button
   ↓
2. Frontend sends POST to /api/lindy/presales-report
   ↓
3. Backend receives request with event data
   ↓
4. Backend updates database status to "processing"
   ↓
5. Backend calls LINDY_PRESALES_WEBHOOK_URL with event data
   ↓
6. Lindy agent receives webhook trigger
   ↓
7. Agent processes the request (generates PDF, looks up company info, etc.)
   ↓
8. Agent calls /api/lindy/webhook with results
   ↓
9. Backend updates database with PDF URL and status "completed"
   ↓
10. Frontend auto-refresh detects status change
   ↓
11. Button turns green "Download PDF Report"
   ↓
12. User clicks to download PDF
```

---

## 📊 Data Sent to Agent

When the backend triggers the agent, it sends:

```json
{
  "calendar_event_id": 123,
  "event_title": "ATT intro call test",
  "event_description": "Meeting description from calendar",
  "attendee_email": "jim-jimmytonsmit@att.com",
  "webhook_url": "https://team.autoprep.ai/api/lindy/webhook"
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `calendar_event_id` | number | Database ID of the calendar event |
| `event_title` | string | Title of the meeting |
| `event_description` | string | Description of the meeting |
| `attendee_email` | string | Email of the attendee (used to look up company) |
| `webhook_url` | string | URL where agent should POST results when done |

---

## 🔧 Configuration Required

### Environment Variables

Add these to your `.env.local` file:

```bash
# Lindy Agent Webhook URLs
LINDY_PRESALES_WEBHOOK_URL=https://your-lindy-webhook-url-for-presales-agent
LINDY_SLIDES_WEBHOOK_URL=https://your-lindy-webhook-url-for-slides-agent
```

### Where to Get Webhook URLs

1. Go to your Lindy agent configuration
2. Find the "Webhook" or "Trigger" section
3. Copy the webhook URL provided by Lindy
4. Add it to your environment variables

---

## 📝 API Endpoints

### Trigger Pre-sales Report

**Endpoint**: `POST /api/lindy/presales-report`

**Request Body**:
```json
{
  "event_id": 123,
  "event_title": "ATT intro call test",
  "event_description": "Meeting description",
  "attendee_email": "jim-jimmytonsmit@att.com",
  "profile_id": 3
}
```

**Response**:
```json
{
  "success": true,
  "message": "Pre-sales report generation started. You will be notified when it is ready.",
  "event_id": 123
}
```

**What Happens**:
1. Status set to "processing" in database
2. Webhook called to trigger Lindy agent
3. Agent receives event data
4. Agent generates PDF report
5. Agent calls webhook with PDF URL
6. Frontend button turns green when ready

---

### Trigger Slides Generation

**Endpoint**: `POST /api/lindy/slides`

**Request Body**:
```json
{
  "event_id": 123,
  "event_title": "ATT intro call test",
  "event_description": "Meeting description",
  "attendee_email": "jim-jimmytonsmit@att.com",
  "profile_id": 3
}
```

**Response**:
```json
{
  "success": true,
  "message": "Slides generation started. You will be notified when it is ready.",
  "event_id": 123
}
```

---

### Webhook Callback (Agent → Backend)

**Endpoint**: `POST /api/lindy/webhook`

**Success Request** (from agent):
```json
{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": 123,
  "status": "completed",
  "pdf_url": "https://storage.example.com/reports/presales-report.pdf"
}
```

**Failure Request** (from agent):
```json
{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": 123,
  "status": "failed",
  "error_message": "Failed to retrieve company information for attendee"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

## 🎯 Implementation Details

### Pre-sales Report Endpoint

**File**: `/app/api/lindy/presales-report/route.ts`

**Process**:
1. Receives event data from frontend
2. Updates database status to "processing"
3. Retrieves full event details from database
4. Calls `LINDY_PRESALES_WEBHOOK_URL` with event data
5. Returns success response to frontend
6. Frontend shows "Generating Report..." spinner
7. Waits for agent to call webhook with results

**Error Handling**:
- Returns 404 if event not found
- Returns 500 if webhook URL not configured
- Returns 500 if webhook call fails

---

### Slides Generation Endpoint

**File**: `/app/api/lindy/slides/route.ts`

**Process**:
1. Receives event data from frontend
2. Updates database status to "processing"
3. Retrieves full event details from database
4. Calls `LINDY_SLIDES_WEBHOOK_URL` with event data
5. Returns success response to frontend
6. Frontend shows "Generating Slides..." spinner
7. Waits for agent to call webhook with results

**Error Handling**:
- Returns 404 if event not found
- Returns 500 if webhook URL not configured
- Returns 500 if webhook call fails

---

### Webhook Callback Endpoint

**File**: `/app/api/lindy/webhook/route.ts`

**Process**:
1. Receives callback from agent
2. Validates agent_id and calendar_event_id
3. Updates database with status and URL
4. Returns success response to agent

**Supported Status Values**:
- `completed` - Agent finished successfully
- `failed` - Agent encountered an error

---

## ✅ Testing Checklist

- [ ] Environment variables configured with webhook URLs
- [ ] Pre-sales report endpoint accessible
- [ ] Slides generation endpoint accessible
- [ ] Webhook callback endpoint accessible
- [ ] Agent receives webhook trigger
- [ ] Agent can POST to webhook callback
- [ ] Database updates correctly
- [ ] Frontend buttons update state
- [ ] PDF/slides URLs are publicly accessible
- [ ] Auto-refresh polling works

---

## 🔍 Debugging

### Check Webhook Configuration

```bash
# Verify environment variables are set
echo $LINDY_PRESALES_WEBHOOK_URL
echo $LINDY_SLIDES_WEBHOOK_URL
```

### Check Logs

Look for these log messages:

**Successful trigger**:
```
📄 Starting pre-sales report generation: { event_id: 123, event_title: "..." }
🔗 Triggering Lindy agent via webhook: https://...
📤 Sending to agent: { calendar_event_id: 123, ... }
✅ Pre-sales report generation triggered successfully
```

**Webhook callback received**:
```
🔗 Webhook received from agent
📝 Updating presales status for event 123 to completed
✅ Presales status updated successfully
```

### Common Issues

**Issue**: "Agent webhook URL not configured"
- **Solution**: Add `LINDY_PRESALES_WEBHOOK_URL` to `.env.local`

**Issue**: "Agent webhook failed: 404"
- **Solution**: Check that the webhook URL is correct and accessible

**Issue**: Button stays "Generating Report..." forever
- **Solution**: Check that agent is calling the webhook callback endpoint

---

## 📚 Related Files

- `/app/api/lindy/presales-report/route.ts` - Pre-sales report trigger
- `/app/api/lindy/slides/route.ts` - Slides generation trigger
- `/app/api/lindy/webhook/route.ts` - Webhook callback handler
- `/lib/db/index.ts` - Database functions
- `.env.example` - Environment variable template

---

## 🚀 Next Steps

1. **Get Webhook URLs from Lindy**
   - Contact Lindy support or check agent configuration
   - Get webhook URLs for both agents

2. **Configure Environment Variables**
   - Add webhook URLs to `.env.local`
   - Restart the application

3. **Test the Workflow**
   - Click "PDF Pre-sales Report" button
   - Verify agent receives webhook trigger
   - Verify agent calls webhook callback
   - Verify button turns green when done

4. **Monitor in Production**
   - Check logs for any errors
   - Monitor webhook response times
   - Track PDF generation success rate

---

## 📞 Support

If you encounter issues:

1. Check the logs for error messages
2. Verify webhook URLs are correct
3. Ensure agent can reach the webhook callback endpoint
4. Check that PDF/slides URLs are publicly accessible
5. Verify database is being updated correctly

---

**Status**: ✅ READY FOR CONFIGURATION
**Last Updated**: October 21, 2025 12:01 AM CST
