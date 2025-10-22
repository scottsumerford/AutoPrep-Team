/**
 * Airtable Integration for AutoPrep Team Dashboard
 * Handles reading pre-sales reports from Airtable
 */

export interface AirtableRecord {
  id: string;
  fields: {
    companyName?: string;
    meetingDate?: string;
    meetingTitle?: string;
    reportContent?: string;
    reportGeneratedDate?: string;
    weekNumber?: number;
    attendees?: string[];
  };
  createdTime: string;
}

export interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

const AIRTABLE_API_BASE = 'https://api.airtable.com/v0';

/**
 * Get all records from Airtable table
 */
export async function getAirtableRecords(
  filters?: {
    companyName?: string;
    meetingTitle?: string;
    weekNumber?: number;
  }
): Promise<AirtableRecord[]> {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableId = process.env.AIRTABLE_TABLE_ID;

    if (!apiKey || !baseId || !tableId) {
      console.error('❌ Airtable credentials not configured');
      return [];
    }

    let filterFormula = '';
    if (filters) {
      const conditions = [];
      if (filters.companyName) {
        conditions.push(`{companyName} = '${filters.companyName}'`);
      }
      if (filters.meetingTitle) {
        conditions.push(`{meetingTitle} = '${filters.meetingTitle}'`);
      }
      if (filters.weekNumber) {
        conditions.push(`{weekNumber} = ${filters.weekNumber}`);
      }
      if (conditions.length > 0) {
        filterFormula = `&filterByFormula=AND(${conditions.join(',')})`;
      }
    }

    const url = `${AIRTABLE_API_BASE}/${baseId}/${tableId}?${filterFormula}`;

    console.log('🔍 Fetching records from Airtable:', { baseId, tableId });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Airtable API error:', response.status, response.statusText);
      return [];
    }

    const data: AirtableResponse = await response.json();
    console.log(`✅ Retrieved ${data.records.length} records from Airtable`);

    return data.records;
  } catch (error) {
    console.error('❌ Error fetching Airtable records:', error);
    return [];
  }
}

/**
 * Get a specific record by ID
 */
export async function getAirtableRecord(recordId: string): Promise<AirtableRecord | null> {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableId = process.env.AIRTABLE_TABLE_ID;

    if (!apiKey || !baseId || !tableId) {
      console.error('❌ Airtable credentials not configured');
      return null;
    }

    const url = `${AIRTABLE_API_BASE}/${baseId}/${tableId}/${recordId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Airtable API error:', response.status);
      return null;
    }

    const data: AirtableRecord = await response.json();
    console.log('✅ Retrieved record from Airtable:', recordId);

    return data;
  } catch (error) {
    console.error('❌ Error fetching Airtable record:', error);
    return null;
  }
}

/**
 * Create a new record in Airtable
 */
export async function createAirtableRecord(fields: {
  companyName?: string;
  meetingDate?: string;
  meetingTitle?: string;
  reportContent?: string;
  reportGeneratedDate?: string;
  weekNumber?: number;
  attendees?: string[];
}): Promise<AirtableRecord | null> {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableId = process.env.AIRTABLE_TABLE_ID;

    if (!apiKey || !baseId || !tableId) {
      console.error('❌ Airtable credentials not configured');
      return null;
    }

    const url = `${AIRTABLE_API_BASE}/${baseId}/${tableId}`;

    console.log('📝 Creating new Airtable record:', fields);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [
          {
            fields
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Airtable API error:', response.status, error);
      return null;
    }

    const data = await response.json();
    const record = data.records[0];
    console.log('✅ Created Airtable record:', record.id);

    return record;
  } catch (error) {
    console.error('❌ Error creating Airtable record:', error);
    return null;
  }
}

/**
 * Update an existing record in Airtable
 */
export async function updateAirtableRecord(
  recordId: string,
  fields: Partial<{
    companyName?: string;
    meetingDate?: string;
    meetingTitle?: string;
    reportContent?: string;
    reportGeneratedDate?: string;
    weekNumber?: number;
    attendees?: string[];
  }>
): Promise<AirtableRecord | null> {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableId = process.env.AIRTABLE_TABLE_ID;

    if (!apiKey || !baseId || !tableId) {
      console.error('❌ Airtable credentials not configured');
      return null;
    }

    const url = `${AIRTABLE_API_BASE}/${baseId}/${tableId}/${recordId}`;

    console.log('✏️ Updating Airtable record:', recordId, fields);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Airtable API error:', response.status, error);
      return null;
    }

    const data: AirtableRecord = await response.json();
    console.log('✅ Updated Airtable record:', recordId);

    return data;
  } catch (error) {
    console.error('❌ Error updating Airtable record:', error);
    return null;
  }
}

/**
 * Search for reports by company name
 */
export async function searchReportsByCompany(companyName: string): Promise<AirtableRecord[]> {
  return getAirtableRecords({ companyName });
}

/**
 * Search for reports by meeting title
 */
export async function searchReportsByMeetingTitle(meetingTitle: string): Promise<AirtableRecord[]> {
  return getAirtableRecords({ meetingTitle });
}

/**
 * Get reports for a specific week
 */
export async function getReportsByWeek(weekNumber: number): Promise<AirtableRecord[]> {
  return getAirtableRecords({ weekNumber });
}
