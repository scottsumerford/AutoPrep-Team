# Deployment Instructions - Supabase Storage Integration

## Overview

This update migrates file storage from base64-encoded database storage to Supabase Storage. Files are now stored in a Supabase Storage bucket called "Files" and referenced by URL in the profiles table.

## Changes Made

### 1. New Dependencies
- Added `@supabase/supabase-js` package for Supabase Storage integration

### 2. New Files Created
- `lib/supabase.ts` - Supabase client configuration and storage utilities
- `lib/db/migrations/add_file_columns.sql` - Database migration script
- `SUPABASE_STORAGE_SETUP.md` - Comprehensive setup guide

### 3. Modified Files
- `app/api/files/upload/route.ts` - Updated to upload files to Supabase Storage
- `app/api/lindy/presales-report/route.ts` - Updated to pass file URLs to webhook
- `app/api/lindy/slides/route.ts` - Updated to pass file URLs to webhook
- `lib/db/index.ts` - Added support for new file columns in updateProfile function

### 4. Database Schema Changes
New columns added to `profiles` table:
- `company_info_file` (TEXT) - URL to company info file in Supabase Storage
- `company_info_text` (TEXT) - Company info entered as text
- `slides_file` (TEXT) - URL to slide template file in Supabase Storage

## Pre-Deployment Steps

### Step 1: Create Supabase Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** section
3. Click **New bucket**
4. Bucket name: `Files`
5. Public bucket: **Yes**
6. Click **Create bucket**

### Step 2: Configure Storage Policies

In Supabase SQL Editor, run:

```sql
-- Allow public read access to all files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'Files' );

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'Files' );

-- Allow users to update files
CREATE POLICY "Users can update files"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'Files' );

-- Allow users to delete files
CREATE POLICY "Users can delete files"
ON storage.objects FOR DELETE
USING ( bucket_id = 'Files' );
```

### Step 3: Get Supabase Anon Key

1. Go to Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **anon** **public** key
4. Save it for the next step

### Step 4: Apply Database Migration

In Supabase SQL Editor, run the migration:

```sql
-- Add file storage columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_file TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_text TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slides_file TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_company_info_file ON profiles(company_info_file);
CREATE INDEX IF NOT EXISTS idx_profiles_slides_file ON profiles(slides_file);

-- Add comments for documentation
COMMENT ON COLUMN profiles.company_info_file IS 'URL to company information file stored in Supabase Storage bucket "Files"';
COMMENT ON COLUMN profiles.company_info_text IS 'Company information entered as text by the user';
COMMENT ON COLUMN profiles.slides_file IS 'URL to slide template file stored in Supabase Storage bucket "Files"';
```

## Deployment Steps

### Step 1: Set Environment Variables in Vercel

1. Go to Vercel dashboard: https://vercel.com/scott-s-projects-53d26130/autoprep-team-subdomain-deployment/settings/environment-variables

2. Add the following environment variable:
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: [Your Supabase anon key from Step 3 above]
   - Environments: Production, Preview, Development

3. Click **Save**

### Step 2: Deploy to Production

```bash
# 1. Commit all changes
git add -A
git commit -m "feat: migrate file storage to Supabase Storage"

# 2. Push to GitHub (triggers auto-deploy)
git push origin main

# 3. Wait 1-2 minutes for Vercel deployment
# 4. Check deployment status at:
# https://vercel.com/scott-s-projects-53d26130/autoprep-team-subdomain-deployment/deployments
```

### Step 3: Verify Deployment

1. Go to https://team.autoprep.ai/profile/scott-autoprep

2. Scroll to "Upload Company Files" section

3. Test Company Information upload:
   - Click "Upload File" tab
   - Select a PDF or Word document
   - Click "Upload"
   - Verify success message appears

4. Check Supabase Storage:
   - Go to Supabase dashboard → Storage → Files bucket
   - Verify file appears in the bucket

5. Check Database:
   - Go to Supabase dashboard → Table Editor → profiles
   - Find your profile row
   - Verify `company_info_file` column contains the file URL

6. Test Slide Template upload:
   - Select a PowerPoint or PDF file
   - Click "Upload"
   - Verify success message appears
   - Check Supabase Storage and database as above

## Post-Deployment Verification

### Test Pre-sales Report Generation

1. Go to a profile with uploaded company info
2. Click "Generate Pre-Sales Report" on a calendar event
3. Check Vercel logs for webhook payload
4. Verify `company_info_file_url` or `company_info_text` is included in payload

### Test Slides Generation

1. Go to a profile with uploaded slide template
2. Click "Generate Slides" on a calendar event
3. Check Vercel logs for webhook payload
4. Verify `slides_template_url` is included in payload

## Rollback Plan

If issues occur, you can rollback:

### Option 1: Vercel Dashboard Rollback

1. Go to https://vercel.com/scott-s-projects-53d26130/autoprep-team-subdomain-deployment/deployments
2. Find the previous working deployment
3. Click three dots (...) → "Promote to Production"

### Option 2: Git Revert

```bash
git revert HEAD
git push origin main
```

## Troubleshooting

### Issue: "Supabase Storage not configured"

**Cause:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` not set in Vercel

**Solution:** Add the environment variable in Vercel dashboard and redeploy

### Issue: "Failed to upload file: new row violates row-level security policy"

**Cause:** Storage bucket policies not configured

**Solution:** Run the storage policy SQL commands in Supabase SQL Editor

### Issue: File uploads but URL not stored in database

**Cause:** Database migration not applied

**Solution:** Run the migration SQL in Supabase SQL Editor

### Issue: Webhook doesn't receive file URLs

**Cause:** Old code still deployed

**Solution:** Verify latest commit is deployed in Vercel

## Environment Variables Summary

### Production (Vercel)

```bash
# Existing variables (already configured)
POSTGRES_URL=postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres
LINDY_PRESALES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa
LINDY_SLIDES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/66bf87f2-034e-463b-a7da-83e9adbf03d4
LINDY_PRESALES_WEBHOOK_SECRET=2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07
LINDY_SLIDES_WEBHOOK_SECRET=f395b62647c72da770de97f7715ee68824864b21b9a2435bdaab7004762359c5
NEXT_PUBLIC_APP_URL=https://team.autoprep.ai
LINDY_CALLBACK_URL=https://team.autoprep.ai/api/lindy/webhook

# NEW variable to add
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Get from Supabase dashboard → Settings → API]
```

## Testing Checklist

- [ ] Supabase Storage bucket "Files" created
- [ ] Storage policies applied
- [ ] Database migration applied
- [ ] Environment variable `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel
- [ ] Code deployed to production
- [ ] Company info file upload works
- [ ] Slide template file upload works
- [ ] Files appear in Supabase Storage
- [ ] File URLs stored in database
- [ ] Pre-sales webhook includes file URLs
- [ ] Slides webhook includes file URLs

## Support

For issues or questions:
- **Email:** scottsumerford@gmail.com
- **Vercel Dashboard:** https://vercel.com/scott-s-projects-53d26130/autoprep-team-subdomain-deployment
- **Supabase Dashboard:** https://supabase.com/dashboard

---

**Deployment Date:** November 4, 2025
**Version:** 2.0.0 - Supabase Storage Integration
