# Calendar Events Not Persisting - Complete Analysis & Fix

**Date:** October 22, 2025  
**Issue:** Calendar events sync successfully but disappear after page refresh  
**Root Cause:** Production database connection not configured in Vercel  
**Status:** CRITICAL - Requires manual action to fix

---

## Executive Summary

The AutoPrep Team Dashboard has a critical issue where calendar events are not persisting to the database in production. While the calendar sync appears to work (events show up briefly), they disappear after a page refresh because they're being saved to in-memory storage instead of the database.

### The Problem Flow
```
1. User connects Google/Outlook Calendar
2. OAuth callback triggers calendar sync
3. Events are fetched from Google/Outlook API
4. Application tries to save events to database
5. ❌ POSTGRES_URL not configured → Falls back to in-memory storage
6. Events appear on page
7. User refreshes page
8. ❌ In-memory storage is cleared
9. Events disappear
```

---

## Root Cause Analysis

### Why Events Disappear

The application has a fallback mechanism in `lib/db/index.ts`:

```typescript
const isDatabaseConfigured = () => !!connectionString && sql !== null;

export async function saveCalendarEvent(data) {
  if (!isDatabaseConfigured()) {
    console.log('📦 Database not configured, saving to in-memory storage');
    mockEvents.push(newEvent);  // ← Events saved here, lost on refresh
    return newEvent;
  }
  
  // Otherwise save to database
  const rows = await sql`INSERT INTO calendar_events ...`;
  return rows[0];
}
```

### Why Database Connection Fails

1. **Missing Environment Variable:** `POSTGRES_URL` is not set in Vercel
2. **Invalid Credentials:** The Supabase pooled connection credentials may be expired
3. **Connection String Format:** Must use pooled connection (port 6543), not direct (port 5432)

### Evidence

From the documentation files:
- `SUPABASE_DATABASE_CONNECTION.md` - Shows pooled connection format
- `MASTER_AGENT_GUIDE.md` - Lists required environment variables
- `CALENDAR_SYNC_FIX_SESSION.md` - Previous fixes that addressed similar issues
- `CALENDAR_SYNC_UPDATE.md` - Auto-sync implementation

---

## What Needs to Be Fixed

### Step 1: Verify Supabase Credentials (MANUAL - You Must Do This)

You need to provide the **Supabase pooled connection string** for production:

**Format:**
```
postgresql://[user]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**How to find it:**
1. Go to your Supabase project dashboard
2. Click "Project Settings" (gear icon)
3. Click "Database" in the left sidebar
4. Look for "Connection Pooling" section
5. Copy the "Transaction" mode connection string (port 6543)

**Important:** Must use port 6543 (pooled), NOT port 5432 (direct)

### Step 2: Set POSTGRES_URL in Vercel (MANUAL - You Must Do This)

1. Go to [Vercel Project Settings](https://vercel.com/scottsumerford/autoprep-team/settings/environment-variables)
2. Click "Environment Variables"
3. Create or update `POSTGRES_URL` with the connection string from Step 1
4. Apply to: **Production**, **Preview**, **Development**
5. Click "Save"
6. Trigger a new deployment (push a commit or use Vercel's redeploy button)

### Step 3: Verify Connection (AUTOMATIC - Already Done)

The code already has verification in place. After deployment, check Vercel Runtime Logs for:

```
✅ POSTGRES_URL is configured
Connection port: 6543 (pooled ✅)
✅ Database connection string configured: postgresql:****@aws-0-us-east-1.pooler.supabase.com:6543/postgres
🔧 Initializing database tables...
✅ Profiles table ready
✅ Calendar events table ready
✅ Token usage table ready
✅ File uploads table ready
✅ Database tables initialized successfully
```

### Step 4: Test Calendar Sync (MANUAL - You Must Do This)

After deployment:

1. Visit https://team.autoprep.ai/profile/north-texas-shutters
2. Click "Connect Google" or "Connect Outlook"
3. Complete the OAuth flow
4. Verify events appear in the "Calendar Events" section
5. **Refresh the page** (Ctrl+R or Cmd+R)
6. **Verify events still appear** ← This is the critical test

If events persist after refresh, the fix is working! ✅

---

## Code Changes Already Made

### 1. Profile Page Refresh Logic (Commit: 3a6d2c5)
- Added `useSearchParams()` to detect `?synced=true` parameter
- Added `useEffect` to refresh profile data after OAuth callback
- Profile now shows green "✓ Connected" status immediately after OAuth

**File:** `app/profile/[slug]/page.tsx`

```typescript
const synced = searchParams.get('synced');

// Refresh profile when synced parameter is present (after OAuth callback)
useEffect(() => {
  if (synced === 'true' && profile) {
    console.log('🔄 Refreshing profile after OAuth sync...');
    fetchProfile();
  }
}, [synced, profile, fetchProfile]);
```

### 2. Database Configuration (Already in place)
- `lib/db/index.ts` - Uses `postgres` library with `require()` (not `@vercel/postgres`)
- `lib/db/config.ts` - Checks for `POSTGRES_URL` environment variable
- `lib/db/schema.sql` - Database schema with proper constraints

### 3. Calendar Sync Endpoint (Already in place)
- `app/api/calendar/sync/route.ts` - Syncs Google and Outlook calendars
- `app/api/auth/google/route.ts` - Triggers sync after OAuth callback
- Proper error handling and logging

---

## What You Need to Do

### ✅ Already Completed
- [x] Profile page refresh logic implemented
- [x] Database configuration code in place
- [x] Calendar sync endpoint working
- [x] OAuth callback triggers sync
- [x] Documentation created

### ⚠️ Requires Your Action
- [ ] **Get Supabase pooled connection string** from your Supabase dashboard
- [ ] **Set POSTGRES_URL in Vercel** environment variables
- [ ] **Trigger new deployment** (push commit or redeploy)
- [ ] **Test calendar sync** on production
- [ ] **Verify events persist** after page refresh

---

## Testing Checklist

After you set the `POSTGRES_URL` and deploy:

- [ ] Check Vercel logs show "✅ POSTGRES_URL is configured"
- [ ] Check logs show "Connection port: 6543 (pooled ✅)"
- [ ] Visit https://team.autoprep.ai/profile/north-texas-shutters
- [ ] Click "Connect Google" or "Connect Outlook"
- [ ] Complete OAuth flow
- [ ] Verify events appear in Calendar Events list
- [ ] Refresh page (Ctrl+R)
- [ ] Verify events still appear (not disappeared)
- [ ] Check that "✓ Google Connected" or "✓ Outlook Connected" shows in green
- [ ] Try generating a Pre-sales Report (should work with persisted events)
- [ ] Try generating Slides (should work with persisted events)

---

## Files Modified in This Session

1. **app/profile/[slug]/page.tsx** - Added profile refresh after OAuth sync
2. **PRODUCTION_DATABASE_FIX.md** - Comprehensive fix guide
3. **CALENDAR_EVENTS_PERSISTENCE_ISSUE.md** - This document

---

## Related Documentation

- `MASTER_AGENT_GUIDE.md` - Complete environment variable reference
- `SUPABASE_DATABASE_CONNECTION.md` - Detailed Supabase setup
- `CALENDAR_SYNC_FIX_SESSION.md` - Previous calendar sync fixes
- `CALENDAR_SYNC_UPDATE.md` - Auto-sync implementation
- `DATABASE_CONNECTION_ISSUE.md` - Connection troubleshooting

---

## Next Steps

1. **Immediate:** Get the Supabase pooled connection string
2. **Set:** Update `POSTGRES_URL` in Vercel
3. **Deploy:** Trigger new deployment
4. **Verify:** Check logs and test calendar sync
5. **Report:** Let me know if events persist after refresh

---

## Support

If you encounter any issues:

1. Check Vercel Runtime Logs for error messages
2. Verify the connection string format (port 6543, not 5432)
3. Ensure `POSTGRES_URL` is set in all environments (Production, Preview, Development)
4. Try disconnecting and reconnecting the calendar
5. Check browser console for any JavaScript errors

---

**Status:** Ready for production deployment  
**Priority:** CRITICAL  
**Estimated Time to Fix:** 5-10 minutes (once credentials are provided)

**Last Updated:** October 22, 2025, 10:15 PM (America/Chicago)
