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
const isDatabaseConfigured = () => !!connectionString && sql;

// Mock data for development/testing
const mockProfiles: Profile[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    url_slug: 'john-smith',
    title: 'Sales Manager',
    keyword_filter: '',
    google_access_token: undefined,
    outlook_access_token: undefined,
    airtable_record_id: undefined,
  },
];

const mockEvents: CalendarEvent[] = [
  {
    id: 1,
    event_id: 'event-1',
    title: 'Meeting with Acme Corp',
    description: 'Pre-sales meeting',
    start_time: new Date(Date.now() + 86400000).toISOString(),
    end_time: new Date(Date.now() + 90000000).toISOString(),
    attendees: ['john@example.com', 'contact@acmecorp.com'],
    source: 'google',
    presales_report_status: 'pending',
    slides_status: 'pending',
    created_at: new Date(),
  },
];

// Database types
export interface Profile {
  id: number;
  name: string;
  email: string;
  url_slug: string;
  title?: string;
  keyword_filter?: string;
  google_access_token?: string;
  outlook_access_token?: string;
  airtable_record_id?: string;
}

export interface CalendarEvent {
  id: number;
  event_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  attendees?: string[];
  source: 'google' | 'outlook';
  presales_report_status?: 'pending' | 'processing' | 'completed' | 'failed';
  presales_report_url?: string;
  presales_report_content?: string;
  presales_report_generated_at?: string;
  presales_report_started_at?: string;
  slides_status?: 'pending' | 'processing' | 'completed' | 'failed';
  slides_url?: string;
  slides_generated_at?: string;
  slides_started_at?: string;
  created_at?: Date;
  profile_id?: number;
}

// Profile functions
export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  if (!isDatabaseConfigured()) {
    console.log('📊 Fetching profile by slug from mock data:', slug);
    return mockProfiles.find(p => p.url_slug === slug) || null;
  }

  try {
    const result = await sql`
      SELECT * FROM profiles WHERE url_slug = ${slug}
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Database error fetching profile by slug:', error);
    return mockProfiles.find(p => p.url_slug === slug) || null;
  }
}

export async function getProfileById(id: number): Promise<Profile | null> {
  if (!isDatabaseConfigured()) {
    console.log('📊 Fetching profile by ID from mock data:', id);
    return mockProfiles.find(p => p.id === id) || null;
  }

  try {
    const result = await sql`
      SELECT * FROM profiles WHERE id = ${id}
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Database error fetching profile by ID:', error);
    return mockProfiles.find(p => p.id === id) || null;
  }
}

export async function createProfile(name: string, email: string): Promise<Profile> {
  if (!isDatabaseConfigured()) {
    console.log('📊 Creating profile in mock data:', { name, email });
    const newProfile: Profile = {
      id: Math.max(...mockProfiles.map(p => p.id), 0) + 1,
      name,
      email,
      url_slug: name.toLowerCase().replace(/\s+/g, '-'),
      keyword_filter: '',
    };
    mockProfiles.push(newProfile);
    return newProfile;
  }

  try {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const result = await sql`
      INSERT INTO profiles (name, email, url_slug)
      VALUES (${name}, ${email}, ${slug})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Database error creating profile:', error);
    throw error;
  }
}

export async function updateProfile(id: number, updates: Partial<Profile>): Promise<Profile | null> {
  if (!isDatabaseConfigured()) {
    console.log('📊 Updating profile in mock data:', { id, updates });
    const profile = mockProfiles.find(p => p.id === id);
    if (profile) {
      Object.assign(profile, updates);
    }
    return profile || null;
  }

  try {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return getProfileById(id);
    }

    values.push(id);
    const query = `UPDATE profiles SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await sql.unsafe(query, values);
    return result[0] || null;
  } catch (error) {
    console.error('Database error updating profile:', error);
    return null;
  }
}

// Calendar event functions
export async function getEventById(eventId: number): Promise<CalendarEvent | null> {
  if (!isDatabaseConfigured()) {
    console.log('📊 Fetching event by ID from mock data:', eventId);
    return mockEvents.find(e => e.id === eventId) || null;
  }

  try {
    const result = await sql`
      SELECT * FROM calendar_events WHERE id = ${eventId}
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Database error fetching event:', error);
    return mockEvents.find(e => e.id === eventId) || null;
  }
}

export async function getEventsByProfileId(profileId: number): Promise<CalendarEvent[]> {
  if (!isDatabaseConfigured()) {
    console.log('📊 Fetching events by profile ID from mock data:', profileId);
    return mockEvents;
  }

  try {
    const result = await sql`
      SELECT * FROM calendar_events WHERE profile_id = ${profileId}
      ORDER BY start_time DESC
    `;
    return result;
  } catch (error) {
    console.error('Database error fetching events:', error);
    return mockEvents;
  }
}

export async function createCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
  if (!isDatabaseConfigured()) {
    console.log('📊 Creating event in mock data:', event);
    const newEvent: CalendarEvent = {
      ...event,
      id: Math.max(...mockEvents.map(e => e.id), 0) + 1,
    };
    mockEvents.push(newEvent);
    return newEvent;
  }

  try {
    const result = await sql`
      INSERT INTO calendar_events (
        profile_id, event_id, title, description, start_time, end_time, 
        attendees, source, presales_report_status, slides_status
      )
      VALUES (
        ${event.profile_id}, ${event.event_id}, ${event.title}, 
        ${event.description || null}, ${event.start_time}, ${event.end_time},
        ${JSON.stringify(event.attendees || [])}, ${event.source},
        ${event.presales_report_status || 'pending'}, ${event.slides_status || 'pending'}
      )
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Database error creating event:', error);
    throw error;
  }
}

export async function updateEventPresalesStatus(
  eventId: number,
  status: 'pending' | 'processing' | 'completed' | 'failed'
): Promise<void> {
  if (!isDatabaseConfigured()) {
    console.log('📊 Updating event presales status in mock data:', { eventId, status });
    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      event.presales_report_status = status;
      if (status === 'processing') {
        event.presales_report_started_at = new Date().toISOString();
      }
    }
    return;
  }

  try {
    const now = new Date().toISOString();
    await sql`
      UPDATE calendar_events
      SET presales_report_status = ${status},
          presales_report_started_at = ${status === 'processing' ? now : null}
      WHERE id = ${eventId}
    `;
  } catch (error) {
    console.error('Database error updating presales status:', error);
  }
}

export async function updateEventSlidesStatus(
  eventId: number,
  status: 'pending' | 'processing' | 'completed' | 'failed'
): Promise<void> {
  if (!isDatabaseConfigured()) {
    console.log('📊 Updating event slides status in mock data:', { eventId, status });
    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      event.slides_status = status;
      if (status === 'processing') {
        event.slides_started_at = new Date().toISOString();
      }
    }
    return;
  }

  try {
    const now = new Date().toISOString();
    await sql`
      UPDATE calendar_events
      SET slides_status = ${status},
          slides_started_at = ${status === 'processing' ? now : null}
      WHERE id = ${eventId}
    `;
  } catch (error) {
    console.error('Database error updating slides status:', error);
  }
}

export async function updateEventPresalesReport(
  eventId: number,
  reportUrl: string,
  reportContent?: string
): Promise<void> {
  if (!isDatabaseConfigured()) {
    console.log('📊 Updating event presales report in mock data:', { eventId, reportUrl });
    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      event.presales_report_url = reportUrl;
      event.presales_report_content = reportContent;
      event.presales_report_status = 'completed';
      event.presales_report_generated_at = new Date().toISOString();
    }
    return;
  }

  try {
    const now = new Date().toISOString();
    await sql`
      UPDATE calendar_events
      SET presales_report_url = ${reportUrl},
          presales_report_content = ${reportContent || null},
          presales_report_status = 'completed',
          presales_report_generated_at = ${now}
      WHERE id = ${eventId}
    `;
  } catch (error) {
    console.error('Database error updating presales report:', error);
  }
}

export async function updateEventSlidesUrl(
  eventId: number,
  slidesUrl: string
): Promise<void> {
  if (!isDatabaseConfigured()) {
    console.log('📊 Updating event slides URL in mock data:', { eventId, slidesUrl });
    const event = mockEvents.find(e => e.id === eventId);
    if (event) {
      event.slides_url = slidesUrl;
      event.slides_status = 'completed';
      event.slides_generated_at = new Date().toISOString();
    }
    return;
  }

  try {
    const now = new Date().toISOString();
    await sql`
      UPDATE calendar_events
      SET slides_url = ${slidesUrl},
          slides_status = 'completed',
          slides_generated_at = ${now}
      WHERE id = ${eventId}
    `;
  } catch (error) {
    console.error('Database error updating slides URL:', error);
  }
}

// Mark stale presales report runs as failed (if processing > 20 minutes)
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
        (now.getTime() - event.created_at.getTime()) > 20 * 60 * 1000
      ) {
        event.presales_report_status = 'failed';
        count++;
      }
    });
    if (count > 0) console.log(`⏱️ Marked ${count} stale presales runs as failed`);
    return count;
  }

  try {
    console.log('⏱️ Checking for stale presales report runs (> 20 minutes)...');
    const result = await sql`
      UPDATE calendar_events
      SET presales_report_status = 'failed'
      WHERE presales_report_status = 'processing'
        AND presales_report_url IS NULL
        AND created_at < NOW() - INTERVAL '20 minutes'
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

// Mark stale slides runs as failed (if processing > 20 minutes)
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
        (now.getTime() - event.created_at.getTime()) > 20 * 60 * 1000
      ) {
        event.slides_status = 'failed';
        count++;
      }
    });
    if (count > 0) console.log(`⏱️ Marked ${count} stale slides runs as failed`);
    return count;
  }

  try {
    console.log('⏱️ Checking for stale slides runs (> 20 minutes)...');
    const result = await sql`
      UPDATE calendar_events
      SET slides_status = 'failed'
      WHERE slides_status = 'processing'
        AND slides_url IS NULL
        AND created_at < NOW() - INTERVAL '20 minutes'
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

// Token tracking functions
export async function getTokenStats(profileId: number): Promise<{ agent_run: number; presales_report: number; slides_generation: number; total: number }> {
  if (!isDatabaseConfigured()) {
    return {
      agent_run: 0,
      presales_report: 0,
      slides_generation: 0,
      total: 0,
    };
  }

  try {
    const result = await sql`
      SELECT 
        COALESCE(SUM(CASE WHEN token_type = 'agent_run' THEN tokens ELSE 0 END), 0) as agent_run,
        COALESCE(SUM(CASE WHEN token_type = 'presales_report' THEN tokens ELSE 0 END), 0) as presales_report,
        COALESCE(SUM(CASE WHEN token_type = 'slides_generation' THEN tokens ELSE 0 END), 0) as slides_generation,
        COALESCE(SUM(tokens), 0) as total
      FROM token_usage
      WHERE profile_id = ${profileId}
    `;
    return result[0] || { agent_run: 0, presales_report: 0, slides_generation: 0, total: 0 };
  } catch (error) {
    console.error('Database error fetching token stats:', error);
    return { agent_run: 0, presales_report: 0, slides_generation: 0, total: 0 };
  }
}

export async function recordTokenUsage(
  profileId: number,
  tokenType: 'agent_run' | 'presales_report' | 'slides_generation',
  tokens: number
): Promise<void> {
  if (!isDatabaseConfigured()) {
    console.log('📊 Recording token usage in mock data:', { profileId, tokenType, tokens });
    return;
  }

  try {
    await sql`
      INSERT INTO token_usage (profile_id, token_type, tokens)
      VALUES (${profileId}, ${tokenType}, ${tokens})
    `;
  } catch (error) {
    console.error('Database error recording token usage:', error);
  }
}
