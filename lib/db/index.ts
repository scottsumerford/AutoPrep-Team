import "./config";
import { sql } from '@vercel/postgres';

// Log the connection string being used (without exposing the password)
const connectionString = process.env.POSTGRES_URL;
if (connectionString) {
  const maskedUrl = connectionString.replace(/:([^@]+)@/, ':****@');
  console.log('Database connection string:', maskedUrl);
} else {
  console.error('No POSTGRES_URL found!');
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  url_slug: string;  // Added: URL-friendly version of name (e.g., "john-doe")
  title?: string;
  google_access_token?: string;
  google_refresh_token?: string;
  outlook_access_token?: string;
  outlook_refresh_token?: string;
  operation_mode: 'auto-sync' | 'manual';
  manual_email?: string;
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

const isDatabaseConfigured = () => {
  const hasUrl = !!(process.env.POSTGRES_URL || process.env.autoprep_POSTGRES_URL);
  console.log('Database configured:', hasUrl);
  return hasUrl;
};

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
    console.log('Database not configured, using mock data');
    return mockProfiles;
  }
  
  try {
    console.log('Fetching all profiles from database...');
    const { rows } = await sql<Profile>`SELECT * FROM profiles ORDER BY created_at DESC`;
    console.log(`Successfully fetched ${rows.length} profiles from database`);
    return rows;
  } catch (error) {
    console.error('Database error fetching profiles:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    console.log('Falling back to mock data');
    return mockProfiles;
  }
}

export async function createProfile(data: Partial<Profile>): Promise<Profile> {
  // Generate URL slug from name
  const urlSlug = data.name ? generateUrlSlug(data.name) : '';
  
  const newProfile: Profile = {
    id: nextProfileId++,
    name: data.name || '',
    email: data.email || '',
    url_slug: urlSlug,
    title: data.title,
    operation_mode: data.operation_mode || 'auto-sync',
    created_at: new Date(),
    updated_at: new Date()
  };
  
  if (!isDatabaseConfigured()) {
    console.log('Database not configured, saving to mock data');
    mockProfiles.push(newProfile);
    return newProfile;
  }
  
  try {
    console.log('Creating profile in database:', { name: data.name, email: data.email, url_slug: urlSlug });
    const { rows } = await sql<Profile>`
      INSERT INTO profiles (name, email, url_slug, title, operation_mode)
      VALUES (${data.name}, ${data.email}, ${urlSlug}, ${data.title || ''}, ${data.operation_mode || 'auto-sync'})
      RETURNING *
    `;
    console.log('Profile created successfully in database:', rows[0]);
    return rows[0];
  } catch (error) {
    console.error('Database error creating profile:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      code: (error as any).code,
      stack: error instanceof Error ? error.stack : undefined
    });
    console.log('Falling back to mock data');
    mockProfiles.push(newProfile);
    return newProfile;
  }
}

export async function getProfileById(id: number): Promise<Profile | null> {
  if (!isDatabaseConfigured()) {
    return mockProfiles.find(p => p.id === id) || null;
  }
  
  try {
    const { rows } = await sql<Profile>`SELECT * FROM profiles WHERE id = ${id}`;
    return rows[0] || null;
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    return mockProfiles.find(p => p.id === id) || null;
  }
}

export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  if (!isDatabaseConfigured()) {
    return mockProfiles.find(p => p.url_slug === slug) || null;
  }
  
  try {
    const { rows } = await sql<Profile>`SELECT * FROM profiles WHERE url_slug = ${slug}`;
    return rows[0] || null;
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    return mockProfiles.find(p => p.url_slug === slug) || null;
  }
}

export async function updateProfile(id: number, data: Partial<Profile>): Promise<Profile | null> {
  if (!isDatabaseConfigured()) {
    const index = mockProfiles.findIndex(p => p.id === id);
    if (index === -1) return null;
    mockProfiles[index] = { ...mockProfiles[index], ...data, updated_at: new Date() };
    return mockProfiles[index];
  }
  
  try {
    const updates: string[] = [];
    const values: any[] = [];
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
    }
    if (data.google_refresh_token !== undefined) {
      updates.push(`google_refresh_token = $${paramIndex++}`);
      values.push(data.google_refresh_token);
    }
    if (data.outlook_access_token !== undefined) {
      updates.push(`outlook_access_token = $${paramIndex++}`);
      values.push(data.outlook_access_token);
    }
    if (data.outlook_refresh_token !== undefined) {
      updates.push(`outlook_refresh_token = $${paramIndex++}`);
      values.push(data.outlook_refresh_token);
    }
    if (data.operation_mode !== undefined) {
      updates.push(`operation_mode = $${paramIndex++}`);
      values.push(data.operation_mode);
    }
    if (data.manual_email !== undefined) {
      updates.push(`manual_email = $${paramIndex++}`);
      values.push(data.manual_email);
    }
    if (data.keyword_filter !== undefined) {
      updates.push(`keyword_filter = $${paramIndex++}`);
      values.push(data.keyword_filter);
    }
    if (data.slide_template_url !== undefined) {
      updates.push(`slide_template_url = $${paramIndex++}`);
      values.push(data.slide_template_url);
    }
    if (data.company_info_url !== undefined) {
      updates.push(`company_info_url = $${paramIndex++}`);
      values.push(data.company_info_url);
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

    const { rows } = await sql.query(query, values);
    return rows[0] || null;
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    const index = mockProfiles.findIndex(p => p.id === id);
    if (index === -1) return null;
    mockProfiles[index] = { ...mockProfiles[index], ...data, updated_at: new Date() };
    return mockProfiles[index];
  }
}

export async function deleteProfile(id: number): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    const index = mockProfiles.findIndex(p => p.id === id);
    if (index === -1) return false;
    mockProfiles.splice(index, 1);
    return true;
  }
  
  try {
    await sql`DELETE FROM profiles WHERE id = ${id}`;
    return true;
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    const index = mockProfiles.findIndex(p => p.id === id);
    if (index === -1) return false;
    mockProfiles.splice(index, 1);
    return true;
  }
}

// Calendar Events
export async function getCalendarEvents(profileId: number): Promise<CalendarEvent[]> {
  if (!isDatabaseConfigured()) {
    return mockEvents.filter(e => e.profile_id === profileId);
  }
  
  try {
    const { rows } = await sql<CalendarEvent>`
      SELECT * FROM calendar_events 
      WHERE profile_id = ${profileId}
      ORDER BY start_time ASC
    `;
    return rows;
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    return mockEvents.filter(e => e.profile_id === profileId);
  }
}

export async function saveCalendarEvent(data: Omit<CalendarEvent, 'id' | 'created_at'>): Promise<CalendarEvent> {
  const newEvent: CalendarEvent = {
    id: nextEventId++,
    ...data,
    created_at: new Date()
  };
  
  if (!isDatabaseConfigured()) {
    mockEvents.push(newEvent);
    return newEvent;
  }
  
  try {
    const { rows } = await sql<CalendarEvent>`
      INSERT INTO calendar_events (
        profile_id, event_id, title, description, start_time, end_time, attendees, source
      )
      VALUES (
        ${data.profile_id}, ${data.event_id}, ${data.title}, ${data.description || null},
        ${data.start_time}, ${data.end_time}, ${JSON.stringify(data.attendees || [])}, ${data.source}
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
    return rows[0];
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    mockEvents.push(newEvent);
    return newEvent;
  }
}

// Token Usage
export async function logTokenUsage(data: Omit<TokenUsage, 'id' | 'created_at'>): Promise<TokenUsage> {
  const newUsage: TokenUsage = {
    id: nextTokenId++,
    ...data,
    created_at: new Date()
  };
  
  if (!isDatabaseConfigured()) {
    mockTokenUsage.push(newUsage);
    return newUsage;
  }
  
  try {
    const { rows } = await sql<TokenUsage>`
      INSERT INTO token_usage (
        profile_id, operation_type, tokens_used, lindy_agent_id, event_id
      )
      VALUES (
        ${data.profile_id}, ${data.operation_type}, ${data.tokens_used},
        ${data.lindy_agent_id || null}, ${data.event_id || null}
      )
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    mockTokenUsage.push(newUsage);
    return newUsage;
  }
}

export async function getTokenUsage(profileId: number): Promise<TokenUsage[]> {
  if (!isDatabaseConfigured()) {
    return mockTokenUsage.filter(t => t.profile_id === profileId);
  }
  
  try {
    const { rows } = await sql<TokenUsage>`
      SELECT * FROM token_usage 
      WHERE profile_id = ${profileId}
      ORDER BY created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    return mockTokenUsage.filter(t => t.profile_id === profileId);
  }
}

// Database initialization
export async function initializeDatabase(): Promise<void> {
  if (!isDatabaseConfigured()) {
    console.log('Database not configured, skipping initialization');
    return;
  }
  
  try {
    console.log('Initializing database tables...');
    
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
        operation_mode VARCHAR(50) DEFAULT 'auto-sync',
        manual_email VARCHAR(255),
        keyword_filter TEXT,
        slide_template_url TEXT,
        company_info_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create calendar_events table
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(profile_id, event_id)
      )
    `;
    
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
    
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      code: (error as any).code,
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
    const profileUsage = mockTokenUsage.filter(t => t.profile_id === profileId);
    return {
      agent_run: profileUsage.filter(t => t.operation_type === 'agent_run').reduce((sum, t) => sum + t.tokens_used, 0),
      presales_report: profileUsage.filter(t => t.operation_type === 'presales_report').reduce((sum, t) => sum + t.tokens_used, 0),
      slides_generation: profileUsage.filter(t => t.operation_type === 'slides_generation').reduce((sum, t) => sum + t.tokens_used, 0),
      total: profileUsage.reduce((sum, t) => sum + t.tokens_used, 0)
    };
  }
  
  try {
    const { rows } = await sql`
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
    
    rows.forEach((row: any) => {
      stats[row.operation_type as keyof typeof stats] = parseInt(row.total);
      stats.total += parseInt(row.total);
    });
    
    return stats;
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    const profileUsage = mockTokenUsage.filter(t => t.profile_id === profileId);
    return {
      agent_run: profileUsage.filter(t => t.operation_type === 'agent_run').reduce((sum, t) => sum + t.tokens_used, 0),
      presales_report: profileUsage.filter(t => t.operation_type === 'presales_report').reduce((sum, t) => sum + t.tokens_used, 0),
      slides_generation: profileUsage.filter(t => t.operation_type === 'slides_generation').reduce((sum, t) => sum + t.tokens_used, 0),
      total: profileUsage.reduce((sum, t) => sum + t.tokens_used, 0)
    };
  }
}
