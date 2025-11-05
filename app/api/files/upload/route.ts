import { NextRequest, NextResponse } from 'next/server';
import { getProfileById, updateProfile } from '@/lib/db';
import { uploadFileToSupabase, isSupabaseConfigured } from '@/lib/supabase';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * POST /api/files/upload
 * 
 * Uploads files to Supabase Storage bucket 'Files'
 * Stores the public URL in the profiles table
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const profileId = formData.get('profileId') as string;
    const fileType = formData.get('fileType') as 'company_info' | 'slides';

    console.log('📤 File upload request received:', {
      profileId,
      fileType,
      fileName: file?.name,
      fileSize: file?.size,
      mimeType: file?.type,
    });

    // Validation
    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!profileId) {
      console.error('❌ No profile ID provided');
      return NextResponse.json({ error: 'No profile ID provided' }, { status: 400 });
    }

    if (!fileType || !['company_info', 'slides'].includes(fileType)) {
      console.error('❌ Invalid file type:', fileType);
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      console.error('❌ File type not allowed:', file.type);
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, CSV` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      console.error('❌ File size exceeds limit:', file.size);
      return NextResponse.json(
        { error: `File size exceeds 50MB limit` },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.error('❌ Supabase Storage not configured');
      return NextResponse.json(
        { error: 'File storage not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Get profile
    console.log('🔍 Fetching profile from database...');
    const profile = await getProfileById(parseInt(profileId));

    if (!profile) {
      console.error('❌ Profile not found:', profileId);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    console.log('✅ Profile found:', {
      id: profile.id,
      name: profile.name,
      email: profile.email,
    });

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${profile.id}/${fileType}/${timestamp}_${sanitizedFileName}`;

    console.log('📁 File path:', filePath);

    // Upload to Supabase Storage
    console.log('☁️ Uploading to Supabase Storage bucket "Files"...');
    const fileUrl = await uploadFileToSupabase(
      'Files',
      filePath,
      file,
      file.type
    );

    console.log('✅ File uploaded to Supabase Storage:', fileUrl);

    // Update database with file URL
    console.log('📝 Updating profile in database...');
    const updateData: Record<string, string> = {};
    
    if (fileType === 'company_info') {
      updateData.company_info_file = fileUrl;
    } else if (fileType === 'slides') {
      updateData.slides_file = fileUrl;
    }

    await updateProfile(profile.id, updateData);
    console.log('✅ Profile updated in database');

    console.log('✅ File upload completed successfully');
    return NextResponse.json({
      success: true,
      message: `${fileType === 'company_info' ? 'Company info' : 'Slides'} uploaded successfully`,
      filename: file.name,
      size: file.size,
      url: fileUrl,
    });
  } catch (error) {
    console.error('❌ Unexpected error uploading file:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('📋 Error message:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Failed to upload file', 
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
