import { createClient } from '@supabase/supabase-js';

// Extract Supabase URL and key from POSTGRES_URL
// Format: postgresql://postgres.PROJECT_REF:PASSWORD@HOST:PORT/postgres
function getSupabaseConfig() {
  const postgresUrl = process.env.POSTGRES_URL;
  
  if (!postgresUrl) {
    console.warn('⚠️ POSTGRES_URL not found - Supabase storage will not be available');
    return null;
  }

  try {
    // Extract project reference from the connection string
    // Example: postgres.kmswrzzlirdfnzzbnrpo from postgresql://postgres.kmswrzzlirdfnzzbnrpo:...
    const match = postgresUrl.match(/postgres\.([a-z0-9]+):/);
    
    if (!match) {
      console.warn('⚠️ Could not extract Supabase project reference from POSTGRES_URL');
      return null;
    }

    const projectRef = match[1];
    const supabaseUrl = `https://${projectRef}.supabase.co`;
    
    // For storage operations, we need the anon key
    // This should be set as an environment variable
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseAnonKey) {
      console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY not found - using service role key from connection string');
      // Extract password from connection string as fallback
      const passwordMatch = postgresUrl.match(/:([^@]+)@/);
      if (passwordMatch) {
        return {
          url: supabaseUrl,
          key: passwordMatch[1], // Use password as service role key
        };
      }
      return null;
    }

    return {
      url: supabaseUrl,
      key: supabaseAnonKey,
    };
  } catch (error) {
    console.error('❌ Error parsing Supabase config:', error);
    return null;
  }
}

const config = getSupabaseConfig();

export const supabase = config 
  ? createClient(config.url, config.key)
  : null;

export const isSupabaseConfigured = () => supabase !== null;

if (config) {
  console.log('✅ Supabase client configured:', config.url);
} else {
  console.warn('⚠️ Supabase client not configured - file uploads will be disabled');
}

/**
 * Upload a file to Supabase Storage
 * @param bucket - The storage bucket name (e.g., 'Files')
 * @param path - The file path within the bucket
 * @param file - The file to upload (File or Buffer)
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadFileToSupabase(
  bucket: string,
  path: string,
  file: File | Buffer,
  contentType: string
): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }

  console.log(`📤 Uploading file to Supabase: ${bucket}/${path}`);

  // Convert File to ArrayBuffer if needed
  let fileData: ArrayBuffer | Buffer;
  if (file instanceof File) {
    fileData = await file.arrayBuffer();
  } else {
    fileData = file;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileData, {
      contentType,
      upsert: true, // Overwrite if file exists
    });

  if (error) {
    console.error('❌ Error uploading file to Supabase:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  console.log('✅ File uploaded successfully:', data.path);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  console.log('🔗 Public URL:', urlData.publicUrl);
  return urlData.publicUrl;
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 */
export async function deleteFileFromSupabase(
  bucket: string,
  path: string
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }

  console.log(`🗑️ Deleting file from Supabase: ${bucket}/${path}`);

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('❌ Error deleting file from Supabase:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }

  console.log('✅ File deleted successfully');
}

/**
 * Get a signed URL for a private file
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('❌ Error creating signed URL:', error);
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}
