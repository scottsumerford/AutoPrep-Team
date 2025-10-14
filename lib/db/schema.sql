-- AutoPrep Team Database Schema

-- Users/Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255),
  google_access_token TEXT,
  google_refresh_token TEXT,
  outlook_access_token TEXT,
  outlook_refresh_token TEXT,
  operation_mode VARCHAR(50) DEFAULT 'auto-sync', -- 'auto-sync' or 'manual'
  manual_email VARCHAR(255),
  keyword_filter VARCHAR(255),
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
  title VARCHAR(500),
  description TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  attendees TEXT[], -- Array of email addresses
  source VARCHAR(50), -- 'google' or 'outlook'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Token Usage Tracking Table
CREATE TABLE IF NOT EXISTS token_usage (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  operation_type VARCHAR(100), -- 'agent_run', 'presales_report', 'slides_generation'
  tokens_used INTEGER,
  lindy_agent_id VARCHAR(255),
  event_id INTEGER REFERENCES calendar_events(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File Uploads Table
CREATE TABLE IF NOT EXISTS file_uploads (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  file_type VARCHAR(50), -- 'slide_template' or 'company_info'
  file_name VARCHAR(255),
  file_url TEXT,
  google_drive_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_profile ON calendar_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_profile ON token_usage(profile_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_profile ON file_uploads(profile_id);
