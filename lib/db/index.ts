import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

export interface Profile {
  id: number;
  name: string;
  email: string;
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

// Check if database is configured
const isDatabaseConfigured = () => {
  return !!process.env.POSTGRES_URL;
};

// In-memory storage for development (when database is not configured)
const mockProfiles: Profile[] = [];
const mockEvents: CalendarEvent[] = [];
const mockTokenUsage: TokenUsage[] = [];
let nextProfileId = 1;
let nextEventId = 1;
let nextTokenId = 1;

// Database helper functions
export async function getAllProfiles(): Promise<Profile[]> {
  if (!isDatabaseConfigured()) {
    return mockProfiles;
  }
  
  try {
    const { rows } = await sql<Profile>`SELECT * FROM profiles ORDER BY created_at DESC`;
    return rows;
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    return mockProfiles;
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

export async function createProfile(data: Partial<Profile>): Promise<Profile> {
  const newProfile: Profile = {
    id: nextProfileId++,
    name: data.name || '',
    email: data.email || '',
    title: data.title,
    operation_mode: data.operation_mode || 'auto-sync',
    created_at: new Date(),
    updated_at: new Date()
  };
  
  if (!isDatabaseConfigured()) {
    mockProfiles.push(newProfile);
    return newProfile;
  }
  
  try {
    const { rows } = await sql<Profile>`
      INSERT INTO profiles (name, email, title, operation_mode)
      VALUES (${data.name}, ${data.email}, ${data.title || ''}, ${data.operation_mode || 'auto-sync'})
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    mockProfiles.push(newProfile);
    return newProfile;
  }
}

export async function updateProfile(id: number, data: Partial<Profile>): Promise<Profile> {
  if (!isDatabaseConfigured()) {
    const index = mockProfiles.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProfiles[index] = { ...mockProfiles[index], ...data, updated_at: new Date() };
      return mockProfiles[index];
    }
    throw new Error('Profile not found');
  }
  
  try {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `UPDATE profiles SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    values.push(id);

    const { rows } = await sql.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    const index = mockProfiles.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProfiles[index] = { ...mockProfiles[index], ...data, updated_at: new Date() };
      return mockProfiles[index];
    }
    throw error;
  }
}

export async function getCalendarEvents(profileId: number, keywordFilter?: string): Promise<CalendarEvent[]> {
  if (!isDatabaseConfigured()) {
    let events = mockEvents.filter(e => e.profile_id === profileId);
    if (keywordFilter) {
      events = events.filter(e => e.title.toLowerCase().includes(keywordFilter.toLowerCase()));
    }
    return events;
  }
  
  try {
    if (keywordFilter) {
      const { rows } = await sql<CalendarEvent>`
        SELECT * FROM calendar_events 
        WHERE profile_id = ${profileId} 
        AND title ILIKE ${`%${keywordFilter}%`}
        ORDER BY start_time DESC
      `;
      return rows;
    }
    
    const { rows } = await sql<CalendarEvent>`
      SELECT * FROM calendar_events 
      WHERE profile_id = ${profileId}
      ORDER BY start_time DESC
    `;
    return rows;
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    let events = mockEvents.filter(e => e.profile_id === profileId);
    if (keywordFilter) {
      events = events.filter(e => e.title.toLowerCase().includes(keywordFilter.toLowerCase()));
    }
    return events;
  }
}

export async function saveCalendarEvent(data: Partial<CalendarEvent>): Promise<CalendarEvent> {
  const newEvent: CalendarEvent = {
    id: nextEventId++,
    profile_id: data.profile_id!,
    event_id: data.event_id!,
    title: data.title || '',
    description: data.description,
    start_time: data.start_time!,
    end_time: data.end_time!,
    attendees: data.attendees,
    source: data.source!,
    created_at: new Date()
  };
  
  if (!isDatabaseConfigured()) {
    const existingIndex = mockEvents.findIndex(e => e.event_id === data.event_id);
    if (existingIndex !== -1) {
      mockEvents[existingIndex] = { ...mockEvents[existingIndex], ...newEvent };
      return mockEvents[existingIndex];
    }
    mockEvents.push(newEvent);
    return newEvent;
  }
  
  try {
    // Convert Date objects to ISO strings for database storage
    const startTime = data.start_time instanceof Date ? data.start_time.toISOString() : data.start_time;
    const endTime = data.end_time instanceof Date ? data.end_time.toISOString() : data.end_time;
    
    const { rows } = await sql<CalendarEvent>`
      INSERT INTO calendar_events (profile_id, event_id, title, description, start_time, end_time, attendees, source)
      VALUES (${data.profile_id}, ${data.event_id}, ${data.title}, ${data.description || ''}, 
              ${startTime}, ${endTime}, ${JSON.stringify(data.attendees || [])}, ${data.source})
      ON CONFLICT (event_id) DO UPDATE SET
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
    const existingIndex = mockEvents.findIndex(e => e.event_id === data.event_id);
    if (existingIndex !== -1) {
      mockEvents[existingIndex] = { ...mockEvents[existingIndex], ...newEvent };
      return mockEvents[existingIndex];
    }
    mockEvents.push(newEvent);
    return newEvent;
  }
}

export async function trackTokenUsage(data: {
  profile_id: number;
  operation_type: 'agent_run' | 'presales_report' | 'slides_generation';
  tokens_used: number;
  lindy_agent_id?: string;
  event_id?: number;
}): Promise<TokenUsage> {
  const newUsage: TokenUsage = {
    id: nextTokenId++,
    profile_id: data.profile_id,
    operation_type: data.operation_type,
    tokens_used: data.tokens_used,
    lindy_agent_id: data.lindy_agent_id,
    event_id: data.event_id,
    created_at: new Date()
  };
  
  if (!isDatabaseConfigured()) {
    mockTokenUsage.push(newUsage);
    return newUsage;
  }
  
  try {
    const { rows } = await sql<TokenUsage>`
      INSERT INTO token_usage (profile_id, operation_type, tokens_used, lindy_agent_id, event_id)
      VALUES (${data.profile_id}, ${data.operation_type}, ${data.tokens_used}, 
              ${data.lindy_agent_id || null}, ${data.event_id || null})
      RETURNING *
    `;
    return rows[0];
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    mockTokenUsage.push(newUsage);
    return newUsage;
  }
}

export async function getTokenUsageByProfile(profileId: number): Promise<TokenUsage[]> {
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

export async function getTotalTokensByType(profileId: number): Promise<{
  agent_run: number;
  presales_report: number;
  slides_generation: number;
  total: number;
}> {
  const result = {
    agent_run: 0,
    presales_report: 0,
    slides_generation: 0,
    total: 0
  };
  
  if (!isDatabaseConfigured()) {
    mockTokenUsage
      .filter(t => t.profile_id === profileId)
      .forEach(t => {
        result[t.operation_type] += t.tokens_used;
        result.total += t.tokens_used;
      });
    return result;
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

    rows.forEach((row) => {
      result[(row as { operation_type: string; total: string }).operation_type as keyof typeof result] = parseInt(row.total);
      result.total += parseInt((row as { operation_type: string; total: string }).total);
    });

    return result;
  } catch (error) {
    console.error('Database error, falling back to mock data:', error);
    mockTokenUsage
      .filter(t => t.profile_id === profileId)
      .forEach(t => {
        result[t.operation_type] += t.tokens_used;
        result.total += t.tokens_used;
      });
    return result;
  }
}

// Initialize database tables
export async function initializeDatabase() {
  if (!isDatabaseConfigured()) {
    console.log('Database not configured, using in-memory storage');
    return;
  }
  
  try {
    const schemaPath = path.join(process.cwd(), 'lib/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await sql.query(schema);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
