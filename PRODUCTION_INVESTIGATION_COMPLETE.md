# Production Investigation Complete - Root Cause Found

## Executive Summary

The "Generate Pre-Sales Report" button is **NOT working** due to a **Lindy webhook configuration issue**, NOT a database problem.

**Status**: Database and API are fully functional. Only the Lindy agent webhook trigger needs to be configured.

---

## Investigation Results

### ✅ What IS Working

1. **Database Connection** - Supabase PostgreSQL is properly configured
   ```bash
   $ curl -s https://team.autoprep.ai/api/profiles | jq length
   2
   ```
   - 2 profiles in database
   - Connection string: `postgresql://...@aws-1-us-east-1.pooler.supabase.com:6543/postgres`

2. **Calendar Events** - Events are synced and stored in database
   ```bash
   $ curl -s https://team.autoprep.ai/api/calendar/1 | jq length
   2
   ```
   - Event ID 475: "third test - WellsFargo" (2025-10-24 21:00)
   - Event ID 476: "new test for autoprep" (2025-11-04 08:00)

3. **API Endpoints** - All endpoints responding correctly
   - `/api/profiles` - Returns profiles ✅
   - `/api/calendar/[id]` - Returns events ✅
   - `/api/lindy/presales-report` - Accepts requests ✅

4. **Frontend** - Button sends correct data
   - Sends event ID (475, 476, etc.)
   - Sends event title, description, attendee email
   - Correctly formatted JSON payload

### ❌ What IS NOT Working

**Lindy Webhook** - Returns 404 "Trigger not found"

```bash
$ curl -X POST "https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa" \
  -H "Authorization: Bearer 2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07" \
  -H "Content-Type: application/json" \
  -d '{"calendar_event_id": 475, "event_title": "test", ...}'

Response:
{
  "data": {
    "success": false,
    "message": "Trigger not found"
  }
}
```

---

## Root Cause Analysis

### The Problem

The Lindy agent webhook URL is configured in environment variables:
- **URL**: `https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa`
- **Secret**: `2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07`

However, the webhook trigger with ID `b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa` is **NOT configured** in the Lindy agent itself.

### Why This Happens

When you create a webhook trigger in Lindy, it generates a unique webhook ID. This ID must match the URL being called. If the trigger doesn't exist or was deleted, the webhook returns 404.

### The Flow

```
1. User clicks "Generate Pre-Sales Report" button
   ↓
2. Frontend sends POST to /api/lindy/presales-report
   ↓
3. Backend finds event in database ✅
   ↓
4. Backend calls Lindy webhook URL
   ↓
5. Lindy returns 404 "Trigger not found" ❌
   ↓
6. Button shows error to user
```

---

## Solution

### Step 1: Access Lindy Agent

1. Go to https://lindy.ai/dashboard
2. Find "Pre-sales Report Agent" (ID: `68aa4cb7ebbc5f9222a2696e`)
3. Open the agent settings

### Step 2: Create/Configure Webhook Trigger

In the agent's webhook settings, ensure there is a trigger with:
- **Webhook ID**: `b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa`
- **Method**: POST
- **Authentication**: Bearer token
- **Secret**: `2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07`

### Step 3: Configure Webhook Payload

The trigger should accept this payload:
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
POST https://team.autoprep.ai/api/lindy/webhook
```

With response:
```json
{
  "event_id": 475,
  "presales_report_url": "https://...",
  "presales_report_status": "completed"
}
```

### Step 5: Test

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

---

## Testing Evidence

### Database ✅
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

### API Endpoint ✅
```bash
$ curl -s -X POST https://team.autoprep.ai/api/lindy/presales-report \
  -H "Content-Type: application/json" \
  -d '{"event_id": 475, "event_title": "test", "event_description": "", "attendee_email": "test@example.com"}' | jq .

{
  "success": false,
  "error": "Webhook failed: 404"
}
```

Note: The error is "Webhook failed: 404" (not "Event not found"), which confirms:
- Event WAS found in database ✅
- Webhook call failed because trigger doesn't exist ❌

---

## Code Status

All code is correct and production-ready:

| File | Status | Notes |
|------|--------|-------|
| `app/api/lindy/presales-report/route.ts` | ✅ CORRECT | Calls webhook correctly |
| `app/api/lindy/webhook/route.ts` | ✅ CORRECT | Receives callback correctly |
| `lib/db/index.ts` | ✅ CORRECT | Database functions working |
| `app/profile/[slug]/page.tsx` | ✅ CORRECT | Button sends correct data |
| `lib/db/schema.sql` | ✅ CORRECT | Schema has all columns |

**No code changes needed.** Only Lindy agent webhook configuration required.

---

## Next Steps

1. **Configure Lindy Webhook** (5 minutes)
   - Access Lindy dashboard
   - Create/verify webhook trigger
   - Test webhook endpoint

2. **Test Production** (2 minutes)
   - Click "Generate Pre-Sales Report" button
   - Verify button shows "Generating..."
   - Wait for report to complete

3. **Monitor** (ongoing)
   - Check Vercel logs for errors
   - Monitor Lindy agent execution
   - Verify reports are generated

---

## Summary

| Component | Status | Action Required |
|-----------|--------|-----------------|
| Database | ✅ WORKING | None |
| Calendar Events | ✅ SYNCED | None |
| API Endpoints | ✅ WORKING | None |
| Frontend Code | ✅ CORRECT | None |
| **Lindy Webhook** | ❌ NOT CONFIGURED | **Configure trigger in Lindy agent** |

**Estimated time to fix**: 5-10 minutes

Once the Lindy webhook trigger is configured, the "Generate Pre-Sales Report" button will work end-to-end.

---

**Investigation Date**: October 24, 2025  
**Investigator**: AutoPrep App Developer  
**Status**: Root cause identified, solution documented
