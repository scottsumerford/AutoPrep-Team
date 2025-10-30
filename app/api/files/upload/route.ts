import { NextRequest, NextResponse } from 'next/server';
import { getProfileById, updateProfile } from '@/lib/db';
import { uploadProfileToAirtable, updateProfileFilesInAirtable } from '@/lib/airtable';

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
    let profile;
    try {
      profile = await getProfileById(parseInt(profileId));
    } catch (dbError) {
      console.error('❌ Database error fetching profile:', dbError);
      return NextResponse.json(
        { error: 'Database error', message: dbError instanceof Error ? dbError.message : 'Unknown database error' },
        { status: 500 }
      );
    }

    if (!profile) {
      console.error('❌ Profile not found:', profileId);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    console.log('✅ Profile found:', {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      airtable_record_id: profile.airtable_record_id,
    });

    // Convert file to base64 for storage
    console.log('📝 Converting file to base64...');
    let buffer;
    try {
      buffer = await file.arrayBuffer();
    } catch (bufferError) {
      console.error('❌ Error reading file:', bufferError);
      return NextResponse.json(
        { error: 'Error reading file', message: bufferError instanceof Error ? bufferError.message : 'Unknown error' },
        { status: 400 }
      );
    }

    const base64 = Buffer.from(buffer).toString('base64');
    const fileUrl = `data:${file.type};base64,${base64}`;
    console.log('✅ File converted to base64, size:', fileUrl.length);

    // If profile doesn't have airtable_record_id, create one
    let airtableRecordId = profile.airtable_record_id;
    if (!airtableRecordId) {
      console.log('📝 Creating new Airtable record for profile...');
      try {
        airtableRecordId = await uploadProfileToAirtable(
          profile.id,
          profile.name,
          profile.email
        );
        console.log('✅ Airtable record created:', airtableRecordId);

        // Update profile with airtable_record_id
        await updateProfile(profile.id, { airtable_record_id: airtableRecordId });
        console.log('✅ Profile updated with airtable_record_id');
      } catch (airtableError) {
        console.error('❌ Error creating Airtable record:', airtableError);
        const errorMsg = airtableError instanceof Error ? airtableError.message : String(airtableError);
        return NextResponse.json(
          { error: 'Airtable error', message: errorMsg },
          { status: 500 }
        );
      }
    }

    // Update database
    console.log('📝 Updating profile in database...');
    const updateData: { [key: string]: string } = {};
    if (fileType === 'company_info') {
      updateData.company_info_url = fileUrl;
    } else if (fileType === 'slides') {
      updateData.slide_template_url = fileUrl;
    }

    try {
      await updateProfile(profile.id, updateData);
      console.log('✅ Profile updated in database');
    } catch (updateError) {
      console.error('❌ Error updating profile:', updateError);
      const errorMsg = updateError instanceof Error ? updateError.message : String(updateError);
      return NextResponse.json(
        { error: 'Database update error', message: errorMsg },
        { status: 500 }
      );
    }

    // Update Airtable
    console.log('📝 Updating Airtable record...');
    try {
      await updateProfileFilesInAirtable(
        airtableRecordId,
        fileType === 'company_info' ? fileUrl : undefined,
        fileType === 'slides' ? fileUrl : undefined
      );
      console.log('✅ Airtable record updated');
    } catch (airtableUpdateError) {
      console.error('❌ Error updating Airtable:', airtableUpdateError);
      const errorMsg = airtableUpdateError instanceof Error ? airtableUpdateError.message : String(airtableUpdateError);
      return NextResponse.json(
        { error: 'Airtable update error', message: errorMsg },
        { status: 500 }
      );
    }

    console.log('✅ File upload completed successfully');
    return NextResponse.json({
      success: true,
      message: `${fileType === 'company_info' ? 'Company info' : 'Slides'} uploaded successfully`,
      airtableRecordId,
      fileUrl,
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
