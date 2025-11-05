# Supabase Storage Setup Guide

## Overview

This application uses Supabase Storage to store user-uploaded files (company information and slide templates). Files are stored in a bucket called "Files" and referenced in the profiles table.

## Prerequisites

1. Supabase project with PostgreSQL database
2. Storage bucket named "Files" created in Supabase
3. Environment variables configured

## Storage Bucket Configuration

### 1. Create Storage Bucket

In your Supabase dashboard:

1. Go to **Storage** section
2. Click **New bucket**
3. Bucket name: `Files`
4. Public bucket: **Yes** (for easy access to uploaded files)
5. Click **Create bucket**

### 2. Set Bucket Policies

For public access to uploaded files, add this policy:

```sql
-- Allow public read access to all files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'Files' );

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'Files' AND auth.role() = 'authenticated' );

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'Files' );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING ( bucket_id = 'Files' );
```

### 3. Alternative: Service Role Access

If you want to use service role key instead of anon key:

```sql
-- Allow service role full access
CREATE POLICY "Service role has full access"
ON storage.objects FOR ALL
USING ( bucket_id = 'Files' );
```

## Environment Variables

### Required Variables

Add these to your `.env.local` (local) and Vercel environment variables (production):

```bash
# Database connection (already configured)
POSTGRES_URL=postgresql://postgres.PROJECT_REF:PASSWORD@HOST:PORT/postgres

# Supabase Anon Key (for storage operations)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### How to Get Supabase Anon Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **anon** **public** key
4. Add it to your environment variables

**Example:**
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Migration

### Apply the Migration

Run the migration to add file storage columns to the profiles table:

```bash
# Using psql
psql $POSTGRES_URL -f lib/db/migrations/add_file_columns.sql

# Or copy/paste into Supabase SQL Editor
```

### Migration Details

The migration adds these columns to the `profiles` table:

- `company_info_file` (TEXT) - URL to company info file in Supabase Storage
- `company_info_text` (TEXT) - Company info entered as text
- `slides_file` (TEXT) - URL to slide template file in Supabase Storage

## File Upload Flow

### 1. User Uploads File

User selects a file in the FileUploadSection component:
- Company Information (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV)
- Slide Templates (PPT, PPTX, PDF)

### 2. File Validation

API validates:
- File type (must be in allowed list)
- File size (max 50MB)
- Profile exists

### 3. Upload to Supabase Storage

File is uploaded to bucket with path structure:
```
Files/
  {profile_id}/
    company_info/
      {timestamp}_{filename}
    slides/
      {timestamp}_{filename}
```

### 4. Store URL in Database

The public URL is stored in the profiles table:
- `company_info_file` column for company info files
- `slides_file` column for slide templates

### 5. Pass to Webhooks

When generating reports/slides, the file URLs are passed to Lindy agents via webhooks.

## File Structure

```
Files/
├── 1/                          # Profile ID 1
│   ├── company_info/
│   │   └── 1699564800000_company_info.pdf
│   └── slides/
│       └── 1699564900000_template.pptx
├── 2/                          # Profile ID 2
│   ├── company_info/
│   │   └── 1699565000000_info.docx
│   └── slides/
│       └── 1699565100000_slides.pdf
```

## API Endpoints

### POST /api/files/upload

Upload a file to Supabase Storage.

**Request:**
```
FormData:
- file: File (required)
- profileId: number (required)
- fileType: 'company_info' | 'slides' (required)
```

**Response:**
```json
{
  "success": true,
  "message": "Company info uploaded successfully",
  "filename": "company_info.pdf",
  "size": 1024000,
  "url": "https://PROJECT_REF.supabase.co/storage/v1/object/public/Files/1/company_info/1699564800000_company_info.pdf"
}
```

### POST /api/files/upload-text

Save company information as text (no file upload).

**Request:**
```json
{
  "profileId": 1,
  "companyInfoText": "Company description..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Company information saved successfully"
}
```

## Webhook Integration

When generating pre-sales reports or slides, the file URLs are included in the webhook payload:

### Pre-sales Report Webhook

```json
{
  "calendar_event_id": 123,
  "event_title": "Meeting with Client",
  "attendee_email": "client@example.com",
  "company_info_file": "https://PROJECT_REF.supabase.co/storage/v1/object/public/Files/1/company_info/...",
  "company_info_text": "Company description...",
  "webhook_callback_url": "https://team.autoprep.ai/api/lindy/webhook"
}
```

### Slides Generation Webhook

```json
{
  "calendar_event_id": 123,
  "event_title": "Meeting with Client",
  "attendee_email": "client@example.com",
  "slides_file": "https://PROJECT_REF.supabase.co/storage/v1/object/public/Files/1/slides/...",
  "webhook_url": "https://team.autoprep.ai/api/lindy/webhook"
}
```

## Testing

### Local Testing

1. Start the dev server:
   ```bash
   bun run dev
   ```

2. Navigate to a profile page:
   ```
   http://localhost:3000/profile/scott-autoprep
   ```

3. Upload a company info file
4. Check Supabase Storage dashboard to verify file was uploaded
5. Check database to verify URL was stored in `company_info_file` column

### Production Testing

1. Deploy to Vercel:
   ```bash
   git push origin main
   ```

2. Verify environment variables are set in Vercel:
   - `POSTGRES_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Test file upload on production:
   ```
   https://team.autoprep.ai/profile/scott-autoprep
   ```

## Troubleshooting

### Error: "Supabase Storage not configured"

**Cause:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variable not set

**Solution:** Add the anon key to your environment variables

### Error: "Failed to upload file: new row violates row-level security policy"

**Cause:** Storage bucket policies not configured correctly

**Solution:** Add the storage policies shown above in Supabase SQL Editor

### Error: "File not appearing in Supabase Storage"

**Cause:** Bucket name mismatch or permissions issue

**Solution:** 
1. Verify bucket name is exactly "Files" (case-sensitive)
2. Check bucket is set to public
3. Verify storage policies are applied

### Error: "Cannot read properties of null (reading 'storage')"

**Cause:** Supabase client not initialized properly

**Solution:** Check that `POSTGRES_URL` is set and contains valid Supabase connection string

## Security Considerations

1. **File Size Limits:** Max 50MB per file (configurable in API)
2. **File Type Validation:** Only allowed file types can be uploaded
3. **Path Sanitization:** File names are sanitized to prevent path traversal
4. **Profile Isolation:** Files are stored in profile-specific directories
5. **Public Access:** Files are publicly accessible via URL (consider signed URLs for sensitive data)

## Future Enhancements

- [ ] Add file versioning (keep history of uploaded files)
- [ ] Add file preview functionality
- [ ] Implement signed URLs for private files
- [ ] Add file compression for large files
- [ ] Add virus scanning for uploaded files
- [ ] Add file metadata (upload date, file size, etc.)
- [ ] Add bulk file upload
- [ ] Add file deletion functionality

## Support

For issues or questions, contact: **scottsumerford@gmail.com**

---

**Last Updated:** November 4, 2025
**Version:** 1.0.0
