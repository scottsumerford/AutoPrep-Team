# Troubleshooting File Upload Error - "Failed to upload file"

## Problem Identified
**Error Message:** "Failed to upload file: new row violates row-level security policy"

**Root Cause:** The Supabase Storage bucket "Files" has Row Level Security (RLS) policies that are blocking file uploads. The current policies don't allow the anon key to insert files into the storage bucket.

## Solution

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project (kmswrzzlirdfnzzbnrpo)
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Fix SQL
Copy and paste the following SQL into the SQL Editor and click "Run":

```sql
-- Fix Supabase Storage RLS Policies for "Files" bucket

-- First, ensure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'Files';

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;

-- Create new permissive policies
-- Policy 1: Allow anyone to read files from the Files bucket
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'Files');

-- Policy 2: Allow anyone to upload files to the Files bucket
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'Files');

-- Policy 3: Allow anyone to update files in the Files bucket
CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'Files')
WITH CHECK (bucket_id = 'Files');

-- Policy 4: Allow anyone to delete files from the Files bucket
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'Files');
```

### Step 3: Verify the Fix
After running the SQL, verify the policies are in place:

```sql
-- Check bucket configuration
SELECT * FROM storage.buckets WHERE name = 'Files';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

You should see:
- Bucket "Files" with `public = true`
- Four policies: "Allow public read access", "Allow public uploads", "Allow public updates", "Allow public deletes"

### Step 4: Test File Upload
1. Go to https://team.autoprep.ai/profile/scott-autoprep
2. Try uploading a company info file (DOCX, PDF, etc.)
3. The upload should now succeed

## Alternative: Using Supabase Dashboard UI

If you prefer using the UI instead of SQL:

### Method 1: Via Storage Policies UI
1. Go to **Storage** → **Policies** in Supabase Dashboard
2. Find the "Files" bucket
3. Click "New Policy"
4. Create these policies:
   - **Policy Name:** "Allow public uploads"
   - **Policy Definition:** `INSERT` operation
   - **Target roles:** `public`
   - **USING expression:** `bucket_id = 'Files'`
   - **WITH CHECK expression:** `bucket_id = 'Files'`

### Method 2: Disable RLS (Not Recommended for Production)
1. Go to **Storage** → **Buckets**
2. Find "Files" bucket
3. Click settings (gear icon)
4. Toggle "Enable RLS" to OFF
5. **Warning:** This makes the bucket completely public

## Security Considerations

The current fix allows **anyone** to upload, update, and delete files in the "Files" bucket. This is acceptable for:
- Internal tools
- Trusted user bases
- Development/testing environments

For production with untrusted users, consider:

### Option 1: Authenticated Users Only
```sql
-- Only allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'Files');
```

### Option 2: User-Specific Access
```sql
-- Users can only access their own files
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'Files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Option 3: Service Role Key
Instead of using the anon key, use the service role key for uploads:
1. Update `lib/supabase.ts` to use service role key for uploads
2. Keep anon key for public reads only
3. This requires backend-only uploads (no direct client uploads)

## Testing Commands

Test the upload from command line:
```bash
curl -X POST https://team.autoprep.ai/api/files/upload \
  -F "file=@test.docx" \
  -F "profileId=1" \
  -F "fileType=company_info"
```

Expected success response:
```json
{
  "success": true,
  "message": "Company info uploaded successfully",
  "filename": "test.docx",
  "size": 12345,
  "url": "https://kmswrzzlirdfnzzbnrpo.supabase.co/storage/v1/object/public/Files/..."
}
```

## Rollback Plan

If you need to revert to more restrictive policies:
```sql
-- Remove public policies
DROP POLICY "Allow public uploads" ON storage.objects;
DROP POLICY "Allow public updates" ON storage.objects;
DROP POLICY "Allow public deletes" ON storage.objects;

-- Add authenticated-only policies
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'Files');
```

## Next Steps

1. ✅ Run the SQL fix in Supabase Dashboard
2. ✅ Test file upload at https://team.autoprep.ai
3. ✅ Verify files appear in Supabase Storage
4. ✅ Test pre-sales report and slides generation
5. 📋 Consider implementing more restrictive policies for production

## Support

If you continue to experience issues:
1. Check Supabase logs: Dashboard → Logs → Storage
2. Check Vercel logs: https://vercel.com/dashboard
3. Check browser console for errors
4. Contact: scottsumerford@gmail.com
