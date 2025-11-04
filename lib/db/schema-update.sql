-- Add columns to profiles table for storing files directly
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_file TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_text TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slides_file TEXT;

-- Add columns to calendar_events table for storing webhook responses
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_content TEXT;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS slides_content TEXT;

-- Add comments
COMMENT ON COLUMN profiles.company_info_file IS 'Base64 encoded company information file';
COMMENT ON COLUMN profiles.company_info_text IS 'Text description of company (alternative to file upload)';
COMMENT ON COLUMN profiles.slides_file IS 'Base64 encoded slide template file';
COMMENT ON COLUMN calendar_events.presales_report_content IS 'Pre-sales report content from webhook response';
COMMENT ON COLUMN calendar_events.slides_content IS 'Slides content from webhook response';
