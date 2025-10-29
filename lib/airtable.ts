import axios from 'axios';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'patyvS3W6QpbsXb2u.5d468ceeb4d2169784e6b5cb95f83cb9a1c7ae3b9edf71d7506c101985ca1201';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appUwKSnmMH7TVgvf';
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID || 'tbl3xkB7fGkC10CGN';

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

interface AirtableField {
  [key: string]: string | number | boolean | null;
}

interface AirtableRecord {
  fields: AirtableField;
}

interface AirtableResponse {
  id: string;
  fields: AirtableField;
  createdTime: string;
}

/**
 * Upload user profile data to Airtable
 * Returns the Airtable record ID which serves as the unique profile ID
 */
export async function uploadProfileToAirtable(
  profileId: number,
  profileName: string,
  profileEmail: string,
  companyInfoUrl?: string,
  slidesUrl?: string
): Promise<string> {
  try {
    const record: AirtableRecord = {
      fields: {
        'Profile ID': profileId,
        'Profile Name': profileName,
        'Profile Email': profileEmail,
        'Company Info URL': companyInfoUrl || '',
        'Slides URL': slidesUrl || '',
        'Created At': new Date().toISOString(),
      },
    };

    const response = await axios.post(
      AIRTABLE_API_URL,
      { records: [record] },
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.records && response.data.records.length > 0) {
      const airtableId = response.data.records[0].id;
      console.log(`✅ Profile uploaded to Airtable with ID: ${airtableId}`);
      return airtableId;
    }

    throw new Error('No record returned from Airtable');
  } catch (error) {
    console.error('❌ Error uploading profile to Airtable:', error);
    throw error;
  }
}

/**
 * Update profile files in Airtable
 */
export async function updateProfileFilesInAirtable(
  airtableRecordId: string,
  companyInfoUrl?: string,
  slidesUrl?: string
): Promise<void> {
  try {
    const fields: AirtableField = {};
    
    if (companyInfoUrl) {
      fields['Company Info URL'] = companyInfoUrl;
    }
    if (slidesUrl) {
      fields['Slides URL'] = slidesUrl;
    }

    if (Object.keys(fields).length === 0) {
      console.log('⚠️ No fields to update');
      return;
    }

    await axios.patch(
      `${AIRTABLE_API_URL}/${airtableRecordId}`,
      { fields },
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Profile updated in Airtable: ${airtableRecordId}`);
  } catch (error) {
    console.error('❌ Error updating profile in Airtable:', error);
    throw error;
  }
}

/**
 * Get profile from Airtable by record ID
 */
export async function getProfileFromAirtable(airtableRecordId: string): Promise<AirtableResponse | null> {
  try {
    const response = await axios.get(
      `${AIRTABLE_API_URL}/${airtableRecordId}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching profile from Airtable:', error);
    return null;
  }
}
