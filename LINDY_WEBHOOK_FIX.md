# Lindy Webhook Configuration Fix

## Problem Identified

The "Generate Pre-Sales Report" button is failing because:

1. ✅ **Database IS configured** - Supabase PostgreSQL is working
2. ✅ **Calendar events ARE synced** - Events exist in database (ID 475, 476, etc.)
3. ✅ **API endpoints ARE working** - `/api/calendar/1` returns events correctly
4. ❌ **Lindy webhook is returning 404** - "Trigger not found"

## Root Cause

The Lindy agent webhook URL is configured but the trigger/endpoint is not properly set up in the Lindy agent itself.

**Error Response:**
```json
{
  "data": {
    "success": false,
    "message": "Trigger not found"
  }
}
```

**Webhook URL Being Called:**
```
https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa
```

## Solution

The Lindy agent needs to have a webhook trigger configured that matches the webhook ID in the URL.

### Step 1: Access Lindy Agent Dashboard

1. Go to https://lindy.ai/dashboard
2. Find the "Pre-sales Report Agent" (ID: `68aa4cb7ebbc5f9222a2696e`)
3. Click to open the agent

### Step 2: Configure Webhook Trigger

1. In the agent settings, look for "Webhooks" or "Triggers"
2. Create a new webhook trigger with these settings:
   - **Webhook ID**: `b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa`
   - **Method**: POST
   - **Authentication**: Bearer token (use the secret: `2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07`)

### Step 3: Configure Webhook Payload

The webhook should accept this payload:

```json
{
  "calendar_event_id": 475,
  "event_title": "third test - WellsFargo",
  "event_description": "",
  "attendee_email": "northtexasshutters@gmail.com",
  "webhook_url": "https://team.autoprep.ai/api/lindy/webhook"
}
```

### Step 4: Configure Callback

The agent should send results back to:
```
https://team.autoprep.ai/api/lindy/webhook
```

With the response format:
```json
{
  "event_id": 475,
  "presales_report_url": "https://...",
  "presales_report_status": "completed"
}
```

### Step 5: Test the Webhook

After configuring, test with:

```bash
curl -X POST "https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07" \
  -d '{
    "calendar_event_id": 475,
    "event_title": "third test - WellsFargo",
    "event_description": "",
    "attendee_email": "northtexasshutters@gmail.com",
    "webhook_url": "https://team.autoprep.ai/api/lindy/webhook"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Agent triggered successfully"
}
```

## Current Status

| Component | Status | Details |
|-----------|--------|---------|
| Database | ✅ WORKING | Supabase PostgreSQL configured |
| Calendar Events | ✅ SYNCED | 2+ events in database |
| API Endpoints | ✅ WORKING | All endpoints responding correctly |
| Frontend | ✅ WORKING | Button sends correct data |
| **Lindy Webhook** | ❌ NOT CONFIGURED | Trigger not found in agent |

## Testing Evidence

### Database Connection ✅
```bash
$ curl -s https://team.autoprep.ai/api/profiles | jq '.[] | {id, name, url_slug}'
[
  { "id": 2, "name": "Scott Test", "url_slug": "scott-test" },
  { "id": 1, "name": "North Texas Shutters", "url_slug": "north-texas-shutters" }
]
```

### Calendar Events ✅
```bash
$ curl -s https://team.autoprep.ai/api/calendar/1 | jq '.[] | {id, title, start_time}'
[
  { "id": 475, "title": "third test - WellsFargo", "start_time": "2025-10-24T21:00:00.000Z" },
  { "id": 476, "title": "new test for autoprep", "start_time": "2025-11-04T08:00:00.000Z" }
]
```

### Lindy Webhook ❌
```bash
$ curl -s -X POST "https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa" \
  -H "Authorization: Bearer 2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07" \
  -H "Content-Type: application/json" \
  -d '{"calendar_event_id": 475, "event_title": "test", "event_description": "", "attendee_email": "test@example.com", "webhook_url": "https://team.autoprep.ai/api/lindy/webhook"}'

{
  "data": {
    "success": false,
    "message": "Trigger not found"
  }
}
```

## Next Steps

1. **Configure Lindy Agent Webhook** - Add webhook trigger to the Pre-sales Report agent
2. **Test Webhook** - Verify webhook responds with success
3. **Test Button** - Click "Generate Pre-Sales Report" on production
4. **Monitor** - Check that reports are generated and downloaded

## Files Involved

- `app/api/lindy/presales-report/route.ts` - Calls the webhook
- `app/api/lindy/webhook/route.ts` - Receives callback from agent
- `lib/db/index.ts` - Database functions
- `app/profile/[slug]/page.tsx` - Frontend button

All code is correct. Only the Lindy agent webhook trigger needs to be configured.
