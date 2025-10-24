# Production Setup Guide for AutoPrep Team

## Critical Issue: Production Database Not Configured

The production site (https://team.autoprep.ai) is currently using **in-memory storage** instead of a persistent PostgreSQL database. This means:

1. ❌ Calendar events synced from Google Calendar are NOT persisted
2. ❌ Pre-sales reports cannot be generated (no database to store status)
3. ❌ All data is lost when the server restarts

## Solution: Configure PostgreSQL on Vercel

### Step 1: Create a PostgreSQL Database

You need to create a PostgreSQL database. Options:

**Option A: Vercel Postgres (Recommended)**
1. Go to https://vercel.com/dashboard
2. Select your AutoPrep Team project
3. Go to "Storage" tab
4. Click "Create Database" → "Postgres"
5. Follow the setup wizard
6. Copy the connection string

**Option B: External PostgreSQL Provider**
- Neon (https://neon.tech)
- Supabase (https://supabase.com)
- Railway (https://railway.app)
- AWS RDS

### Step 2: Set Environment Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your AutoPrep Team project
3. Go to "Settings" → "Environment Variables"
4. Add the following variables:

```
POSTGRES_URL=postgresql://user:password@host:5432/autoprep_team
LINDY_PRESALES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa
LINDY_PRESALES_WEBHOOK_SECRET=2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07
LINDY_SLIDES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/66bf87f2-034e-463b-a7da-83e9adbf03d4
LINDY_SLIDES_WEBHOOK_SECRET=<get from Lindy dashboard>
NEXT_PUBLIC_APP_URL=https://team.autoprep.ai
LINDY_CALLBACK_URL=https://team.autoprep.ai/api/lindy/webhook
```

### Step 3: Initialize the Production Database

After setting the POSTGRES_URL:

1. Redeploy the application (push to GitHub or click "Redeploy" in Vercel)
2. Call the initialization endpoint:
   ```bash
   curl -X POST https://team.autoprep.ai/api/db/init
   ```
3. Call the migration endpoint to add presales columns:
   ```bash
   curl -X POST https://team.autoprep.ai/api/db/migrate
   ```

### Step 4: Sync Calendar Events

Once the database is configured:

1. Go to https://team.autoprep.ai
2. Select "North Texas Shutters" profile
3. The calendar events should now sync and persist
4. The "Generate Pre-Sales Report" button should work

## Testing the Fix

### Test 1: Verify Database Connection
```bash
curl https://team.autoprep.ai/api/profiles
```
Should return profiles with data.

### Test 2: Sync Calendar Events
```bash
curl -X POST https://team.autoprep.ai/api/calendar/sync \
  -H "Content-Type: application/json" \
  -d '{"profile_id": 1}'
```
Should return `"synced_events": 2` or more.

### Test 3: Verify Events Persist
```bash
curl https://team.autoprep.ai/api/calendar/events?profile_id=1
```
Should return the synced events.

### Test 4: Test Pre-Sales Report Button
1. Go to https://team.autoprep.ai/profile/north-texas-shutters
2. Click "Generate Pre-Sales Report" on any event
3. Button should show "Generating..." with spinner
4. After 1-2 minutes, button should change to green "Download Report"
5. Click to download the PDF

## Current Status

✅ Code is production-ready
✅ API endpoints are implemented
✅ Webhook integration is configured
✅ Database schema includes presales columns
❌ Production database is NOT configured (using in-memory storage)
❌ Calendar events are NOT persisting
❌ Pre-sales reports CANNOT be generated

## Next Steps

1. **URGENT**: Configure PostgreSQL database on Vercel
2. Set POSTGRES_URL environment variable
3. Redeploy the application
4. Call /api/db/init and /api/db/migrate endpoints
5. Test the complete workflow

## Files Modified

- `app/api/db/migrate/route.ts` - Database migration endpoint
- `lib/db/schema.sql` - Updated schema with presales columns
- `app/profile/[slug]/page.tsx` - Fixed event ID in presales handler
- `app/api/lindy/presales-report/route.ts` - API endpoint
- `app/api/lindy/webhook/route.ts` - Webhook receiver

## Support

For issues:
1. Check Vercel deployment logs
2. Check database connection string
3. Verify environment variables are set
4. Call /api/db/init to initialize tables
5. Call /api/db/migrate to add missing columns
