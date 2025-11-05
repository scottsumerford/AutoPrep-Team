-- Add file storage columns to profiles table
-- These columns store URLs to files in Supabase Storage

-- Company info file URL (stored in Supabase Storage bucket 'Files')
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_file TEXT;

-- Company info text (entered directly by user)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_text TEXT;

-- Slides template file URL (stored in Supabase Storage bucket 'Files')
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slides_file TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_company_info_file ON profiles(company_info_file);
CREATE INDEX IF NOT EXISTS idx_profiles_slides_file ON profiles(slides_file);

-- Add comments for documentation
COMMENT ON COLUMN profiles.company_info_file IS 'URL to company information file stored in Supabase Storage bucket "Files"';
COMMENT ON COLUMN profiles.company_info_text IS 'Company information entered as text by the user';
COMMENT ON COLUMN profiles.slides_file IS 'URL to slide template file stored in Supabase Storage bucket "Files"';
