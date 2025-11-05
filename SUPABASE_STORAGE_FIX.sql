-- Fix Supabase Storage RLS Policies for "Files" bucket
-- Run this in your Supabase SQL Editor

-- First, check if the bucket exists and is public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'Files';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Create new policies that allow uploads
-- Policy 1: Allow anyone to read files from the Files bucket
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'Files');

-- Policy 2: Allow anyone to upload files to the Files bucket (for now)
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
SELECT * FROM pg_policies WHERE tablename = 'objects';
