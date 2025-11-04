import { NextRequest, NextResponse } from 'next/server';
import { getProfileById, updateProfile } from '@/lib/db';

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
 * Uploads files directly to Supabase database (no Airtable)
 * Files are stored as base64 encoded strings in the profiles table
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

    // Convert file to base64 for storage in Supabase
    console.log('📝 Converting file to base64...');
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    // Store file with metadata
    const fileData = {
      filename: file.name,
      mimetype: file.type,
      size: file.size,
      data: base64,
    };
    
    const fileDataString = JSON.stringify(fileData);
    console.log('✅ File converted to base64, total size:', fileDataString.length);

    // Update database - store directly in Supabase
    console.log('📝 Updating profile in Supabase...');
    const updateData: Record<string, string> = {};
    
    if (fileType === 'company_info') {
      updateData.company_info_file = fileDataString;
    } else if (fileType === 'slides') {
      updateData.slides_file = fileDataString;
    }

    await updateProfile(profile.id, updateData);
    console.log('✅ Profile updated in Supabase');

    console.log('✅ File upload completed successfully (stored in Supabase)');
    return NextResponse.json({
      success: true,
      message: `${fileType === 'company_info' ? 'Company info' : 'Slides'} uploaded successfully`,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('❌ Unexpected error uploading file:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('📋 Error message:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Unexpected error', 
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
