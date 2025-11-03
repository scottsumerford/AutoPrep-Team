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

export async function POST(request: NextRequest) {
  try {
    console.log('📤 [FILE_UPLOAD] Starting file upload...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const profileId = formData.get('profileId') as string;
    const fileType = formData.get('fileType') as 'company_info' | 'slides';

    console.log('📤 [FILE_UPLOAD] Request received:', {
      profileId,
      fileType,
      fileName: file?.name,
      fileSize: file?.size,
      mimeType: file?.type,
    });

    // Validation
    if (!file) {
      console.error('❌ [FILE_UPLOAD] No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!profileId) {
      console.error('❌ [FILE_UPLOAD] No profile ID provided');
      return NextResponse.json({ error: 'No profile ID provided' }, { status: 400 });
    }

    if (!fileType || !['company_info', 'slides'].includes(fileType)) {
      console.error('❌ [FILE_UPLOAD] Invalid file type:', fileType);
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      console.error('❌ [FILE_UPLOAD] File type not allowed:', file.type);
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, CSV` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      console.error('❌ [FILE_UPLOAD] File size exceeds limit:', file.size);
      return NextResponse.json(
        { error: `File size exceeds 50MB limit` },
        { status: 400 }
      );
    }

    // Get profile
    console.log('🔍 [FILE_UPLOAD] Fetching profile from database...');
    let profile;
    try {
      profile = await getProfileById(parseInt(profileId));
      console.log('✅ [FILE_UPLOAD] Profile fetched successfully');
    } catch (dbError) {
      console.error('❌ [FILE_UPLOAD] Database error fetching profile:', dbError);
      return NextResponse.json(
        { error: 'Database error', message: dbError instanceof Error ? dbError.message : 'Unknown database error' },
        { status: 500 }
      );
    }

    if (!profile) {
      console.error('❌ [FILE_UPLOAD] Profile not found:', profileId);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    console.log('✅ [FILE_UPLOAD] Profile found:', {
      id: profile.id,
      name: profile.name,
      email: profile.email,
    });

    // Convert file to base64 for storage in PostgreSQL BYTEA column
    console.log('📝 [FILE_UPLOAD] Converting file to base64...');
    let buffer;
    try {
      buffer = await file.arrayBuffer();
      console.log('✅ [FILE_UPLOAD] File read successfully, size:', buffer.byteLength);
    } catch (bufferError) {
      console.error('❌ [FILE_UPLOAD] Error reading file:', bufferError);
      return NextResponse.json(
        { error: 'Error reading file', message: bufferError instanceof Error ? bufferError.message : 'Unknown error' },
        { status: 400 }
      );
    }

    const base64 = Buffer.from(buffer).toString('base64');
    console.log('✅ [FILE_UPLOAD] File converted to base64, size:', base64.length);

    // Update database with file stored in BYTEA column
    console.log('📝 [FILE_UPLOAD] Updating profile in database with file...');
    const updateData: { [key: string]: string } = {};
    if (fileType === 'company_info') {
      updateData.company_info_file = base64;
    } else if (fileType === 'slides') {
      updateData.slides_file = base64;
    }

    try {
      const updatedProfile = await updateProfile(profile.id, updateData);
      console.log('✅ [FILE_UPLOAD] Profile updated in database with file');
      
      return NextResponse.json({
        success: true,
        message: `${fileType === 'company_info' ? 'Company info' : 'Slides'} uploaded successfully`,
        profileId,
        fileType,
        fileName: file.name,
        airtableRecordId: updatedProfile?.airtable_record_id || null,
      });
    } catch (updateError) {
      console.error('❌ [FILE_UPLOAD] Error updating profile:', updateError);
      const errorMsg = updateError instanceof Error ? updateError.message : String(updateError);
      console.error('📋 [FILE_UPLOAD] Error details:', errorMsg);
      return NextResponse.json(
        { error: 'Database update error', message: errorMsg },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ [FILE_UPLOAD] Unexpected error uploading file:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('📋 [FILE_UPLOAD] Error message:', errorMessage);
    console.error('📋 [FILE_UPLOAD] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Unexpected error', 
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
