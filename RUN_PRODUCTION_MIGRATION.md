# Production Database Migration

## Current Status
✅ Code pushed to GitHub (commits 0c8b225 and af9d1ba)
✅ Vercel should have auto-deployed
✅ Supabase database is configured in Vercel environment

## Required Action: Run Database Migration

To apply the new `presales_report_content` column to the production database, you need to:

### Option 1: Automatic Migration (Recommended)
1. Visit: `https://team.autoprep.ai/api/db/migrate`
2. This will automatically run the migration and create the new column

### Option 2: Manual Migration via Supabase
1. Go to https://supabase.com/dashboard
2. Select your AutoPrep project
3. Go to SQL Editor
4. Run this query:
```sql
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_content TEXT;
```

## Verification
After running the migration, verify the column exists:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'calendar_events' AND column_name = 'presales_report_content';
```

## What's New in Production
1. ✅ Profile page reorganized (Profile Overview left, Calendar right)
2. ✅ File Upload section moved to Profile Overview
3. ✅ Generated Reports section added
4. ✅ PDF generation for pre-sales reports
5. ✅ New database column for report content

## Next Steps
1. Run the migration at `/api/db/migrate`
2. Test the new features on https://team.autoprep.ai
3. Generate a pre-sales report to verify PDF generation works
