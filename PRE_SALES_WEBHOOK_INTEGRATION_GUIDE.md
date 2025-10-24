# 🎯 Pre-Sales Report Webhook Integration Guide

**Last Updated**: October 23, 2025  
**Status**: ✅ Production Ready  
**Version**: 2.0.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Complete User Flow](#complete-user-flow)
4. [Frontend Implementation](#frontend-implementation)
5. [Backend API Routes](#backend-api-routes)
6. [Webhook Trigger Mechanism](#webhook-trigger-mechanism)
7. [Lindy Agent Integration](#lindy-agent-integration)
8. [Database Schema](#database-schema)
9. [Environment Configuration](#environment-configuration)
10. [Testing & Debugging](#testing--debugging)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The AutoPrep Team Dashboard integrates with Lindy agents to automatically generate pre-sales reports and presentation slides for calendar events. This guide explains how the "Generate Pre-Sales Report" button connects to the Lindy webhook system.

### Key Components:
- **Frontend Button**: User clicks "Generate Pre-Sales Report" on a calendar event
- **API Endpoint**: `/api/lindy/presales-report` - Triggers the webhook
- **Webhook URL**: `https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa`
- **Callback Endpoint**: `/api/lindy/webhook` - Receives agent completion status
- **Database**: Tracks report generation status and stores download URLs

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE (Frontend)                    │
│                                                                   │
│  Calendar Event Card                                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Event: "First test meet"                                 │   │
│  │ Date: Oct 23, 2025                                       │   │
│  │                                                           │   │
│  │ [Generate Pre-Sales Report] ← User clicks here           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API LAYER                             │
│                                                                   │
│  POST /api/lindy/presales-report                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Validate event exists in database                     │   │
│  │ 2. Update event status to "processing"                   │   │
│  │ 3. Prepare webhook payload                               │   │
│  │ 4. Call Lindy webhook URL with Bearer token              │   │
│  │ 5. Return success response to frontend                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    LINDY AGENT SYSTEM                            │
│                                                                   │
│  Webhook Trigger                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ https://public.lindy.ai/api/v1/webhooks/lindy/...        │   │
│  │                                                           │   │
│  │ Payload:                                                 │   │
│  │ {                                                         │   │
│  │   "calendar_event_id": 123,                              │   │
│  │   "event_title": "First test meet",                      │   │
│  │   "event_description": "...",                            │   │
│  │   "attendee_email": "user@example.com",                  │   │
│  │   "webhook_url": "https://team.autoprep.ai/api/..."      │   │
│  │ }                                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↓                                    │
│  Pre-sales Report Agent (68aa4cb7ebbc5f9222a2696e)              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. Receive calendar event details                        │   │
│  │ 2. Research company/attendee                             │   │
│  │ 3. Generate comprehensive PDF report                     │   │
│  │ 4. Upload PDF to storage (S3, Google Cloud, etc.)        │   │
│  │ 5. Call callback webhook with PDF URL                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CALLBACK WEBHOOK                              │
│                                                                   │
│  POST /api/lindy/webhook                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Payload from Lindy Agent:                                │   │
│  │ {                                                         │   │
│  │   "agent_id": "68aa4cb7ebbc5f9222a2696e",                │   │
│  │   "calendar_event_id": 123,                              │   │
│  │   "status": "completed",                                 │   │
│  │   "pdf_url": "https://storage.com/reports/123.pdf"       │   │
│  │ }                                                         │   │
│  │                                                           │   │
│  │ 1. Validate agent_id and calendar_event_id               │   │
│  │ 2. Update database with PDF URL                          │   │
│  │ 3. Change status from "processing" to "completed"        │   │
│  │ 4. Return success response                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE UPDATE                               │
│                                                                   │
│  calendar_events table                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ id: 123                                                  │   │
│  │ title: "First test meet"                                 │   │
│  │ presales_report_status: "completed" ← Updated            │   │
│  │ presales_report_url: "https://storage.com/..." ← Updated │   │
│  │ presales_report_generated_at: "2025-10-23T..." ← Updated │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND UPDATE                               │
│                                                                   │
│  Auto-refresh detects status change                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Event: "First test meet"                                 │   │
│  │ Date: Oct 23, 2025                                       │   │
│  │                                                           │   │
│  │ [✓ Download Report] ← Button updated to green            │   │
│  │                                                           │   │
│  │ User can now click to download PDF                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete User Flow

### Step 1: User Clicks Button
```
Location: /profile/[slug] page
Component: Calendar event card
Action: User clicks "Generate Pre-Sales Report" button
```

### Step 2: Frontend Sends Request
```javascript
// File: app/profile/[slug]/page.tsx
const handleGeneratePresalesReport = async (event: CalendarEvent) => {
  setGeneratingReportId(event.id);
  try {
    const response = await fetch('/api/lindy/presales-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: event.event_id,
        event_title: event.title,
        event_description: event.description || '',
        attendee_email: profile?.email || '',
      }),
    });
    
    if (response.ok) {
      // Update local state to show processing
      setEvents(events.map(e => 
        e.id === event.id 
          ? { 
              ...e, 
              presales_report_status: 'processing',
              presales_report_started_at: new Date().toISOString()
            }
          : e
      ));
    }
  } catch (error) {
    console.error('Error generating pre-sales report:', error);
  } finally {
    setGeneratingReportId(null);
  }
};
```

### Step 3: Backend Processes Request
```
Endpoint: POST /api/lindy/presales-report
File: app/api/lindy/presales-report/route.ts

1. Validate request body
2. Check if event exists in database
3. Update event status to "processing"
4. Prepare webhook payload
5. Call Lindy webhook URL
6. Return success response
```

### Step 4: Lindy Agent Processes
```
Agent ID: 68aa4cb7ebbc5f9222a2696e
Input: Calendar event details
Process:
  1. Research company/attendee
  2. Generate comprehensive PDF report
  3. Upload PDF to storage
  4. Call callback webhook
```

### Step 5: Agent Calls Callback Webhook
```
Endpoint: POST /api/lindy/webhook
Payload:
{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": 123,
  "status": "completed",
  "pdf_url": "https://storage.com/reports/123.pdf"
}
```

### Step 6: Database Updated
```
Table: calendar_events
Updates:
  - presales_report_status: "completed"
  - presales_report_url: "https://storage.com/reports/123.pdf"
  - presales_report_generated_at: current timestamp
```

### Step 7: Frontend Auto-Refreshes
```
Frontend polls /api/calendar/[profile_id]
Detects status change from "processing" to "completed"
Updates button to green "Download Report"
User can now click to download PDF
```

---

## 💻 Frontend Implementation

### Button Component
```tsx
// File: app/profile/[slug]/page.tsx

{event.presales_report_status === 'pending' && (
  <Button 
    size="sm" 
    variant="outline"
    onClick={() => handleGeneratePresalesReport(event)}
    disabled={generatingReportId === event.id}
  >
    {generatingReportId === event.id ? (
      <>
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Generating...
      </>
    ) : (
      <>
        <FileText className="w-4 h-4 mr-1" />
        Generate Pre-Sales Report
      </>
    )}
  </Button>
)}

{event.presales_report_status === 'processing' && (
  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
    <Loader2 className="w-3 h-3 animate-spin" />
    Generating Report...
  </div>
)}

{event.presales_report_status === 'completed' && event.presales_report_url && (
  <a
    href={event.presales_report_url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 hover:bg-green-100"
  >
    <Download className="w-4 h-4" />
    Download Report
  </a>
)}

{event.presales_report_status === 'failed' && (
  <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
    <FileText className="w-4 h-4" />
    Report Failed
  </div>
)}
```

### Handler Function
```typescript
const handleGeneratePresalesReport = async (event: CalendarEvent) => {
  setGeneratingReportId(event.id);
  try {
    const response = await fetch('/api/lindy/presales-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: event.event_id,
        event_title: event.title,
        event_description: event.description || '',
        attendee_email: profile?.email || '',
      }),
    });
    
    if (response.ok) {
      console.log('✅ Pre-sales report generation started');
      setEvents(events.map(e => 
        e.id === event.id 
          ? { 
              ...e, 
              presales_report_status: 'processing',
              presales_report_started_at: new Date().toISOString()
            }
          : e
      ));
    } else {
      console.error('❌ Failed to generate pre-sales report');
    }
  } catch (error) {
    console.error('Error generating pre-sales report:', error);
  } finally {
    setGeneratingReportId(null);
  }
};
```

---

## 🔌 Backend API Routes

### 1. Presales Report Trigger Route
```typescript
// File: app/api/lindy/presales-report/route.ts

export async function POST(request: NextRequest) {
  try {
    // Mark any stale presales runs as failed (> 15 minutes)
    await markStalePresalesRuns();

    const body = await request.json();
    const { event_id, event_title, event_description, attendee_email } = body;

    console.log('📄 Starting pre-sales report generation:', {
      event_id,
      event_title,
      attendee_email
    });

    // Update status to processing
    await updateEventPresalesStatus(event_id, 'processing');

    // Get the full event details from database
    const event = await getEventById(event_id);
    
    if (!event) {
      console.error('❌ Event not found in database:', event_id);
      return NextResponse.json({ 
        success: false, 
        error: 'Event not found' 
      }, { status: 404 });
    }

    // Get webhook URL and secret from environment
    const webhookUrl = process.env.LINDY_PRESALES_WEBHOOK_URL;
    const webhookSecret = process.env.LINDY_PRESALES_WEBHOOK_SECRET;
    
    if (!webhookUrl || !webhookSecret) {
      console.error('❌ Webhook configuration missing');
      return NextResponse.json({ 
        success: false, 
        error: 'Webhook not configured' 
      }, { status: 500 });
    }

    console.log('🔗 Triggering Pre-sales Report Lindy agent via webhook');

    // Prepare the payload for the agent
    const agentPayload = {
      calendar_event_id: event_id,
      event_title: event_title,
      event_description: event_description || '',
      attendee_email: attendee_email,
      webhook_url: process.env.LINDY_CALLBACK_URL || 
                   `${process.env.NEXT_PUBLIC_APP_URL}/api/lindy/webhook`
    };

    console.log('📤 Sending to agent:', agentPayload);

    // Call the webhook to invoke the agent
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${webhookSecret}`,
      },
      body: JSON.stringify(agentPayload)
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('❌ Webhook failed:', {
        status: webhookResponse.status,
        error: errorText
      });
      return NextResponse.json({ 
        success: false, 
        error: `Webhook failed: ${webhookResponse.status}` 
      }, { status: 500 });
    }

    const webhookData = await webhookResponse.json();
    console.log('✅ Pre-sales report generation triggered successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Pre-sales report generation started',
      event_id,
      webhook_response: webhookData
    });
  } catch (error) {
    console.error('Error generating pre-sales report:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate pre-sales report' 
    }, { status: 500 });
  }
}
```

### 2. Webhook Callback Route
```typescript
// File: app/api/lindy/webhook/route.ts

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 Received webhook from Lindy agent:', body);

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
        console.log('✅ Pre-sales report marked as completed');
      } else if (status === 'failed') {
        await updateEventPresalesStatus(calendar_event_id, 'failed');
        console.log('❌ Pre-sales report marked as failed:', error_message);
      }
    }
    
    // Handle slides generation agent webhook
    else if (agent_id === '68ed392b02927e7ace232732') {
      console.log('📊 Processing slides generation webhook');
      
      if (status === 'completed' && slides_url) {
        await updateEventSlidesStatus(calendar_event_id, 'completed', slides_url);
        console.log('✅ Slides marked as completed');
      } else if (status === 'failed') {
        await updateEventSlidesStatus(calendar_event_id, 'failed');
        console.log('❌ Slides marked as failed:', error_message);
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
      error: 'Failed to process webhook' 
    }, { status: 500 });
  }
}
```

---

## 🔗 Webhook Trigger Mechanism

### Webhook URL
```
https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa
```

### Authentication
```
Header: Authorization: Bearer {LINDY_PRESALES_WEBHOOK_SECRET}
Secret: 2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07
```

### Request Payload
```json
{
  "calendar_event_id": 123,
  "event_title": "First test meet",
  "event_description": "Meeting with potential client",
  "attendee_email": "user@example.com",
  "webhook_url": "https://team.autoprep.ai/api/lindy/webhook"
}
```

### Response
```json
{
  "success": true,
  "message": "Pre-sales report generation started. You will be notified when it is ready.",
  "event_id": 123,
  "webhook_response": {
    "status": "triggered",
    "agent_id": "68aa4cb7ebbc5f9222a2696e"
  }
}
```

---

## 🤖 Lindy Agent Integration

### Pre-sales Report Agent (68aa4cb7ebbc5f9222a2696e)

**Input Variables:**
```json
{
  "calendar_event_id": "number",
  "event_title": "string",
  "event_description": "string",
  "attendee_email": "string",
  "webhook_url": "string"
}
```

**Agent Workflow:**
1. Receive calendar event details
2. Extract company name from event title/description
3. Research company using web search
4. Research attendee using email/LinkedIn
5. Generate comprehensive PDF report with:
   - Company overview
   - Key decision makers
   - Recent news/updates
   - Competitive landscape
   - Recommended talking points
6. Upload PDF to storage (S3, Google Cloud, etc.)
7. Call webhook with PDF URL

**Callback Webhook:**
```bash
POST https://team.autoprep.ai/api/lindy/webhook
Content-Type: application/json

{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": 123,
  "status": "completed",
  "pdf_url": "https://storage.com/reports/report-123.pdf"
}
```

---

## 📊 Database Schema

### calendar_events Table
```sql
CREATE TABLE calendar_events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  profile_id INTEGER NOT NULL REFERENCES profiles(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  attendees TEXT[],
  source VARCHAR(50),
  
  -- Pre-sales Report Fields
  presales_report_status VARCHAR(50) DEFAULT 'pending',
  presales_report_url TEXT,
  presales_report_generated_at TIMESTAMP,
  presales_report_started_at TIMESTAMP,
  
  -- Slides Fields
  slides_status VARCHAR(50) DEFAULT 'pending',
  slides_url TEXT,
  slides_generated_at TIMESTAMP,
  slides_started_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Status Values
- `pending` - Not yet started
- `processing` - Generation in progress
- `completed` - Successfully generated
- `failed` - Generation failed

---

## 🔐 Environment Configuration

### Local Development (.env)
```bash
# Lindy Webhook URLs
LINDY_PRESALES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa
LINDY_SLIDES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/66bf87f2-034e-463b-a7da-83e9adbf03d4

# Lindy Webhook Secrets
LINDY_PRESALES_WEBHOOK_SECRET=2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07
LINDY_SLIDES_WEBHOOK_SECRET=f395b62647c72da770de97f7715ee68824864b21b9a2435bdaab7004762359c5

# Callback URLs
LINDY_CALLBACK_URL=http://localhost:3000/api/lindy/webhook
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (Vercel Environment Variables)
```bash
LINDY_PRESALES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa
LINDY_SLIDES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/66bf87f2-034e-463b-a7da-83e9adbf03d4
LINDY_PRESALES_WEBHOOK_SECRET=2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07
LINDY_SLIDES_WEBHOOK_SECRET=f395b62647c72da770de97f7715ee68824864b21b9a2435bdaab7004762359c5
LINDY_CALLBACK_URL=https://team.autoprep.ai/api/lindy/webhook
NEXT_PUBLIC_APP_URL=https://team.autoprep.ai
```

---

## 🧪 Testing & Debugging

### Test the Presales Report Trigger
```bash
curl -X POST http://localhost:3000/api/lindy/presales-report \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "1",
    "event_title": "Test Meeting",
    "event_description": "Test description",
    "attendee_email": "test@example.com"
  }'
```

### Test the Webhook Callback
```bash
curl -X POST http://localhost:3000/api/lindy/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "68aa4cb7ebbc5f9222a2696e",
    "calendar_event_id": 1,
    "status": "completed",
    "pdf_url": "https://example.com/report.pdf"
  }'
```

### Check Logs
```bash
# Local development
tail -f server.log | grep "presales-report\|webhook"

# Production (Vercel)
# Go to https://vercel.com/scottsumerford/autoprep-team/logs
```

### Database Query
```sql
-- Check event status
SELECT id, title, presales_report_status, presales_report_url, presales_report_started_at
FROM calendar_events
WHERE id = 1;

-- Check all processing events
SELECT id, title, presales_report_status, presales_report_started_at
FROM calendar_events
WHERE presales_report_status = 'processing';
```

---

## 🔧 Troubleshooting

### Issue: "Generate Pre-Sales Report" button doesn't work

**Check 1: Environment Variables**
```bash
# Verify webhook URL and secret are set
echo $LINDY_PRESALES_WEBHOOK_URL
echo $LINDY_PRESALES_WEBHOOK_SECRET
```

**Check 2: API Endpoint**
```bash
# Test the API endpoint directly
curl -X POST http://localhost:3000/api/lindy/presales-report \
  -H "Content-Type: application/json" \
  -d '{"event_id": "1", "event_title": "Test", "event_description": "", "attendee_email": "test@example.com"}'
```

**Check 3: Database**
```sql
-- Verify event exists
SELECT * FROM calendar_events WHERE id = 1;

-- Check if status was updated
SELECT presales_report_status FROM calendar_events WHERE id = 1;
```

### Issue: Report generation starts but never completes

**Possible Causes:**
1. Lindy agent not configured to call webhook
2. Webhook URL incorrect in agent configuration
3. Agent timeout (15 minutes)
4. Network connectivity issue

**Solution:**
1. Verify agent is calling the webhook endpoint
2. Check Lindy agent logs
3. Test webhook manually with curl
4. Check firewall/network settings

### Issue: Webhook callback fails

**Check 1: Payload Format**
```json
{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": 123,
  "status": "completed",
  "pdf_url": "https://storage.com/report.pdf"
}
```

**Check 2: Agent ID**
- Pre-sales: `68aa4cb7ebbc5f9222a2696e`
- Slides: `68ed392b02927e7ace232732`

**Check 3: Database Update**
```sql
SELECT presales_report_status, presales_report_url 
FROM calendar_events 
WHERE id = 123;
```

---

## 📝 Important Notes

1. **Webhook URLs are Public**: The webhook endpoint doesn't require authentication
2. **Bearer Token Required**: The presales-report endpoint requires the webhook secret
3. **15-Minute Timeout**: Reports taking longer than 15 minutes are marked as stale
4. **PDF URLs Must Be Public**: The PDF URL must be publicly accessible
5. **calendar_event_id is Critical**: This ID links the report to the specific event
6. **Status Values**: Only "pending", "processing", "completed", and "failed" are valid

---

## 🚀 Quick Reference

| Component | Value |
|-----------|-------|
| Frontend Button | "Generate Pre-Sales Report" |
| API Endpoint | POST /api/lindy/presales-report |
| Webhook URL | https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa |
| Webhook Secret | 2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07 |
| Callback Endpoint | POST /api/lindy/webhook |
| Agent ID | 68aa4cb7ebbc5f9222a2696e |
| Timeout | 15 minutes |
| Status: Pending | pending |
| Status: Processing | processing |
| Status: Completed | completed |
| Status: Failed | failed |

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the MASTER_AGENT_GUIDE.md for system architecture
3. Check Vercel logs for production issues
4. Review Lindy agent configuration

---

**Last Updated**: October 23, 2025  
**Version**: 2.0.0  
**Status**: ✅ Production Ready
