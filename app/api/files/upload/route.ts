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
      fileType: file?.type,
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
      airtable_record_id: profile.airtable_record_id,
    });

    // Convert file to base64 for storage
    console.log('📝 Converting file to base64...');
    const buffer = await file.arrayBuffer();
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
      } catch (error) {
        console.error('❌ Error creating Airtable record:', error);
        throw error;
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

    await updateProfile(profile.id, updateData);
    console.log('✅ Profile updated in database');

    // Update Airtable
    console.log('📝 Updating Airtable record...');
    try {
      await updateProfileFilesInAirtable(
        airtableRecordId,
        fileType === 'company_info' ? fileUrl : undefined,
        fileType === 'slides' ? fileUrl : undefined
      );
      console.log('✅ Airtable record updated');
    } catch (error) {
      console.error('❌ Error updating Airtable:', error);
      throw error;
    }

    console.log('✅ File upload completed successfully');
    return NextResponse.json({
      success: true,
      message: `${fileType === 'company_info' ? 'Company info' : 'Slides'} uploaded successfully`,
      airtableRecordId,
      fileUrl,
    });
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('📋 Error details:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Failed to upload file', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
// Force redeployment - Wed Oct 29 21:31:36 CDT 2025
