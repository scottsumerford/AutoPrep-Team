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

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Verify bucket configuration
SELECT id, name, public FROM storage.buckets WHERE name = 'Files';
