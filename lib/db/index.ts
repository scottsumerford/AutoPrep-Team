import "./config";

// Use require to avoid TypeScript build issues with postgres library
// eslint-disable-next-line @typescript-eslint/no-require-imports
const postgres = require('postgres');

// Initialize postgres connection
const connectionString = process.env.POSTGRES_URL;
const sql = connectionString ? postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
}) : null;

// Check if database is configured
const isDatabaseConfigured = () => !!connectionString && sql !== null;
export { isDatabaseConfigured };

// Log the connection string being used (without exposing the password)
if (process.env.POSTGRES_URL) {
  const maskedUrl = process.env.POSTGRES_URL.replace(/:([^@]+)@/, ':****@');
  console.log('✅ Database connection string configured:', maskedUrl);
} else {
  console.warn('⚠️ No POSTGRES_URL found - using in-memory storage');
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  url_slug: string;
  title?: string;
  google_access_token?: string;
  google_refresh_token?: string;
  outlook_access_token?: string;
  outlook_refresh_token?: string;
  
  
  keyword_filter?: string;
  slide_template_url?: string;
  company_info_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CalendarEvent {
  id: number;
  profile_id: number;
  event_id: string;
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  attendees?: string[];
  source: 'google' | 'outlook';
  presales_report_status?: 'pending' | 'processing' | 'completed' | 'failed';
  presales_report_url?: string;
  presales_report_generated_at?: Date;
  presales_report_started_at?: Date;
  slides_status?: 'pending' | 'processing' | 'completed' | 'failed';
  slides_url?: string;
  slides_generated_at?: Date;
  slides_started_at?: Date;
  created_at: Date;
}

export interface TokenUsage {
  id: number;
  profile_id: number;
  operation_type: 'agent_run' | 'presales_report' | 'slides_generation';
  tokens_used: number;
  lindy_agent_id?: string;
  event_id?: number;
  created_at: Date;
}

export interface FileUpload {
  id: number;
  profile_id: number;
  file_type: 'slide_template' | 'company_info';
  file_name: string;
  file_url: string;
  uploaded_at: Date;
}


// In-memory storage for development (when database is not configured)
const mockProfiles: Profile[] = [];
const mockEvents: CalendarEvent[] = [];
const mockTokenUsage: TokenUsage[] = [];
let nextProfileId = 1;
let nextEventId = 1;
let nextTokenId = 1;

// Helper function to generate URL slug from name
function generateUrlSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-');      // Replace multiple hyphens with single hyphen
}

// Database helper functions
export async function getAllProfiles(): Promise<Profile[]> {
  if (!isDatabaseConfigured()) {
    console.log('📦 Database not configured, using in-memory storage');
    console.log(`📊 Current profiles in memory: ${mockProfiles.length}`);
    return mockProfiles;
  }
  
  try {
    console.log('🔍 Fetching all profiles from database...');
    const rows = await sql<Profile>`SELECT * FROM profiles ORDER BY created_at DESC`;
    console.log(`✅ Successfully fetched ${rows.length} profiles from database`);
    return rows;
  } catch (error) {
    console.error('❌ Database error fetching profiles:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    console.log('📦 Falling back to in-memory storage');
    return mockProfiles;
  }
}

export async function createProfile(data: Partial<Profile>): Promise<Profile> {
  // Generate URL slug from name
  const urlSlug = data.name ? generateUrlSlug(data.name) : '';
  
  console.log('📝 Creating new profile:', {
    name: data.name,
    email: data.email,
    url_slug: urlSlug,
  });
  
  if (!isDatabaseConfigured()) {
    console.log('📦 Database not configured, saving to in-memory storage');
    const newProfile: Profile = {
      id: nextProfileId++,
      name: data.name || '',
      email: data.email || '',
      url_slug: urlSlug,
      title: data.title,
      created_at: new Date(),
      updated_at: new Date()
    };
    mockProfiles.push(newProfile);
    console.log(`✅ Profile created in memory with ID: ${newProfile.id}`);
    console.log(`📊 Total profiles in memory: ${mockProfiles.length}`);
    return newProfile;
  }
  
  try {
    console.log('💾 Inserting profile into database...');
    const rows = await sql<Profile>`
      INSERT INTO profiles (name, email, url_slug, title)
      VALUES (${data.name}, ${data.email}, ${urlSlug}, ${data.title || ''})
      RETURNING *
    `;
    console.log('✅ Profile created successfully in database:', {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      url_slug: rows[0].url_slug
    });
    return rows[0];
  } catch (error) {
    console.error('❌ Database error creating profile:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      code: (error as Error & { code?: string }).code,
      stack: error instanceof Error ? error.stack : undefined
    });
    console.log('📦 Falling back to in-memory storage');
    const newProfile: Profile = {
      id: nextProfileId++,
      name: data.name || '',
      email: data.email || '',
      url_slug: urlSlug,
      title: data.title,
      created_at: new Date(),
      updated_at: new Date()
    };
    mockProfiles.push(newProfile);
    console.log(`✅ Profile created in memory with ID: ${newProfile.id}`);
    return newProfile;
  }
}

export async function getProfileById(id: number): Promise<Profile | null> {
  if (!isDatabaseConfigured()) {
    console.log(`🔍 Looking up profile ID ${id} in memory`);
    const profile = mockProfiles.find(p => p.id === id) || null;
    console.log(profile ? `✅ Found profile: ${profile.name}` : `❌ Profile not found`);
    return profile;
  }
  
  try {
    console.log(`🔍 Fetching profile ID ${id} from database...`);
    const rows = await sql<Profile>`SELECT * FROM profiles WHERE id = ${id}`;
    console.log(rows[0] ? `✅ Found profile: ${rows[0].name}` : `❌ Profile not found`);
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Database error, falling back to in-memory storage:', error);
    return mockProfiles.find(p => p.id === id) || null;
  }
}

export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  if (!isDatabaseConfigured()) {
    console.log(`🔍 Looking up profile slug "${slug}" in memory`);
    return mockProfiles.find(p => p.url_slug === slug) || null;
  }
  
  try {
    console.log(`🔍 Fetching profile slug "${slug}" from database...`);
    const rows = await sql<Profile>`SELECT * FROM profiles WHERE url_slug = ${slug}`;
    console.log(rows[0] ? `✅ Found profile: ${rows[0].name}` : `❌ Profile not found`);
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Database error, falling back to in-memory storage:', error);
    return mockProfiles.find(p => p.url_slug === slug) || null;
  }
}

export async function updateProfile(id: number, data: Partial<Profile>): Promise<Profile | null> {
  console.log(`📝 Updating profile ID ${id}:`, Object.keys(data));
  
  if (!isDatabaseConfigured()) {
    console.log('📦 Database not configured, updating in-memory storage');
    const index = mockProfiles.findIndex(p => p.id === id);
    if (index === -1) {
      console.log(`❌ Profile ID ${id} not found in memory`);
      return null;
    }
    mockProfiles[index] = { ...mockProfiles[index], ...data, updated_at: new Date() };
    console.log(`✅ Profile updated in memory: ${mockProfiles[index].name}`);
    return mockProfiles[index];
  }
  
  try {
    const updates: string[] = [];
    const values: (string | number | Date | null | undefined)[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.google_access_token !== undefined) {
      updates.push(`google_access_token = $${paramIndex++}`);
      values.push(data.google_access_token);
      console.log('🔑 Updating Google access token');
    }
    if (data.google_refresh_token !== undefined) {
      updates.push(`google_refresh_token = $${paramIndex++}`);
      values.push(data.google_refresh_token);
      console.log('🔑 Updating Google refresh token');
    }
    if (data.outlook_access_token !== undefined) {
      updates.push(`outlook_access_token = $${paramIndex++}`);
      values.push(data.outlook_access_token);
      console.log('🔑 Updating Outlook access token');
    }
    if (data.outlook_refresh_token !== undefined) {
      updates.push(`outlook_refresh_token = $${paramIndex++}`);
      values.push(data.outlook_refresh_token);
      console.log('🔑 Updating Outlook refresh token');
    }
    if (data.keyword_filter !== undefined) {
      updates.push(`keyword_filter = $${paramIndex++}`);
      values.push(data.keyword_filter);
      console.log(`🔍 Updating keyword filter to: ${data.keyword_filter}`);
    }
    if (data.slide_template_url !== undefined) {
      updates.push(`slide_template_url = $${paramIndex++}`);
      values.push(data.slide_template_url);
      console.log(`📊 Updating slide template URL`);
    }
    if (data.company_info_url !== undefined) {
      updates.push(`company_info_url = $${paramIndex++}`);
      values.push(data.company_info_url);
      console.log(`🏢 Updating company info URL`);
    }

    updates.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());

    values.push(id);

    const query = `
      UPDATE profiles 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    console.log('💾 Executing database update...');
    const rows = await sql.unsafe(query, values);
    console.log(`✅ Profile updated successfully in database: ${rows[0]?.name}`);
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Database error updating profile:', error);
    console.log('📦 Falling back to in-memory storage');
    const index = mockProfiles.findIndex(p => p.id === id);
    if (index === -1) return null;
    mockProfiles[index] = { ...mockProfiles[index], ...data, updated_at: new Date() };
    console.log(`✅ Profile updated in memory: ${mockProfiles[index].name}`);
    return mockProfiles[index];
  }
}

export async function deleteProfile(id: number): Promise<boolean> {
  console.log(`🗑️ Deleting profile ID ${id}`);
  
  if (!isDatabaseConfigured()) {
    console.log('📦 Database not configured, deleting from in-memory storage');
    const index = mockProfiles.findIndex(p => p.id === id);
    if (index === -1) {
      console.log(`❌ Profile ID ${id} not found in memory`);
      return false;
    }
    mockProfiles.splice(index, 1);
    console.log(`✅ Profile deleted from memory`);
    return true;
  }
  
  try {
    console.log('💾 Deleting profile from database...');
    await sql`DELETE FROM profiles WHERE id = ${id}`;
    console.log(`✅ Profile deleted successfully from database`);
    return true;
  } catch (error) {
    console.error('❌ Database error deleting profile:', error);
    console.log('📦 Falling back to in-memory storage');
    const index = mockProfiles.findIndex(p => p.id === id);
    if (index === -1) return false;
    mockProfiles.splice(index, 1);
    return true;
  }
}

// Calendar Events
export async function getCalendarEvents(profileId: number): Promise<CalendarEvent[]> {
  if (!isDatabaseConfigured()) {
    console.log(`📅 Fetching calendar events for profile ${profileId} from memory`);
    const events = mockEvents.filter(e => e.profile_id === profileId);
    console.log(`📊 Found ${events.length} events in memory`);
    return events;
  }
  
  try {
    console.log(`📅 Fetching calendar events for profile ${profileId} from database...`);
    const rows = await sql<CalendarEvent>`
      SELECT * FROM calendar_events 
      WHERE profile_id = ${profileId}
      ORDER BY start_time ASC
    `;
    console.log(`✅ Found ${rows.length} events in database`);
    return rows;
  } catch (error) {
    console.error('❌ Database error fetching calendar events:', error);
    console.log('📦 Falling back to in-memory storage');
    return mockEvents.filter(e => e.profile_id === profileId);
  }
}

export async function saveCalendarEvent(data: Omit<CalendarEvent, 'id' | 'created_at'>): Promise<CalendarEvent> {
  console.log(`📅 Saving calendar event: ${data.title}`);
  console.log(`🔍 Database configured: ${isDatabaseConfigured()}`);
  console.log(`🔍 POSTGRES_URL exists: ${!!process.env.POSTGRES_URL}`);
  
  const newEvent: CalendarEvent = {
    id: nextEventId++,
    ...data,
    created_at: new Date()
  };
  
  if (!isDatabaseConfigured()) {
    console.log('📦 Database not configured, saving to in-memory storage');
    mockEvents.push(newEvent);
    console.log(`✅ Event saved in memory with ID: ${newEvent.id}`);
    return newEvent;
  }
  
  try {
    console.log('💾 Inserting calendar event into database...');
    const rows = await sql<CalendarEvent>`
      INSERT INTO calendar_events (
        profile_id, event_id, title, description, start_time, end_time, attendees, source
      )
      VALUES (
        ${data.profile_id}, ${data.event_id}, ${data.title}, ${data.description || null},
        ${data.start_time.toISOString()}, ${data.end_time.toISOString()}, ${data.attendees || []}, ${data.source}
      )
      ON CONFLICT (profile_id, event_id) 
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time,
        attendees = EXCLUDED.attendees
      RETURNING *
    `;
    console.log(`✅ Event saved successfully in database with ID: ${rows[0].id}`);
    return rows[0];
  } catch (error) {
    console.error('❌ Database error saving calendar event:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      eventData: {
        profile_id: data.profile_id,
        event_id: data.event_id,
        title: data.title,
        source: data.source
      }
    });
    console.log('📦 Falling back to in-memory storage');
    mockEvents.push(newEvent);
    console.log(`✅ Event saved in memory with ID: ${newEvent.id}`);
    throw error; // Re-throw the error so we can see it in the API response
  }
}

// Token Usage
export async function logTokenUsage(data: Omit<TokenUsage, 'id' | 'created_at'>): Promise<TokenUsage> {
  console.log(`📊 Logging token usage: ${data.operation_type} - ${data.tokens_used} tokens`);
  
  const newUsage: TokenUsage = {
    id: nextTokenId++,
    ...data,
    created_at: new Date()
  };
  
  if (!isDatabaseConfigured()) {
    console.log('📦 Database not configured, saving to in-memory storage');
    mockTokenUsage.push(newUsage);
    console.log(`✅ Token usage logged in memory`);
    return newUsage;
  }
  
  try {
    console.log('💾 Inserting token usage into database...');
    const rows = await sql<TokenUsage>`
      INSERT INTO token_usage (
        profile_id, operation_type, tokens_used, lindy_agent_id, event_id
      )
      VALUES (
        ${data.profile_id}, ${data.operation_type}, ${data.tokens_used},
        ${data.lindy_agent_id || null}, ${data.event_id || null}
      )
      RETURNING *
    `;
    console.log(`✅ Token usage logged successfully in database`);
    return rows[0];
  } catch (error) {
    console.error('❌ Database error logging token usage:', error);
    console.log('📦 Falling back to in-memory storage');
    mockTokenUsage.push(newUsage);
    return newUsage;
  }
}

export async function getTokenUsage(profileId: number): Promise<TokenUsage[]> {
  if (!isDatabaseConfigured()) {
    console.log(`📊 Fetching token usage for profile ${profileId} from memory`);
    return mockTokenUsage.filter(t => t.profile_id === profileId);
  }
  
  try {
    console.log(`📊 Fetching token usage for profile ${profileId} from database...`);
    const result = await sql<TokenUsage>`
      SELECT * FROM token_usage 
      WHERE profile_id = ${profileId}
      ORDER BY created_at DESC
    `;
    console.log(`✅ Found ${result.length} token usage records`);
    return result;
  } catch (error) {
    console.error('❌ Database error fetching token usage:', error);
    console.log('📦 Falling back to in-memory storage');
    return mockTokenUsage.filter(t => t.profile_id === profileId);
  }
}

// Database initialization
export async function initializeDatabase(): Promise<void> {
  if (!isDatabaseConfigured()) {
    console.log('⚠️ Database not configured, skipping initialization');
    return;
  }
  
  try {
    console.log('🔧 Initializing database tables...');
    
    // Create profiles table with url_slug
    await sql`
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
        keyword_filter TEXT,
        slide_template_url TEXT,
        company_info_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Profiles table ready');
    await sql`
      await sql`
        CREATE TABLE IF NOT EXISTS calendar_events (
          id SERIAL PRIMARY KEY,
          profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
          event_id VARCHAR(255) NOT NULL,
          title VARCHAR(500) NOT NULL,
          description TEXT,
          start_time TIMESTAMP NOT NULL,
          end_time TIMESTAMP NOT NULL,
          attendees JSONB,
          source VARCHAR(50) NOT NULL,
          presales_report_status VARCHAR(50) DEFAULT 'pending',
          presales_report_url TEXT,
          presales_report_started_at TIMESTAMP,
          presales_report_generated_at TIMESTAMP,
          slides_status VARCHAR(50) DEFAULT 'pending',
          slides_url TEXT,
          slides_started_at TIMESTAMP,
          slides_generated_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(profile_id, event_id)
        )
    `;
    console.log('✅ Calendar events table ready');

    // Add missing columns to existing calendar_events tables
    try {
      await sql`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_status VARCHAR(50) DEFAULT 'pending'`;
      await sql`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_url TEXT`;
      await sql`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_started_at TIMESTAMP`;
      await sql`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS presales_report_generated_at TIMESTAMP`;
      await sql`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS slides_status VARCHAR(50) DEFAULT 'pending'`;
      await sql`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS slides_url TEXT`;
      await sql`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS slides_started_at TIMESTAMP`;
      await sql`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS slides_generated_at TIMESTAMP`;
      console.log('✅ Calendar events table columns updated');
    } catch (error) {
      console.log('ℹ️ Calendar events columns already exist or error updating:', error instanceof Error ? error.message : 'Unknown error');
    }

    
    // Create token_usage table
    await sql`
      CREATE TABLE IF NOT EXISTS token_usage (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
        operation_type VARCHAR(100) NOT NULL,
        tokens_used INTEGER NOT NULL,
        lindy_agent_id VARCHAR(255),
        event_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Token usage table ready');
    
    // Create file_uploads table
    await sql`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
        file_type VARCHAR(50) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ File uploads table ready');
    
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      code: (error as Error & { code?: string }).code,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

// Get total tokens by type for a profile
export async function getTotalTokensByType(profileId: number): Promise<{
  agent_run: number;
  presales_report: number;
  slides_generation: number;
  total: number;
}> {
  if (!isDatabaseConfigured()) {
    console.log(`📊 Calculating token totals for profile ${profileId} from memory`);
    const profileUsage = mockTokenUsage.filter(t => t.profile_id === profileId);
    return {
      agent_run: profileUsage.filter(t => t.operation_type === 'agent_run').reduce((sum, t) => sum + t.tokens_used, 0),
      presales_report: profileUsage.filter(t => t.operation_type === 'presales_report').reduce((sum, t) => sum + t.tokens_used, 0),
      slides_generation: profileUsage.filter(t => t.operation_type === 'slides_generation').reduce((sum, t) => sum + t.tokens_used, 0),
      total: profileUsage.reduce((sum, t) => sum + t.tokens_used, 0)
    };
  }
  
  try {
    console.log(`📊 Calculating token totals for profile ${profileId} from database...`);
    const rows = await sql`
      SELECT 
        operation_type,
        SUM(tokens_used) as total
      FROM token_usage
      WHERE profile_id = ${profileId}
      GROUP BY operation_type
    `;
    
    const stats = {
      agent_run: 0,
      presales_report: 0,
      slides_generation: 0,
      total: 0
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows.forEach((row: any) => {
      stats[row.operation_type as keyof typeof stats] = parseInt(row.total);
      stats.total += parseInt(row.total);
    });
    
    console.log(`✅ Token totals calculated: ${stats.total} total tokens`);
    return stats;
  } catch (error) {
    console.error('❌ Database error calculating token totals:', error);
    console.log('📦 Falling back to in-memory storage');
    const profileUsage = mockTokenUsage.filter(t => t.profile_id === profileId);
    return {
      agent_run: profileUsage.filter(t => t.operation_type === 'agent_run').reduce((sum, t) => sum + t.tokens_used, 0),
      presales_report: profileUsage.filter(t => t.operation_type === 'presales_report').reduce((sum, t) => sum + t.tokens_used, 0),
      slides_generation: profileUsage.filter(t => t.operation_type === 'slides_generation').reduce((sum, t) => sum + t.tokens_used, 0),
      total: profileUsage.reduce((sum, t) => sum + t.tokens_used, 0)
    };
  }
}
// Database connection with updated password

// Update event presales report status
export async function updateEventPresalesStatus(
  eventId: number,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  reportUrl?: string
): Promise<CalendarEvent | null> {
  if (!isDatabaseConfigured()) {
    console.log(`📝 Updating presales status for event ${eventId} in memory`);
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) return null;
    event.presales_report_status = status;
    if (reportUrl) event.presales_report_url = reportUrl;
    if (status === 'completed') event.presales_report_generated_at = new Date();
    if (status === 'processing') event.presales_report_started_at = new Date();
    return event;
  }
  
  try {
    console.log(`📝 Updating presales status for event ${eventId} to ${status}`);
    const rows = await sql<CalendarEvent>`
      UPDATE calendar_events 
      SET 
        presales_report_status = ${status},
        presales_report_url = ${reportUrl || null},
        presales_report_started_at = ${status === 'processing' ? new Date() : null},
        presales_report_generated_at = ${status === 'completed' ? new Date() : null}
      WHERE id = ${eventId}
      RETURNING *
    `;
    console.log(`✅ Presales status updated successfully`);
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Database error updating presales status:', error);
    return null;
  }
}

// Update event slides status
export async function updateEventSlidesStatus(
  eventId: number,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  slidesUrl?: string
): Promise<CalendarEvent | null> {
  if (!isDatabaseConfigured()) {
    console.log(`📝 Updating slides status for event ${eventId} in memory`);
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) return null;
    event.slides_status = status;
    if (slidesUrl) event.slides_url = slidesUrl;
    if (status === 'completed') event.slides_generated_at = new Date();
    if (status === 'processing') event.slides_started_at = new Date();
    return event;
  }
  
  try {
    console.log(`📝 Updating slides status for event ${eventId} to ${status}`);
    const rows = await sql<CalendarEvent>`
      UPDATE calendar_events 
      SET 
        slides_status = ${status},
        slides_url = ${slidesUrl || null},
        slides_started_at = ${status === 'processing' ? new Date() : null},
        slides_generated_at = ${status === 'completed' ? new Date() : null}
      WHERE id = ${eventId}
      RETURNING *
    `;
    console.log(`✅ Slides status updated successfully`);
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Database error updating slides status:', error);
    return null;
  }
}

// Get event by ID
export async function getEventById(eventId: number): Promise<CalendarEvent | null> {
  if (!isDatabaseConfigured()) {
    console.log(`🔍 Looking up event ID ${eventId} in memory`);
    return mockEvents.find(e => e.id === eventId) || null;
  }
  
  try {
    console.log(`🔍 Fetching event ID ${eventId} from database...`);
    const rows = await sql<CalendarEvent>`SELECT * FROM calendar_events WHERE id = ${eventId}`;
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Database error fetching event:', error);
    return mockEvents.find(e => e.id === eventId) || null;
  }
}

// Mark stale presales report runs as failed (if processing > 15 minutes)
export async function markStalePresalesRuns(): Promise<number> {
  if (!isDatabaseConfigured()) {
    console.log('⏱️ Checking for stale presales runs in memory');
    let count = 0;
    const now = new Date();
    mockEvents.forEach(event => {
      if (
        event.presales_report_status === 'processing' &&
        !event.presales_report_url &&
        event.created_at &&
        (now.getTime() - event.created_at.getTime()) > 15 * 60 * 1000
      ) {
        event.presales_report_status = 'failed';
        count++;
      }
    });
    if (count > 0) console.log(`⏱️ Marked ${count} stale presales runs as failed`);
    return count;
  }

  try {
    console.log('⏱️ Checking for stale presales report runs (> 15 minutes)...');
    const result = await sql`
      UPDATE calendar_events
      SET presales_report_status = 'failed'
      WHERE presales_report_status = 'processing'
        AND presales_report_url IS NULL
        AND created_at < NOW() - INTERVAL '15 minutes'
      RETURNING id
    `;
    const count = result.length;
    if (count > 0) console.log(`⏱️ Marked ${count} stale presales runs as failed`);
    return count;
  } catch (error) {
    console.error('❌ Database error marking stale presales runs:', error);
    return 0;
  }
}

// Mark stale slides runs as failed (if processing > 15 minutes)
export async function markStaleSlidesRuns(): Promise<number> {
  if (!isDatabaseConfigured()) {
    console.log('⏱️ Checking for stale slides runs in memory');
    let count = 0;
    const now = new Date();
    mockEvents.forEach(event => {
      if (
        event.slides_status === 'processing' &&
        !event.slides_url &&
        event.created_at &&
        (now.getTime() - event.created_at.getTime()) > 15 * 60 * 1000
      ) {
        event.slides_status = 'failed';
        count++;
      }
    });
    if (count > 0) console.log(`⏱️ Marked ${count} stale slides runs as failed`);
    return count;
  }

  try {
    console.log('⏱️ Checking for stale slides runs (> 15 minutes)...');
    const result = await sql`
      UPDATE calendar_events
      SET slides_status = 'failed'
      WHERE slides_status = 'processing'
        AND slides_url IS NULL
        AND created_at < NOW() - INTERVAL '15 minutes'
      RETURNING id
    `;
    const count = result.length;
    if (count > 0) console.log(`⏱️ Marked ${count} stale slides runs as failed`);
    return count;
  } catch (error) {
    console.error('❌ Database error marking stale slides runs:', error);
    return 0;
  }
}

// Delete calendar events that no longer exist in the remote calendar
export async function deleteRemovedCalendarEvents(
  profileId: number,
  source: 'google' | 'outlook',
  remoteEventIds: string[]
): Promise<number> {
  if (!isDatabaseConfigured()) {
    console.log(`🗑️ Deleting removed ${source} events for profile ${profileId} in memory`);
    const remoteSet = new Set(remoteEventIds);
    const beforeCount = mockEvents.length;
    const filtered = mockEvents.filter(e => 
      !(e.profile_id === profileId && e.source === source && !remoteSet.has(e.event_id))
    );
    const deletedCount = beforeCount - filtered.length;
    if (deletedCount > 0) {
      mockEvents.length = 0;
      mockEvents.push(...filtered);
      console.log(`🗑️ Deleted ${deletedCount} removed events`);
    }
    return deletedCount;
  }

  try {
    console.log(`🗑️ Deleting removed ${source} events for profile ${profileId}...`);
    
    // Build the list of remote event IDs to keep
    const remoteEventIdList = remoteEventIds.map(id => `'${id}'`).join(',');
    
    if (remoteEventIds.length === 0) {
      // If no remote events, delete all local events for this profile/source
      const result = await sql`
        DELETE FROM calendar_events
        WHERE profile_id = ${profileId}
          AND source = ${source}
        RETURNING id
      `;
      const count = result.length;
      if (count > 0) console.log(`🗑️ Deleted ${count} removed events (all events removed from remote)`);
      return count;
    }
    
    // Delete events that exist locally but not in remote
    const result = await sql.unsafe(`
      DELETE FROM calendar_events
      WHERE profile_id = ${profileId}
        AND source = '${source}'
        AND event_id NOT IN (${remoteEventIdList})
      RETURNING id
    `);
    const count = result.length;
    if (count > 0) console.log(`🗑️ Deleted ${count} removed events`);
    return count;
  } catch (error) {
    console.error('❌ Database error deleting removed events:', error);
    return 0;
  }
}
