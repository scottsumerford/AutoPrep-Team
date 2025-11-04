# Webhook Specifications for AutoPrep Team Dashboard

This document provides detailed specifications for the webhooks that receive data from the AutoPrep Team Dashboard.

## Overview

The AutoPrep Team Dashboard sends webhook requests to two Lindy agents:
1. **Pre-Sales Report Generator** - Generates pre-sales reports for calendar events
2. **Slides Generator** - Generates presentation slides for calendar events

Both webhooks receive data directly from Supabase (no Airtable dependency).

---

## 1. Pre-Sales Report Generator Webhook

### Endpoint Configuration
- **Environment Variable**: `LINDY_PRESALES_WEBHOOK_URL`
- **Authentication**: Bearer token via `LINDY_PRESALES_WEBHOOK_SECRET`
- **Method**: POST
- **Content-Type**: application/json

### Request Headers
```
Content-Type: application/json
Authorization: Bearer {LINDY_PRESALES_WEBHOOK_SECRET}
```

### Request Payload Structure

```json
{
  "calendar_event_id": 123,
  "event_title": "Product Demo with Acme Corp",
  "event_description": "Discuss our new features and pricing",
  "attendee_email": "john.doe@acmecorp.com",
  "user_profile_id": 456,
  "webhook_callback_url": "https://team.autoprep.ai/api/lindy/webhook",
  "company_info": "...",
  "company_info_type": "text"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `calendar_event_id` | number | Yes | Unique ID of the calendar event in the database |
| `event_title` | string | Yes | Title of the calendar event |
| `event_description` | string | No | Description/notes from the calendar event |
| `attendee_email` | string | Yes | Email address of the prospect/attendee (not the user) |
| `user_profile_id` | number | Yes | ID of the user's profile in the database |
| `webhook_callback_url` | string | Yes | URL to send the completed report back to |
| `company_info` | string or object | No | Company information (see below) |
| `company_info_type` | string | No | Type of company info: "text" or "file" |

### Company Information Field

The `company_info` field can be provided in two formats:

#### Format 1: Text (when `company_info_type` = "text")
```json
{
  "company_info": "We are a SaaS company that provides...",
  "company_info_type": "text"
}
```

The `company_info` field contains plain text describing the company.

#### Format 2: File (when `company_info_type` = "file")
```json
{
  "company_info": {
    "filename": "company-info.pdf",
    "mimetype": "application/pdf",
    "size": 245678,
    "data": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNCAwIFI+Pj4+L0NvbnRlbnRzIDUgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCjUgMCBvYmoKPDwvTGVuZ3RoIDQ0Pj4Kc3RyZWFtCkJUCi9GMSA0OCBUZgoxMCA3MDAgVGQKKEhlbGxvIFdvcmxkKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY0IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKMDAwMDAwMDIzNyAwMDAwMCBuIAowMDAwMDAwMzE2IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA2L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNDA4CiUlRU9GCg=="
  },
  "company_info_type": "file"
}
```

The `company_info` field contains an object with:
- `filename`: Original filename
- `mimetype`: MIME type (e.g., "application/pdf", "application/msword", etc.)
- `size`: File size in bytes
- `data`: Base64-encoded file content

**Supported File Types:**
- PDF: `application/pdf`
- Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Excel: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Text: `text/plain`, `text/csv`

### Processing the Company Info

**For Text:**
```javascript
if (payload.company_info_type === 'text') {
  const companyDescription = payload.company_info;
  // Use the text directly in your report generation
}
```

**For File:**
```javascript
if (payload.company_info_type === 'file') {
  const fileInfo = payload.company_info;
  const filename = fileInfo.filename;
  const mimetype = fileInfo.mimetype;
  const base64Data = fileInfo.data;
  
  // Decode base64 to binary
  const fileBuffer = Buffer.from(base64Data, 'base64');
  
  // Process the file based on mimetype
  // For PDF: extract text, parse content
  // For Word/Excel: convert and extract content
}
```

### Expected Response

The webhook should eventually call back to `webhook_callback_url` with the generated report.

---

## 2. Slides Generator Webhook

### Endpoint Configuration
- **Environment Variable**: `LINDY_SLIDES_WEBHOOK_URL`
- **Authentication**: Bearer token via `LINDY_SLIDES_WEBHOOK_SECRET`
- **Method**: POST
- **Content-Type**: application/json

### Request Headers
```
Content-Type: application/json
Authorization: Bearer {LINDY_SLIDES_WEBHOOK_SECRET}
```

### Request Payload Structure

```json
{
  "calendar_event_id": 123,
  "event_title": "Product Demo with Acme Corp",
  "event_description": "Discuss our new features and pricing",
  "attendee_email": "john.doe@acmecorp.com",
  "user_profile_id": 456,
  "webhook_url": "https://team.autoprep.ai/api/lindy/webhook",
  "slide_template": {
    "filename": "template.pptx",
    "mimetype": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "size": 1245678,
    "data": "UEsDBBQABgAIAAAAIQDfpNJsWgEAACAFAAATAAgCW0NvbnRlbnRfVHlwZXNdLnhtbCCiBAIooAAC..."
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `calendar_event_id` | number | Yes | Unique ID of the calendar event in the database |
| `event_title` | string | Yes | Title of the calendar event |
| `event_description` | string | No | Description/notes from the calendar event |
| `attendee_email` | string | Yes | Email address of the prospect/attendee (not the user) |
| `user_profile_id` | number | Yes | ID of the user's profile in the database |
| `webhook_url` | string | Yes | URL to send the completed slides back to |
| `slide_template` | object | No | Slide template file (see below) |

### Slide Template Field

The `slide_template` field contains an object with the uploaded template file:

```json
{
  "slide_template": {
    "filename": "company-template.pptx",
    "mimetype": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "size": 1245678,
    "data": "UEsDBBQABgAIAAAAIQDfpNJsWgEAACAFAAATAAgCW0NvbnRlbnRfVHlwZXNdLnhtbCCiBAIooAAC..."
  }
}
```

**Fields:**
- `filename`: Original filename of the template
- `mimetype`: MIME type of the file
- `size`: File size in bytes
- `data`: Base64-encoded file content

**Supported File Types:**
- PowerPoint: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- PDF: `application/pdf`

### Processing the Slide Template

```javascript
if (payload.slide_template) {
  const template = payload.slide_template;
  const filename = template.filename;
  const mimetype = template.mimetype;
  const base64Data = template.data;
  
  // Decode base64 to binary
  const fileBuffer = Buffer.from(base64Data, 'base64');
  
  // Process the template file
  // For PPTX: load template, modify slides, add content
  // For PDF: use as reference for styling
}
```

### Expected Response

The webhook should eventually call back to `webhook_url` with the generated slides.

---

## Callback Webhook (Response from Lindy Agents)

Both agents should call back to the provided callback URL when processing is complete.

### Callback URL
- Provided in request as `webhook_callback_url` (Pre-Sales) or `webhook_url` (Slides)
- Default: `https://team.autoprep.ai/api/lindy/webhook`

### Callback Payload Structure

**For Pre-Sales Report:**
```json
{
  "calendar_event_id": 123,
  "report_url": "https://storage.example.com/reports/report-123.pdf",
  "report_content": "Full text content of the report...",
  "status": "completed"
}
```

**For Slides:**
```json
{
  "calendar_event_id": 123,
  "slides_url": "https://storage.example.com/slides/slides-123.pptx",
  "status": "completed"
}
```

---

## Testing

### Sample cURL Commands

**Pre-Sales Report (with text):**
```bash
curl -X POST https://your-lindy-webhook-url.com/presales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "calendar_event_id": 123,
    "event_title": "Demo Meeting",
    "event_description": "Product demo",
    "attendee_email": "prospect@example.com",
    "user_profile_id": 456,
    "webhook_callback_url": "https://team.autoprep.ai/api/lindy/webhook",
    "company_info": "We are a SaaS company...",
    "company_info_type": "text"
  }'
```

**Slides Generation:**
```bash
curl -X POST https://your-lindy-webhook-url.com/slides \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "calendar_event_id": 123,
    "event_title": "Demo Meeting",
    "event_description": "Product demo",
    "attendee_email": "prospect@example.com",
    "user_profile_id": 456,
    "webhook_url": "https://team.autoprep.ai/api/lindy/webhook",
    "slide_template": {
      "filename": "template.pptx",
      "mimetype": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "size": 1245678,
      "data": "UEsDBBQABgAI..."
    }
  }'
```

---

## Summary

### Key Changes from Previous Implementation

1. **No Airtable Dependency**: Files and data are stored directly in Supabase
2. **Flexible Company Info**: Can be provided as text OR file
3. **Base64 Encoding**: All files are base64-encoded for JSON transmission
4. **File Metadata**: Includes filename, mimetype, and size for proper handling
5. **Direct Database Storage**: All uploads go directly to Supabase PostgreSQL

### Database Schema

**Profiles Table (Supabase):**
- `company_info_file` (TEXT): JSON string containing file metadata and base64 data
- `company_info_text` (TEXT): Plain text company description
- `slides_file` (TEXT): JSON string containing slide template metadata and base64 data

**Priority**: Text company info takes precedence over file if both are present.

---

## Support

For questions or issues with webhook integration, contact the AutoPrep Team Dashboard development team.

**Last Updated**: November 3, 2025
