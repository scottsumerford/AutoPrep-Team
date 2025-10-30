import axios, { AxiosError } from 'axios';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'patyvS3W6QpbsXb2u.5d468ceeb4d2169784e6b5cb95f83cb9a1c7ae3b9edf71d7506c101985ca1201';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appUwKSnmMH7TVgvf';
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID || 'tbl2mjvZZG6ExhNbC';

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

interface AirtableErrorResponse {
  response?: {
    data?: Record<string, unknown>;
    status?: number;
  };
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
    console.log('📝 uploadProfileToAirtable called with:', {
      profileId,
      profileName,
      profileEmail,
      hasCompanyInfo: !!companyInfoUrl,
      hasSlides: !!slidesUrl,
    });

    const record: AirtableRecord = {
      fields: {
        'Profile ID': profileId,
        'Profile Name': profileName,
        'Profile Email': profileEmail,
        'Company Info URL': companyInfoUrl || '',
        'Slides URL': slidesUrl || '',
        'Created At': new Date().toISOString().split('T')[0],
      },
    };

    console.log('📤 Sending POST request to Airtable:', {
      url: AIRTABLE_API_URL,
      fields: record.fields,
    });

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
      const airtableId = response.data.records[0].id as string;
      console.log(`✅ Profile uploaded to Airtable with ID: ${airtableId}`);
      return airtableId;
    }

    throw new Error('No record returned from Airtable');
  } catch (error) {
    const axiosError = error as AxiosError<AirtableErrorResponse>;
    console.error('❌ Error uploading profile to Airtable:', {
      error: error instanceof Error ? error.message : String(error),
      response: axiosError.response?.data,
      status: axiosError.response?.status,
    });
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
    console.log('📝 updateProfileFilesInAirtable called with:', {
      airtableRecordId,
      hasCompanyInfo: !!companyInfoUrl,
      hasSlides: !!slidesUrl,
    });

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

    console.log('📤 Sending PATCH request to Airtable:', {
      url: `${AIRTABLE_API_URL}/${airtableRecordId}`,
      fields: Object.keys(fields),
    });

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

    console.log(`✅ Airtable record updated: ${airtableRecordId}`);
  } catch (error) {
    const axiosError = error as AxiosError<AirtableErrorResponse>;
    console.error('❌ Error updating Airtable record:', {
      airtableRecordId,
      error: error instanceof Error ? error.message : String(error),
      response: axiosError.response?.data,
      status: axiosError.response?.status,
    });
    throw error;
  }
}

/**
 * Get profile from Airtable by record ID
 */
export async function getProfileFromAirtable(airtableRecordId: string): Promise<AirtableResponse | null> {
  try {
    console.log('🔍 Fetching profile from Airtable:', airtableRecordId);

    const response = await axios.get(
      `${AIRTABLE_API_URL}/${airtableRecordId}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    console.log('✅ Profile fetched from Airtable');
    return response.data as AirtableResponse;
  } catch (error) {
    const axiosError = error as AxiosError<AirtableErrorResponse>;
    console.error('❌ Error fetching profile from Airtable:', {
      airtableRecordId,
      error: error instanceof Error ? error.message : String(error),
      response: axiosError.response?.data,
      status: axiosError.response?.status,
    });
    return null;
  }
}

/**
 * Delete profile from Airtable
 */
export async function deleteProfileFromAirtable(airtableRecordId: string): Promise<void> {
  try {
    console.log('🗑️ Deleting profile from Airtable:', airtableRecordId);

    await axios.delete(
      `${AIRTABLE_API_URL}/${airtableRecordId}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    console.log('✅ Profile deleted from Airtable');
  } catch (error) {
    const axiosError = error as AxiosError<AirtableErrorResponse>;
    console.error('❌ Error deleting profile from Airtable:', {
      airtableRecordId,
      error: error instanceof Error ? error.message : String(error),
      response: axiosError.response?.data,
      status: axiosError.response?.status,
    });
    throw error;
  }
}
