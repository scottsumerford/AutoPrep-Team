-- AutoPrep Team Database Schema
-- This schema is automatically created by the initializeDatabase() function
-- but can also be run manually if needed

-- Users/Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  url_slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255),
  google_access_token TEXT,
  google_refresh_token TEXT,
  outlook_access_token TEXT,
  outlook_refresh_token TEXT,
  operation_mode VARCHAR(50) DEFAULT 'auto-sync', -- 'auto-sync' or 'manual'
  manual_email VARCHAR(255),
  keyword_filter TEXT,
  slide_template_url TEXT,
  company_info_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  event_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  attendees JSONB, -- JSON array of email addresses
  source VARCHAR(50) NOT NULL, -- 'google' or 'outlook'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, event_id)
);

-- Token Usage Tracking Table
CREATE TABLE IF NOT EXISTS token_usage (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  operation_type VARCHAR(100) NOT NULL, -- 'agent_run', 'presales_report', 'slides_generation'
  tokens_used INTEGER NOT NULL,
  lindy_agent_id VARCHAR(255),
  event_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File Uploads Table
CREATE TABLE IF NOT EXISTS file_uploads (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  file_type VARCHAR(50) NOT NULL, -- 'slide_template' or 'company_info'
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_profile ON calendar_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_token_usage_profile ON token_usage(profile_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_operation ON token_usage(operation_type);
CREATE INDEX IF NOT EXISTS idx_file_uploads_profile ON file_uploads(profile_id);

-- Comments for documentation
COMMENT ON TABLE profiles IS 'User profiles with OAuth tokens and settings';
COMMENT ON TABLE calendar_events IS 'Synced calendar events from Google/Outlook';
COMMENT ON TABLE token_usage IS 'Track Lindy AI token consumption by operation';
COMMENT ON TABLE file_uploads IS 'Uploaded templates and company information';

COMMENT ON COLUMN profiles.url_slug IS 'URL-friendly version of name (e.g., "john-doe")';
COMMENT ON COLUMN profiles.operation_mode IS 'auto-sync: pull from calendar, manual: enter email manually';
COMMENT ON COLUMN calendar_events.attendees IS 'JSON array of attendee email addresses';
COMMENT ON COLUMN token_usage.operation_type IS 'Type of operation: agent_run, presales_report, or slides_generation';
