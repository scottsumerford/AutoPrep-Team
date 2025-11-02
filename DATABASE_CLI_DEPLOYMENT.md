# Database CLI Deployment Guide - October 29, 2025

## Overview

This guide explains how to deploy database schema changes to production using the Supabase CLI.

## Prerequisites

1. **Supabase CLI installed** (or install via: `npm install -g supabase`)
2. **Supabase project access** (credentials configured)
3. **Database migration files** in `supabase/migrations/` directory

## Current Status

✅ **Code deployed to production** (Vercel)
✅ **Database schema changes committed** to GitHub
⏳ **Database migration pending** - needs to be applied to Supabase

## Database Changes to Deploy

### New Column: `presales_report_content`

**Table:** `calendar_events`

**Migration SQL:**
```sql
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_content TEXT;
```

**Purpose:** Store pre-sales report text content alongside PDF URLs

## Deployment Methods

### Method 1: Automatic Migration via Application (RECOMMENDED)

The application automatically runs migrations on startup. Simply visit:

```
https://team.autoprep.ai/api/db/migrate
```

This endpoint will:
1. Check database connection
2. Run all pending migrations
3. Create the `presales_report_content` column
4. Return success/error status

**Advantages:**
- No CLI setup required
- Automatic on application startup
- Integrated with application lifecycle
- Fallback error handling

### Method 2: Supabase CLI Push (Manual)

If you have Supabase CLI installed:

```bash
# 1. Login to Supabase
supabase login

# 2. Link to your project
supabase link --project-ref kmswrzzlirdfnzzbnrpo

# 3. Create migration file
supabase migration new add_presales_report_content

# 4. Edit the migration file in supabase/migrations/
# Add the SQL:
# ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_content TEXT;

# 5. Push to production
supabase db push --linked

# 6. Verify migration
supabase migration list --linked
```

### Method 3: Manual SQL via Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your AutoPrep project
3. Navigate to SQL Editor
4. Create new query
5. Paste the migration SQL:
```sql
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_content TEXT;
```
6. Click "Run"
7. Verify success message

### Method 4: Direct Database Connection

Connect directly to Supabase and run the migration:

```bash
# Using psql
psql postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres

# Then run:
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_content TEXT;
```

## Recommended Approach

**Use Method 1 (Automatic Migration)** because:
- ✅ No CLI setup required
- ✅ Integrated with application
- ✅ Automatic error handling
- ✅ Works with Vercel deployment
- ✅ No manual steps needed

**Steps:**
1. Deployment is already live on Vercel
2. Visit: `https://team.autoprep.ai/api/db/migrate`
3. Check the response for success/error
4. Done!

## Verification

After running the migration, verify the column was created:

### Via Supabase Dashboard
1. Go to SQL Editor
2. Run:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'calendar_events' 
AND column_name = 'presales_report_content';
```
3. Should return one row with `text` data type

### Via Application
1. Navigate to a profile page
2. Generate a pre-sales report
3. Check that PDF and text downloads work
4. Verify report appears in "Generated Reports" section

### Via psql
```bash
psql postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres

\d calendar_events
# Should show presales_report_content column
```

## Troubleshooting

### Migration Fails: "Column already exists"
- This is expected if migration was already run
- The `IF NOT EXISTS` clause prevents errors
- Safe to retry

### Migration Fails: "Permission denied"
- Check database user has ALTER TABLE permissions
- Verify connection string is correct
- Check Supabase project settings

### Application Can't Connect After Migration
- Verify `POSTGRES_URL` is set in Vercel
- Check connection string format
- Restart application (push new commit to trigger redeploy)

### Column Not Visible in Dashboard
- Refresh the Supabase dashboard
- Clear browser cache
- Try again in 30 seconds

## Rollback Instructions

If you need to rollback the migration:

```sql
ALTER TABLE calendar_events DROP COLUMN IF EXISTS presales_report_content;
```

## Next Steps

1. **Run the migration** using Method 1 (recommended)
2. **Verify** the column was created
3. **Test** the new features:
   - Generate a pre-sales report
   - Download PDF and text
   - Check Generated Reports section
4. **Monitor** application logs for any errors

## Related Files

- `lib/db/index.ts` - Database connection and migrations
- `app/api/db/migrate/route.ts` - Migration endpoint
- `app/api/lindy/presales-report-status/route.ts` - Report generation
- `components/GeneratedReportsSection.tsx` - Reports display

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Check Supabase project logs
3. Review application error messages
4. Contact: scottsumerford@gmail.com

---

**Status:** ✅ Ready for deployment
**Last Updated:** October 29, 2025
**Deployment Method:** Automatic via `/api/db/migrate` endpoint
