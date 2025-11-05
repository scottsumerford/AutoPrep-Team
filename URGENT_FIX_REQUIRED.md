# 🚨 URGENT: File Upload Fix Required

## Issue Summary
**Status:** ❌ File uploads are currently failing in production
**Error:** "Failed to upload file: new row violates row-level security policy"
**Cause:** Supabase Storage RLS policies are blocking uploads

## Quick Fix (5 minutes)

### 1. Go to Supabase Dashboard
https://supabase.com/dashboard → Select project → SQL Editor

### 2. Run This SQL
```sql
-- Fix Storage Policies
UPDATE storage.buckets SET public = true WHERE name = 'Files';

DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;

CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'Files');
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'Files');
CREATE POLICY "Allow public updates" ON storage.objects FOR UPDATE USING (bucket_id = 'Files') WITH CHECK (bucket_id = 'Files');
CREATE POLICY "Allow public deletes" ON storage.objects FOR DELETE USING (bucket_id = 'Files');
```

### 3. Test Upload
Go to https://team.autoprep.ai/profile/scott-autoprep and upload a file.

## What Happened?
During the initial Supabase Storage setup, the RLS policies were configured to only allow authenticated users to upload files. However, our application uses the anon key for uploads, which requires public upload permissions.

## Files to Reference
- **Full Guide:** `TROUBLESHOOTING_UPLOAD_ERROR.md`
- **SQL Script:** `SUPABASE_STORAGE_FIX.sql`

## After Fix
Once the SQL is run, file uploads will work immediately. No code changes or redeployment needed.

---
**Created:** November 4, 2025, 7:10 PM CST
**Priority:** HIGH - Blocks file upload functionality
