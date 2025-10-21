# 🔴 Pre-Sales Report Agent Issue Analysis

**Date**: October 20, 2025 11:54 PM CST
**Issue**: Agent not being triggered - button shows "Generating Report..." but agent never receives the request

---

## 🔍 Problem Identified

The API endpoint is **NOT actually calling the Lindy agent**. Here's what's happening:

### Current Flow (BROKEN):
```
1. User clicks "PDF Pre-sales Report" button
   ↓
2. Frontend sends POST to /api/lindy/presales-report
   ↓
3. Backend receives request with event data
   ↓
4. Backend sets status to "processing" in database
   ↓
5. Backend returns success response
   ↓
6. Frontend shows "Generating Report..." spinner
   ↓
7. ❌ NOTHING HAPPENS - Agent is never triggered!
   ↓
8. Frontend keeps polling but status never changes
```

### Root Cause:
The endpoint at `/app/api/lindy/presales-report/route.ts` only:
- Receives the request
- Updates the database status to "processing"
- Returns a success response

**It does NOT trigger the Lindy agent to start processing.**

---

## 📊 Data Being Sent to the Endpoint

When the user clicks "PDF Pre-sales Report", the frontend sends:

```json
{
  "profile_id": 3,
  "event_id": 123,
  "event_title": "ATT intro call test",
  "event_description": "...",
  "attendee_email": "jim-jimmytonsmit@att.com"
}
```

### Current Endpoint Code:
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { event_id, event_title, event_description, attendee_email } = body;

  // Only updates database status - does NOT trigger agent
  await updateEventPresalesStatus(event_id, 'processing');

  return NextResponse.json({
    success: true,
    message: 'Pre-sales report generation started...',
    event_id
  });
}
```

---

## ✅ What Needs to Happen

The endpoint needs to:

1. **Receive the event data** ✅ (Already doing this)
2. **Update status to "processing"** ✅ (Already doing this)
3. **Trigger the Lindy agent** ❌ (NOT doing this - THIS IS THE PROBLEM)
4. **Return success response** ✅ (Already doing this)

---

## 🎯 Solution Required

The endpoint needs to call the Lindy agent API to trigger the workflow. This requires:

### Option 1: Call Lindy Agent API Directly
```typescript
// Call the Lindy agent to start processing
const response = await fetch('https://api.lindy.ai/v1/agents/{AGENT_ID}/run', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.LINDY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    calendar_event_id: event_id,
    event_title: event_title,
    event_description: event_description,
    attendee_email: attendee_email,
    webhook_url: 'https://team.autoprep.ai/api/lindy/webhook'
  })
});
```

### Option 2: Use Lindy Webhook Trigger
If the agent is configured to accept webhook triggers, we could call a webhook URL that Lindy provides.

---

## 📋 Data Currently Available

The endpoint has access to:
- `event_id` - Database ID of the calendar event
- `event_title` - Title of the meeting (e.g., "ATT intro call test")
- `event_description` - Description of the meeting
- `attendee_email` - Email of the attendee (e.g., "jim-jimmytonsmit@att.com")
- `profile_id` - ID of the profile (e.g., 3 for North Texas Shutters)

---

## ❓ Questions for You

1. **Should we add more data?** Currently sending:
   - event_id
   - event_title
   - event_description
   - attendee_email
   
   Would you like to add:
   - Profile name (North Texas Shutters)
   - Profile email (northtexasshutters@gmail.com)
   - Company info URL (if available)
   - Slide template URL (if available)
   - Any other data?

2. **How should we trigger the agent?**
   - Do you have a Lindy API key we should use?
   - What's the correct endpoint to call?
   - Should we use a webhook trigger instead?

3. **What information does the agent need?**
   - Just the attendee email to look up company info?
   - The event title and description for context?
   - Any other specific data?

---

## 🔧 Next Steps

Once you confirm:
1. What additional data (if any) should be sent to the agent
2. How to trigger the agent (API endpoint, webhook, etc.)
3. Any authentication details needed

I can update the endpoint to properly trigger the agent and get the workflow working.

---

## 📝 Current Event Example

**Event**: "ATT intro call test"
- **Event ID**: 123 (database ID)
- **Title**: ATT intro call test
- **Description**: (from calendar)
- **Attendee Email**: jim-jimmytonsmit@att.com
- **Profile**: North Texas Shutters (ID: 3)
- **Status**: Currently stuck at "Generating Report..." because agent was never triggered

