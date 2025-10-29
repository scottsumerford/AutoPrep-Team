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

    // Validation
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!profileId) {
      return NextResponse.json({ error: 'No profile ID provided' }, { status: 400 });
    }

    if (!fileType || !['company_info', 'slides'].includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, CSV` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 50MB limit` },
        { status: 400 }
      );
    }

    // Get profile
    const profile = await getProfileById(parseInt(profileId));
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Convert file to base64 for storage
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const fileUrl = `data:${file.type};base64,${base64}`;

    // If profile doesn't have airtable_record_id, create one
    let airtableRecordId = profile.airtable_record_id;
    if (!airtableRecordId) {
      console.log('📝 Creating new Airtable record for profile...');
      airtableRecordId = await uploadProfileToAirtable(
        profile.id,
        profile.name,
        profile.email
      );

      // Update profile with airtable_record_id
      await updateProfile(profile.id, { airtable_record_id: airtableRecordId });
    }

    // Update Airtable with file URL
    const updateData: { [key: string]: string } = {};
    if (fileType === 'company_info') {
      updateData.company_info_url = fileUrl;
    } else if (fileType === 'slides') {
      updateData.slide_template_url = fileUrl;
    }

    await updateProfile(profile.id, updateData);
    await updateProfileFilesInAirtable(
      airtableRecordId,
      fileType === 'company_info' ? fileUrl : undefined,
      fileType === 'slides' ? fileUrl : undefined
    );

    return NextResponse.json({
      success: true,
      message: `${fileType === 'company_info' ? 'Company info' : 'Slides'} uploaded successfully`,
      airtableRecordId,
      fileUrl,
    });
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
