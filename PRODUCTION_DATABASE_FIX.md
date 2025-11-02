# Production Database Fix - Calendar Events Not Persisting

**Date:** October 22, 2025  
**Issue:** Calendar events are not persisting to the database in production  
**Root Cause:** `POSTGRES_URL` environment variable is either not set or has invalid credentials in Vercel  
**Status:** CRITICAL - Requires immediate action

---

## Problem Analysis

### Symptoms
1. Calendar sync reports "Successfully synced X events"
2. Events appear briefly on the profile page
3. After page refresh, events disappear
4. Events are being saved to in-memory storage instead of the database

### Root Cause
The application has a fallback mechanism:
```typescript
if (!isDatabaseConfigured()) {
  console.log('📦 Database not configured, saving to in-memory storage');
  mockEvents.push(newEvent);
  return newEvent;
}
```

When `POSTGRES_URL` is not set or invalid, the application falls back to in-memory storage, which is lost on server restart or page refresh.

### Why This Happens
1. **Missing Environment Variable:** `POSTGRES_URL` is not configured in Vercel
2. **Invalid Credentials:** The Supabase credentials may be expired or incorrect
3. **Connection Failure:** The pooled connection (port 6543) may not be accessible

---

## Solution

### Step 1: Verify Supabase Connection Details

The production database should use:
- **Provider:** Supabase PostgreSQL
- **Hostname:** `aws-0-us-east-1.pooler.supabase.com` (or similar region)
- **Port:** `6543` (pooled connection - NOT 5432)
- **Database:** `postgres`
- **Connection Type:** Pooled connection string

**Connection String Format:**
```
postgresql://[user]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Step 2: Set POSTGRES_URL in Vercel

1. Go to Vercel Project Settings
2. Navigate to Environment Variables
3. Create or update `POSTGRES_URL` with the correct Supabase pooled connection string
4. Apply to: Production, Preview, Development
5. Trigger a new deployment (push a commit or use Vercel's redeploy button)

### Step 3: Verify Database Connection

After deployment, check Vercel Runtime Logs for:
```
✅ POSTGRES_URL is configured
Connection port: 6543 (pooled ✅)
✅ Database connection string configured: postgresql:****@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Step 4: Test Calendar Sync

1. Visit https://team.autoprep.ai/profile/north-texas-shutters
2. Click "Connect Google" or "Connect Outlook"
3. Complete OAuth flow
4. Verify events appear in the Calendar Events list
5. Refresh the page
6. **Verify events still appear** (persisted to database)

---

## Implementation Checklist

- [ ] Obtain valid Supabase pooled connection string
- [ ] Update `POSTGRES_URL` in Vercel environment variables
- [ ] Trigger new deployment
- [ ] Verify connection in Vercel logs
- [ ] Test calendar sync with Google/Outlook
- [ ] Verify events persist after page refresh
- [ ] Test with multiple profiles
- [ ] Verify pre-sales reports and slides generation work

---

## Troubleshooting

### Error: "FATAL: Tenant or user not found"
- **Cause:** Invalid Supabase credentials
- **Solution:** Reset password in Supabase dashboard and update `POSTGRES_URL`

### Error: "Connection refused"
- **Cause:** Pooled connection endpoint is incorrect or unreachable
- **Solution:** Verify the correct pooled connection string from Supabase dashboard

### Events Still Disappearing After Refresh
- **Cause:** `POSTGRES_URL` is still not configured
- **Solution:** Check Vercel logs to confirm environment variable is set

### "Cannot read properties of undefined (reading 'length')"
- **Cause:** Query result handling issue (accessing `.rows` instead of direct array)
- **Solution:** Already fixed in `lib/db/index.ts` - verify latest code is deployed

---

## Files Involved

- `lib/db/index.ts` - Database connection and query functions
- `lib/db/config.ts` - Environment variable configuration
- `app/api/calendar/sync/route.ts` - Calendar sync endpoint
- `app/api/auth/google/route.ts` - Google OAuth callback (triggers sync)
- `app/profile/[slug]/page.tsx` - Profile page (displays events)

---

## Next Steps

1. **Immediate:** Verify and set `POSTGRES_URL` in Vercel
2. **Verify:** Check Vercel logs confirm database connection
3. **Test:** Manually test calendar sync on production
4. **Monitor:** Watch for any database connection errors in logs

---

## Related Documentation

- `SUPABASE_DATABASE_CONNECTION.md` - Detailed Supabase setup guide
- `MASTER_AGENT_GUIDE.md` - Complete environment variable reference
- `CALENDAR_SYNC_FIX_SESSION.md` - Previous calendar sync fixes
- `CALENDAR_SYNC_UPDATE.md` - Auto-sync implementation details

---

**Status:** Ready for deployment  
**Priority:** CRITICAL  
**Estimated Fix Time:** 5-10 minutes (once credentials are verified)
