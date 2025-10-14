import { sql } from '@vercel/postgres';

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

// Database helper functions
export async function getAllProfiles(): Promise<Profile[]> {
  const { rows } = await sql<Profile>`SELECT * FROM profiles ORDER BY created_at DESC`;
  return rows;
}

export async function getProfileById(id: number): Promise<Profile | null> {
  const { rows } = await sql<Profile>`SELECT * FROM profiles WHERE id = ${id}`;
  return rows[0] || null;
}

export async function createProfile(data: Partial<Profile>): Promise<Profile> {
  const { rows } = await sql<Profile>`
    INSERT INTO profiles (name, email, title, operation_mode)
    VALUES (${data.name}, ${data.email}, ${data.title || ''}, ${data.operation_mode || 'auto-sync'})
    RETURNING *
  `;
  return rows[0];
}

export async function updateProfile(id: number, data: Partial<Profile>): Promise<Profile> {
  const updates: string[] = [];
  const values: any[] = [];
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
}

export async function getCalendarEvents(profileId: number, keywordFilter?: string): Promise<CalendarEvent[]> {
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
}

export async function saveCalendarEvent(data: Partial<CalendarEvent>): Promise<CalendarEvent> {
  const { rows } = await sql<CalendarEvent>`
    INSERT INTO calendar_events (profile_id, event_id, title, description, start_time, end_time, attendees, source)
    VALUES (${data.profile_id}, ${data.event_id}, ${data.title}, ${data.description || ''}, 
            ${data.start_time}, ${data.end_time}, ${data.attendees || []}, ${data.source})
    ON CONFLICT (event_id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      start_time = EXCLUDED.start_time,
      end_time = EXCLUDED.end_time,
      attendees = EXCLUDED.attendees
    RETURNING *
  `;
  return rows[0];
}

export async function trackTokenUsage(data: {
  profile_id: number;
  operation_type: 'agent_run' | 'presales_report' | 'slides_generation';
  tokens_used: number;
  lindy_agent_id?: string;
  event_id?: number;
}): Promise<TokenUsage> {
  const { rows } = await sql<TokenUsage>`
    INSERT INTO token_usage (profile_id, operation_type, tokens_used, lindy_agent_id, event_id)
    VALUES (${data.profile_id}, ${data.operation_type}, ${data.tokens_used}, 
            ${data.lindy_agent_id || null}, ${data.event_id || null})
    RETURNING *
  `;
  return rows[0];
}

export async function getTokenUsageByProfile(profileId: number): Promise<TokenUsage[]> {
  const { rows } = await sql<TokenUsage>`
    SELECT * FROM token_usage 
    WHERE profile_id = ${profileId}
    ORDER BY created_at DESC
  `;
  return rows;
}

export async function getTotalTokensByType(profileId: number): Promise<{
  agent_run: number;
  presales_report: number;
  slides_generation: number;
  total: number;
}> {
  const { rows } = await sql`
    SELECT 
      operation_type,
      SUM(tokens_used) as total
    FROM token_usage
    WHERE profile_id = ${profileId}
    GROUP BY operation_type
  `;

  const result = {
    agent_run: 0,
    presales_report: 0,
    slides_generation: 0,
    total: 0
  };

  rows.forEach((row: any) => {
    result[row.operation_type as keyof typeof result] = parseInt(row.total);
    result.total += parseInt(row.total);
  });

  return result;
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Read and execute schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(process.cwd(), 'lib/db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await sql.query(schema);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
