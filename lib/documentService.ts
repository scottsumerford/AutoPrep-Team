import { createClient } from '@supabase/supabase-js';

// TypeScript interfaces for type safety
export interface GeneratedDocument {
  id: string;
  document_type: 'pre-sales-report' | 'presentation-slides';
  company_name: string;
  contact_info?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_path?: string;
  download_url?: string;
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

export interface DocumentServiceResponse {
  success: boolean;
  data?: GeneratedDocument;
  error?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Create a new document record in the database
 */
export async function createDocument(
  documentType: 'pre-sales-report' | 'presentation-slides',
  companyName: string,
  contactInfo?: string
): Promise<DocumentServiceResponse> {
  try {
    const { data, error } = await supabase
      .from('generated_documents')
      .insert({
        document_type: documentType,
        company_name: companyName,
        contact_info: contactInfo || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check the current status of a document
 */
export async function checkDocumentStatus(
  documentId: string
): Promise<DocumentServiceResponse> {
  try {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Poll for document completion with timeout
 */
export async function pollForCompletion(
  documentId: string,
  maxAttempts: number = 60,
  intervalMs: number = 1000
): Promise<DocumentServiceResponse> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await checkDocumentStatus(documentId);

    if (!response.success) {
      return response;
    }

    const document = response.data as GeneratedDocument;

    if (document.status === 'completed' || document.status === 'failed') {
      return { success: true, data: document };
    }

    // Wait before next attempt
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  return {
    success: false,
    error: `Document generation timeout after ${maxAttempts} attempts`,
  };
}

/**
 * Get the latest document for a company
 */
export async function getLatestDocument(
  companyName: string
): Promise<DocumentServiceResponse> {
  try {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('company_name', companyName)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update document status (used by agents)
 */
export async function updateDocumentStatus(
  documentId: string,
  status: 'processing' | 'completed' | 'failed',
  updates?: {
    file_path?: string;
    download_url?: string;
    error_message?: string;
  }
): Promise<DocumentServiceResponse> {
  try {
    const updateData: Record<string, string | Date> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (updates?.file_path) updateData.file_path = updates.file_path;
    if (updates?.download_url) updateData.download_url = updates.download_url;
    if (updates?.error_message) updateData.error_message = updates.error_message;

    const { data, error } = await supabase
      .from('generated_documents')
      .update(updateData)
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
