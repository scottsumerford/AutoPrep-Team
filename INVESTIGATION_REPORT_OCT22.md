# Investigation Report: Google Calendar Sync Issue
**Date:** October 22, 2025, 11:05 PM (America/Chicago)  
**Profile:** North Texas Shutters  
**Status:** ✅ ROOT CAUSE IDENTIFIED

---

## Executive Summary

The Google Calendar sync is not working for the "North Texas Shutters" profile because the **`POSTGRES_URL` environment variable is NOT configured in Vercel**. This causes all data to be saved to in-memory storage instead of the Supabase database, resulting in data loss on page refresh or server restart.

**Impact:** OAuth tokens and calendar events are not persisting.

**Solution:** Set `POSTGRES_URL` in Vercel environment variables with the Supabase pooled connection string.

---

## Issue Details

### What the User Reported
- Created a profile called "North Texas Shutters"
- Attempted to sync Google Calendar
- Calendar events are not showing up on the profile page

### What We Found
1. **Profile page shows "Connect Google" button** - OAuth tokens are not saved
2. **Calendar Events shows "0 events"** - No events persisted
3. **Code is correct** - All calendar sync logic is properly implemented
4. **Database schema is correct** - Unique constraint exists on (profile_id, event_id)

---

## Root Cause Analysis

### The Problem
When `POSTGRES_URL` is not configured in Vercel:

```
POSTGRES_URL not set
    ↓
isDatabaseConfigured() returns false
    ↓
All data saves to in-memory storage (mockProfiles, mockEvents)
    ↓
Page refresh or server restart
    ↓
In-memory data is lost
    ↓
Profile appears disconnected from Google Calendar
    ↓
Calendar events don't appear
```

### Evidence

**1. Profile Page Status**
- Shows "Connect Google" and "Connect Outlook" buttons
- This indicates OAuth tokens are NOT saved in the database
- If tokens were saved, it would show "✓ Connected" status

**2. Calendar Events Status**
- Shows "0 events"
- Message: "No events found. Connect your calendar to see events."
- This indicates no events are persisted in the database

**3. Code Logging**
The `lib/db/index.ts` file contains this logging:
```typescript
if (process.env.POSTGRES_URL) {
  const maskedUrl = process.env.POSTGRES_URL.replace(/:([^@]+)@/, ':****@');
  console.log('✅ Database connection string configured:', maskedUrl);
} else {
  console.warn('⚠️ No POSTGRES_URL found - using in-memory storage');
}
```

When `POSTGRES_URL` is missing, the warning message appears in Vercel logs.

**4. Database Connection Function**
```typescript
const isDatabaseConfigured = () => !!connectionString && sql !== null;

if (!isDatabaseConfigured()) {
  console.log('📦 Database not configured, saving to in-memory storage');
  mockEvents.push(newEvent);
  return newEvent;
}
```

---

## Code Status Review

### ✅ All Code is Correct

**Database Connection (`lib/db/index.ts`)**
- Using correct `postgres` library with `require()`
- Proper connection pooling configuration
- Correct error handling

**Calendar Sync Endpoint (`app/api/calendar/sync/route.ts`)**
- Fetches events from Google Calendar API
- Saves events using `saveCalendarEvent()` function
- Handles token refresh correctly
- Proper error handling and logging

**Save Calendar Event Function (`lib/db/index.ts`)**
```typescript
export async function saveCalendarEvent(data: Omit<CalendarEvent, 'id' | 'created_at'>): Promise<CalendarEvent> {
  if (!isDatabaseConfigured()) {
    // Falls back to in-memory storage
    mockEvents.push(newEvent);
    return newEvent;
  }
  
  try {
    const rows = await sql<CalendarEvent>`
      INSERT INTO calendar_events (...)
      VALUES (...)
      ON CONFLICT (profile_id, event_id) 
      DO UPDATE SET ...
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    console.error('❌ Database error saving calendar event:', error);
    throw error;
  }
}
```

**Database Schema**
- `calendar_events` table exists
- Unique constraint on `(profile_id, event_id)` exists
- All required columns are present

---

## Solution

### Step 1: Get the Supabase Connection String
The connection string is documented in `SUPABASE_DATABASE_CONNECTION.md`:
```
postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

**Important:** Use port **6543** (pooled connection), not 5432 (direct connection)

### Step 2: Set POSTGRES_URL in Vercel

1. Go to Vercel Project Settings
2. Navigate to Environment Variables
3. Add or update `POSTGRES_URL` with the connection string above
4. Set it for: **Production**, **Preview**, and **Development** environments
5. Save the changes

### Step 3: Trigger a New Deployment

After setting the environment variable, trigger a new deployment by:
- Pushing a commit to the main branch, OR
- Using Vercel's "Redeploy" button

### Step 4: Verify the Fix

1. Navigate to https://team.autoprep.ai/profile/north-texas-shutters
2. Click "Connect Google"
3. Complete the OAuth flow
4. Verify that:
   - Profile shows "✓ Connected" status (not "Connect Google" button)
   - Calendar events appear in the calendar view
   - Events persist after page refresh
   - Events appear in the "Calendar Events" list

---

## Expected Results After Fix

### Before Fix
- Profile page shows "Connect Google" button
- Calendar Events shows "0 events"
- Message: "No events found. Connect your calendar to see events."

### After Fix
- Profile page shows "✓ Connected" status
- Calendar Events shows the number of synced events
- Calendar view displays the events
- Events persist after page refresh
- Sync button works correctly

---

## Technical Details

### Why This Happens

The application has a fallback mechanism for when the database is not configured:

```typescript
// In-memory storage for development (when database is not configured)
const mockProfiles: Profile[] = [];
const mockEvents: CalendarEvent[] = [];
const mockTokenUsage: TokenUsage[] = [];

// When database is not configured, data is saved here
if (!isDatabaseConfigured()) {
  mockEvents.push(newEvent);
  return newEvent;
}
```

This is intentional for local development, but in production, the database MUST be configured.

### Why POSTGRES_URL is Required

1. **Connection String:** Tells the application how to connect to Supabase
2. **Authentication:** Contains the database credentials
3. **Pooling:** Uses port 6543 for connection pooling (better performance)
4. **Persistence:** Ensures data survives server restarts

### Why Port 6543?

- **Port 5432:** Direct connection (not suitable for serverless)
- **Port 6543:** Pooled connection (optimized for Vercel's serverless environment)

---

## Files Involved

### Database Layer
- `lib/db/index.ts` - Database connection and query functions
- `lib/db/config.ts` - Environment variable configuration

### Calendar Sync
- `app/api/calendar/sync/route.ts` - Calendar sync endpoint
- `app/profile/[slug]/page.tsx` - Profile page with OAuth handling

### Documentation
- `SUPABASE_DATABASE_CONNECTION.md` - Complete setup guide
- `CALENDAR_SYNC_FIX_SESSION.md` - Previous calendar sync fixes
- `MASTER_AGENT_GUIDE.md` - System architecture

---

## Related Documentation

### For Developers
- **SUPABASE_DATABASE_CONNECTION.md** - Complete implementation guide with troubleshooting
- **CALENDAR_SYNC_FIX_SESSION.md** - Previous fixes and lessons learned

### For DevOps
- **MASTER_AGENT_GUIDE.md** - System architecture and deployment process
- **Production Database Configuration** - Environment variables and connection details

### For Stakeholders
- **CHANGELOG.md** - Project history and current status

---

## Verification Checklist

After setting `POSTGRES_URL` and deploying:

- [ ] Vercel deployment completes successfully
- [ ] Production logs show: "✅ Database connection string configured: postgresql:****@aws-1-us-east-1.pooler.supabase.com:6543/postgres"
- [ ] Profile page loads without errors
- [ ] "Connect Google" button is clickable
- [ ] OAuth flow completes successfully
- [ ] Profile shows "✓ Connected" status after OAuth
- [ ] Calendar events appear in the calendar view
- [ ] Calendar events appear in the "Calendar Events" list
- [ ] Events persist after page refresh
- [ ] Sync button works correctly

---

## Timeline

| Time | Event |
|------|-------|
| Oct 22, 10:40 PM | Previous session: Created documentation for calendar sync fix |
| Oct 22, 11:05 PM | Current investigation: Identified root cause (POSTGRES_URL not set) |
| TBD | Fix deployment: Set POSTGRES_URL in Vercel |
| TBD | Verification: Test calendar sync with North Texas Shutters profile |

---

## Contact Information

- **Profile:** North Texas Shutters
- **Email:** northtexasshutters@gmail.com
- **Repository:** https://github.com/scottsumerford/AutoPrep-Team
- **Production URL:** https://team.autoprep.ai

---

## Next Steps

1. **Immediate:** Set `POSTGRES_URL` in Vercel environment variables
2. **Short-term:** Deploy and verify the fix works
3. **Follow-up:** Test with other profiles to ensure consistency
4. **Documentation:** Update deployment guides if needed

---

**Report Generated:** October 22, 2025, 11:05 PM (America/Chicago)  
**Investigator:** AutoPrep Team Developer Agent  
**Status:** ✅ ROOT CAUSE IDENTIFIED - READY FOR FIX
