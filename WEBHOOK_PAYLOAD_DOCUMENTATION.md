# 🔗 AutoPrep Team - Webhook Payload Documentation
**Version**: 2.0 (Post-Airtable Migration)
**Last Updated**: November 3, 2025
**Status**: Production Ready

---

## 📋 Overview

This document details the exact payload format that your Lindy agents will receive from the AutoPrep Team application webhooks. All file data is now sent directly in the webhook payload as base64-encoded JSON objects.

---

## 🎯 Webhook Endpoints

### 1. Pre-Sales Report Generation Webhook
**Endpoint**: `POST https://team.autoprep.ai/api/lindy/presales-report`
**Lindy Agent ID**: `68aa4cb7ebbc5f9222a2696e`
**Purpose**: Generate pre-sales report using company information and profile data

### 2. Slides Generation Webhook
**Endpoint**: `POST https://team.autoprep.ai/api/lindy/slides`
**Lindy Agent ID**: `68ed392b02927e7ace232732`
**Purpose**: Generate presentation slides using slide template and profile data

---

## 📤 Pre-Sales Report Webhook Payload

### Payload Structure

```json
{
  "event_id": "string",
  "profile_slug": "string",
  "company_info": "string | object",
  "company_info_type": "text | file",
  "profile_data": {
    "id": "string",
    "user_id": "string",
    "slug": "string",
    "full_name": "string",
    "email": "string",
    "phone": "string | null",
    "company": "string | null",
    "title": "string | null",
    "linkedin_url": "string | null",
    "website": "string | null",
    "bio": "string | null",
    "expertise_areas": "string | null",
    "years_experience": "number | null",
    "education": "string | null",
    "certifications": "string | null",
    "notable_projects": "string | null",
    "awards": "string | null",
    "publications": "string | null",
    "speaking_engagements": "string | null",
    "professional_affiliations": "string | null",
    "languages": "string | null",
    "availability": "string | null",
    "preferred_contact_method": "string | null",
    "timezone": "string | null",
    "created_at": "string (ISO 8601)",
    "updated_at": "string (ISO 8601)"
  }
}
```

### Field Descriptions

#### `event_id` (string, required)
- The unique identifier for the calendar event
- Example: `"evt_abc123xyz"`

#### `profile_slug` (string, required)
- The URL-friendly slug for the user's profile
- Example: `"scott-sumerford"`

#### `company_info` (string | object, required)
- **When `company_info_type` is "text"**: Plain text string
- **When `company_info_type` is "file"**: File object (see structure below)

#### `company_info_type` (string, required)
- Indicates whether company info is text or a file
- Values: `"text"` or `"file"`

#### `profile_data` (object, required)
- Complete profile information for the user
- All fields from the profiles table

---

### Company Info File Object Structure

When `company_info_type` is `"file"`, the `company_info` field contains:

```json
{
  "filename": "string",
  "mimetype": "string",
  "size": "number",
  "data": "string (base64)"
}
```

#### Field Details:

**`filename`** (string)
- Original filename with extension
- Example: `"company-overview.pdf"`

**`mimetype`** (string)
- MIME type of the file
- Supported types:
  - `application/pdf` - PDF documents
  - `application/msword` - Word (.doc)
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Word (.docx)
  - `application/vnd.ms-excel` - Excel (.xls)
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` - Excel (.xlsx)
  - `text/plain` - Text files
  - `text/csv` - CSV files

**`size`** (number)
- File size in bytes
- Maximum: 52,428,800 bytes (50MB)
- Example: `1048576` (1MB)

**`data`** (string)
- Base64-encoded file content
- Example: `"JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNCAwIFI+Pj4+L0NvbnRlbnRzIDUgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvVGltZXMtUm9tYW4+PgplbmRvYmoKNSAwIG9iago8PC9MZW5ndGggNDQ+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQKKEhlbGxvIFdvcmxkKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY0IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKMDAwMDAwMDIzNyAwMDAwMCBuIAowMDAwMDAwMzE2IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA2L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNDA4CiUlRU9GCg=="`

---

### Example Payloads

#### Example 1: Text Company Info

```json
{
  "event_id": "evt_20251103_001",
  "profile_slug": "scott-sumerford",
  "company_info": "Acme Corporation is a leading provider of enterprise software solutions with over 500 employees worldwide. Founded in 2010, we specialize in cloud-based CRM and ERP systems.",
  "company_info_type": "text",
  "profile_data": {
    "id": "prof_123",
    "user_id": "user_456",
    "slug": "scott-sumerford",
    "full_name": "Scott Sumerford",
    "email": "scott@example.com",
    "phone": "+1-555-0123",
    "company": "AutoPrep",
    "title": "CEO",
    "linkedin_url": "https://linkedin.com/in/scottsumerford",
    "website": "https://autoprep.ai",
    "bio": "Experienced technology executive with 15+ years in SaaS",
    "expertise_areas": "SaaS, AI, Enterprise Software",
    "years_experience": 15,
    "education": "MBA, Stanford University",
    "certifications": "PMP, AWS Solutions Architect",
    "notable_projects": "Led digital transformation for Fortune 500 companies",
    "awards": "Tech Innovator of the Year 2023",
    "publications": "Author of 'The Future of Enterprise AI'",
    "speaking_engagements": "Keynote at TechCrunch Disrupt 2024",
    "professional_affiliations": "IEEE, ACM",
    "languages": "English, Spanish",
    "availability": "Available for consulting",
    "preferred_contact_method": "email",
    "timezone": "America/Chicago",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-11-03T22:00:00Z"
  }
}
```

#### Example 2: File Company Info (PDF)

```json
{
  "event_id": "evt_20251103_002",
  "profile_slug": "scott-sumerford",
  "company_info": {
    "filename": "acme-corp-overview.pdf",
    "mimetype": "application/pdf",
    "size": 2458624,
    "data": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNCAwIFI+Pj4+L0NvbnRlbnRzIDUgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvVGltZXMtUm9tYW4+PgplbmRvYmoKNSAwIG9iago8PC9MZW5ndGggNDQ+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQKKEhlbGxvIFdvcmxkKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY0IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKMDAwMDAwMDIzNyAwMDAwMCBuIAowMDAwMDAwMzE2IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA2L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNDA4CiUlRU9GCg=="
  },
  "company_info_type": "file",
  "profile_data": {
    "id": "prof_123",
    "user_id": "user_456",
    "slug": "scott-sumerford",
    "full_name": "Scott Sumerford",
    "email": "scott@example.com",
    "phone": "+1-555-0123",
    "company": "AutoPrep",
    "title": "CEO",
    "linkedin_url": "https://linkedin.com/in/scottsumerford",
    "website": "https://autoprep.ai",
    "bio": "Experienced technology executive",
    "expertise_areas": "SaaS, AI",
    "years_experience": 15,
    "education": "MBA, Stanford",
    "certifications": "PMP",
    "notable_projects": "Digital transformation projects",
    "awards": "Tech Innovator 2023",
    "publications": "Enterprise AI book",
    "speaking_engagements": "TechCrunch Disrupt",
    "professional_affiliations": "IEEE",
    "languages": "English",
    "availability": "Available",
    "preferred_contact_method": "email",
    "timezone": "America/Chicago",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-11-03T22:00:00Z"
  }
}
```

---

## 📤 Slides Generation Webhook Payload

### Payload Structure

```json
{
  "event_id": "string",
  "profile_slug": "string",
  "slide_template": {
    "filename": "string",
    "mimetype": "string",
    "size": "number",
    "data": "string (base64)"
  },
  "profile_data": {
    "id": "string",
    "user_id": "string",
    "slug": "string",
    "full_name": "string",
    "email": "string",
    "phone": "string | null",
    "company": "string | null",
    "title": "string | null",
    "linkedin_url": "string | null",
    "website": "string | null",
    "bio": "string | null",
    "expertise_areas": "string | null",
    "years_experience": "number | null",
    "education": "string | null",
    "certifications": "string | null",
    "notable_projects": "string | null",
    "awards": "string | null",
    "publications": "string | null",
    "speaking_engagements": "string | null",
    "professional_affiliations": "string | null",
    "languages": "string | null",
    "availability": "string | null",
    "preferred_contact_method": "string | null",
    "timezone": "string | null",
    "created_at": "string (ISO 8601)",
    "updated_at": "string (ISO 8601)"
  }
}
```

### Field Descriptions

#### `event_id` (string, required)
- The unique identifier for the calendar event
- Example: `"evt_abc123xyz"`

#### `profile_slug` (string, required)
- The URL-friendly slug for the user's profile
- Example: `"scott-sumerford"`

#### `slide_template` (object, required)
- PowerPoint template file for generating slides
- Always present (required for slides generation)

#### `profile_data` (object, required)
- Complete profile information for the user
- Same structure as Pre-Sales Report webhook

---

### Slide Template File Object Structure

```json
{
  "filename": "string",
  "mimetype": "string",
  "size": "number",
  "data": "string (base64)"
}
```

#### Field Details:

**`filename`** (string)
- Original filename with extension
- Example: `"presentation-template.pptx"`

**`mimetype`** (string)
- MIME type of the PowerPoint file
- Supported types:
  - `application/vnd.ms-powerpoint` - PowerPoint (.ppt)
  - `application/vnd.openxmlformats-officedocument.presentationml.presentation` - PowerPoint (.pptx)

**`size`** (number)
- File size in bytes
- Maximum: 52,428,800 bytes (50MB)
- Example: `5242880` (5MB)

**`data`** (string)
- Base64-encoded PowerPoint file content
- Full file content encoded in base64

---

### Example Payload

```json
{
  "event_id": "evt_20251103_003",
  "profile_slug": "scott-sumerford",
  "slide_template": {
    "filename": "autoprep-template.pptx",
    "mimetype": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "size": 5242880,
    "data": "UEsDBBQABgAIAAAAIQDfpNJsWgEAACAFAAATAAgCW0NvbnRlbnRfVHlwZXNdLnhtbCCiBAIooAAC..."
  },
  "profile_data": {
    "id": "prof_123",
    "user_id": "user_456",
    "slug": "scott-sumerford",
    "full_name": "Scott Sumerford",
    "email": "scott@example.com",
    "phone": "+1-555-0123",
    "company": "AutoPrep",
    "title": "CEO",
    "linkedin_url": "https://linkedin.com/in/scottsumerford",
    "website": "https://autoprep.ai",
    "bio": "Experienced technology executive with 15+ years in SaaS",
    "expertise_areas": "SaaS, AI, Enterprise Software",
    "years_experience": 15,
    "education": "MBA, Stanford University",
    "certifications": "PMP, AWS Solutions Architect",
    "notable_projects": "Led digital transformation for Fortune 500 companies",
    "awards": "Tech Innovator of the Year 2023",
    "publications": "Author of 'The Future of Enterprise AI'",
    "speaking_engagements": "Keynote at TechCrunch Disrupt 2024",
    "professional_affiliations": "IEEE, ACM",
    "languages": "English, Spanish",
    "availability": "Available for consulting",
    "preferred_contact_method": "email",
    "timezone": "America/Chicago",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-11-03T22:00:00Z"
  }
}
```

---

## 🔧 Processing Base64 File Data

### Decoding Base64 in Your Lindy Agent

To process the file data in your Lindy agent, you'll need to decode the base64 string:

#### JavaScript/Node.js Example:
```javascript
// Decode base64 to buffer
const fileBuffer = Buffer.from(fileData.data, 'base64');

// Save to file
const fs = require('fs');
fs.writeFileSync(fileData.filename, fileBuffer);

// Or process directly
// For PDF: use pdf-parse or similar
// For Word: use mammoth or docx
// For PowerPoint: use officegen or pptxgenjs
```

#### Python Example:
```python
import base64

# Decode base64 to bytes
file_bytes = base64.b64decode(file_data['data'])

# Save to file
with open(file_data['filename'], 'wb') as f:
    f.write(file_bytes)

# Or process directly
# For PDF: use PyPDF2 or pdfplumber
# For Word: use python-docx
# For PowerPoint: use python-pptx
```

---

## 📊 File Size Limits

- **Maximum file size**: 50MB (52,428,800 bytes)
- **Recommended size**: Under 10MB for optimal performance
- **Base64 overhead**: Base64 encoding increases size by ~33%
  - Example: 10MB file → ~13.3MB base64 string

---

## 🔒 Security Considerations

1. **Webhook Authentication**: Webhooks are sent from authenticated Vercel deployment
2. **Data Validation**: All file types are validated before storage
3. **Size Limits**: Enforced at upload time (50MB max)
4. **MIME Type Validation**: Only allowed file types are accepted
5. **Base64 Encoding**: Ensures safe transmission of binary data

---

## ⚠️ Error Handling

### Possible Error Scenarios:

1. **Missing Profile**: Profile not found for given slug
2. **Missing Company Info**: No company info uploaded (Pre-Sales Report)
3. **Missing Slide Template**: No template uploaded (Slides Generation)
4. **Invalid Event ID**: Calendar event not found
5. **Database Error**: Connection or query failure

### Error Response Format:
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

---

## 🧪 Testing Your Webhook Integration

### Test Checklist:

1. **Text Company Info**:
   - [ ] Receive and parse text string
   - [ ] Extract company information
   - [ ] Generate report with text data

2. **File Company Info (PDF)**:
   - [ ] Receive base64 data
   - [ ] Decode base64 to file
   - [ ] Extract text from PDF
   - [ ] Generate report with file data

3. **File Company Info (Word)**:
   - [ ] Receive base64 data
   - [ ] Decode base64 to file
   - [ ] Extract text from Word document
   - [ ] Generate report with file data

4. **Slide Template (PowerPoint)**:
   - [ ] Receive base64 data
   - [ ] Decode base64 to file
   - [ ] Load PowerPoint template
   - [ ] Populate with profile data
   - [ ] Generate final presentation

5. **Profile Data**:
   - [ ] Parse all profile fields
   - [ ] Handle null values gracefully
   - [ ] Format data for output

---

## 📞 Support

If you encounter issues with webhook payloads:

1. Check the payload structure matches this documentation
2. Verify base64 decoding is working correctly
3. Ensure file MIME types are handled properly
4. Test with small files first (< 1MB)
5. Check Lindy agent logs for errors

---

## 📝 Change Log

### Version 2.0 (November 3, 2025)
- **BREAKING CHANGE**: Removed Airtable integration
- **NEW**: Direct base64 file encoding in webhook payload
- **NEW**: `company_info_type` field to distinguish text vs file
- **NEW**: Complete file object with filename, mimetype, size, and data
- **IMPROVED**: No external dependencies (Airtable) required
- **IMPROVED**: Faster webhook delivery (no Airtable lookup)

### Version 1.0 (Previous)
- Used Airtable record IDs for file references
- Required separate Airtable API calls to retrieve files
- Limited to Airtable's file handling capabilities

---

*Documentation prepared by AutoPrep - App Developer*
*Last Updated: November 3, 2025, 10:45 PM CST*
