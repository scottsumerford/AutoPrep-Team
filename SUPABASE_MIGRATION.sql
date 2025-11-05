-- Storage policies for Files bucket
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'Files');

CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'Files');

CREATE POLICY "Users can update files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'Files');

CREATE POLICY "Users can delete files" ON storage.objects 
FOR DELETE USING (bucket_id = 'Files');

-- Database migration - add new columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_file TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_text TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slides_file TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_company_info_file ON profiles(company_info_file);
CREATE INDEX IF NOT EXISTS idx_profiles_slides_file ON profiles(slides_file);

-- Add comments
COMMENT ON COLUMN profiles.company_info_file IS 'URL to company info file in Supabase Storage';
COMMENT ON COLUMN profiles.company_info_text IS 'Text-based company information';
COMMENT ON COLUMN profiles.slides_file IS 'URL to slide template file in Supabase Storage';
