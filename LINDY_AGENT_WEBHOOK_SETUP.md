# 🔌 Lindy Agent Webhook Configuration Guide

## Overview
Your Lindy agents can now call the webhook endpoint directly via HTTP POST requests. No API key needed on the backend - the agents just need to make HTTP calls to update the status of calendar events.

## ✅ Webhook Endpoint Status
- **URL**: `https://team.autoprep.ai/api/lindy/webhook`
- **Method**: POST
- **Content-Type**: application/json
- **Status**: ✅ LIVE AND TESTED

## 🎯 Agent Configuration

### Pre-sales Report Agent (68aa4cb7ebbc5f9222a2696e)

This agent should:
1. Receive calendar event details (title, description, attendee email, etc.)
2. Research the company/attendee
3. Generate a PDF report
4. Upload the PDF to a publicly accessible URL
5. **Call the webhook to notify completion**

#### Input Variables Expected:
```json
{
  "calendar_event_id": "number",
  "event_title": "string",
  "event_description": "string",
  "attendee_email": "string",
  "company_info": "string (optional URL)"
}
```

#### On Success - Call Webhook:
```bash
POST https://team.autoprep.ai/api/lindy/webhook
Content-Type: application/json

{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": 123,
  "status": "completed",
  "pdf_url": "https://your-storage.com/reports/report-123.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

#### On Failure - Call Webhook:
```bash
POST https://team.autoprep.ai/api/lindy/webhook
Content-Type: application/json

{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": 123,
  "status": "failed",
  "error_message": "Description of what went wrong"
}
```

---

### Slides Generation Agent (68ed392b02927e7ace232732)

This agent should:
1. Receive calendar event details (title, description, attendee email, etc.)
2. Research the company/attendee
3. Generate presentation slides
4. Upload the slides to a publicly accessible URL
5. **Call the webhook to notify completion**

#### Input Variables Expected:
```json
{
  "calendar_event_id": "number",
  "event_title": "string",
  "event_description": "string",
  "attendee_email": "string",
  "slide_template": "string (optional URL to template)",
  "company_info": "string (optional URL)"
}
```

#### On Success - Call Webhook:
```bash
POST https://team.autoprep.ai/api/lindy/webhook
Content-Type: application/json

{
  "agent_id": "68ed392b02927e7ace232732",
  "calendar_event_id": 123,
  "status": "completed",
  "slides_url": "https://your-storage.com/slides/slides-123.pptx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

#### On Failure - Call Webhook:
```bash
POST https://team.autoprep.ai/api/lindy/webhook
Content-Type: application/json

{
  "agent_id": "68ed392b02927e7ace232732",
  "calendar_event_id": 123,
  "status": "failed",
  "error_message": "Description of what went wrong"
}
```

---

## 🧪 Testing the Webhook

You can test the webhook with curl commands:

### Test Pre-sales Report Success:
```bash
curl -X POST https://team.autoprep.ai/api/lindy/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "68aa4cb7ebbc5f9222a2696e",
    "calendar_event_id": 1,
    "status": "completed",
    "pdf_url": "https://example.com/reports/report-1.pdf"
  }'
```

### Test Slides Success:
```bash
curl -X POST https://team.autoprep.ai/api/lindy/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "68ed392b02927e7ace232732",
    "calendar_event_id": 1,
    "status": "completed",
    "slides_url": "https://example.com/slides/slides-1.pptx"
  }'
```

### Test Failure:
```bash
curl -X POST https://team.autoprep.ai/api/lindy/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "68aa4cb7ebbc5f9222a2696e",
    "calendar_event_id": 1,
    "status": "failed",
    "error_message": "Failed to generate PDF"
  }'
```

---

## 📊 What Happens When Webhook is Called

### Success Scenario (status: "completed"):
1. ✅ Database is updated with the download URL
2. ✅ Event status changes from "processing" to "completed"
3. ✅ Frontend button turns green: "Download PDF Report" or "Download Slides"
4. ✅ User can click button to download the file

### Failure Scenario (status: "failed"):
1. ❌ Database is updated with error status
2. ❌ Event status changes from "processing" to "failed"
3. ❌ Frontend button turns red: "Retry Report" or "Retry Slides"
4. ❌ User can click button to retry the generation

---

## 🔄 Complete User Flow

1. **User Action**: Clicks "PDF Pre-sales Report" button on calendar event
2. **Frontend**: Button shows "Generating Report..." with spinner
3. **Backend**: Sets event status to "processing"
4. **Lindy Agent**: Receives request with calendar_event_id
5. **Agent Processing**: Researches company, generates PDF
6. **Agent Upload**: Uploads PDF to storage (S3, Google Cloud, etc.)
7. **Agent Webhook**: Calls `POST /api/lindy/webhook` with PDF URL
8. **Backend**: Updates database with PDF URL and status "completed"
9. **Frontend**: Auto-refresh detects status change
10. **Button Update**: Button turns green "Download PDF Report"
11. **User Download**: Clicks button to download PDF

---

## 🛠️ Implementation Checklist for Lindy Agents

### Pre-sales Report Agent (68aa4cb7ebbc5f9222a2696e):
- [ ] Accept input variables (calendar_event_id, event_title, etc.)
- [ ] Research company/attendee information
- [ ] Generate comprehensive PDF report
- [ ] Upload PDF to publicly accessible URL
- [ ] Call webhook with agent_id and pdf_url on success
- [ ] Call webhook with error_message on failure
- [ ] Test with sample calendar event

### Slides Generation Agent (68ed392b02927e7ace232732):
- [ ] Accept input variables (calendar_event_id, event_title, etc.)
- [ ] Research company/attendee information
- [ ] Generate presentation slides
- [ ] Upload slides to publicly accessible URL
- [ ] Call webhook with agent_id and slides_url on success
- [ ] Call webhook with error_message on failure
- [ ] Test with sample calendar event

---

## 📝 Important Notes

1. **No Authentication Required**: The webhook endpoint is public and doesn't require authentication
2. **calendar_event_id is Critical**: This ID links the generated file to the specific calendar event
3. **Public URLs Required**: The PDF/slides URLs must be publicly accessible (no authentication)
4. **HTTP POST Only**: Webhook only accepts POST requests with JSON payload
5. **Status Values**: Only "completed" and "failed" are valid status values
6. **Error Messages**: Include descriptive error messages for debugging

---

## 🔗 Quick Reference

| Item | Value |
|------|-------|
| Webhook URL | https://team.autoprep.ai/api/lindy/webhook |
| Method | POST |
| Content-Type | application/json |
| Pre-sales Agent ID | 68aa4cb7ebbc5f9222a2696e |
| Slides Agent ID | 68ed392b02927e7ace232732 |
| Status: Success | "completed" |
| Status: Failure | "failed" |

---

## 🚀 Next Steps

1. Configure both Lindy agents to accept the input variables
2. Set up the agents to call the webhook endpoint
3. Test with a sample calendar event
4. Verify PDF/slides generation and download
5. Monitor webhook calls in production logs

Once configured, the integration will be fully operational! 🎉

---

**Last Updated**: October 20, 2025
**Status**: ✅ Webhook Ready for Agent Integration
