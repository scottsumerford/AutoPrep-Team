# 📋 Webhook Payload Documentation - CORRECTED
**For Lindy Agent Integration**
**Last Updated**: November 3, 2025, 10:55 PM CST

---

## ⚠️ IMPORTANT: Actual Webhook Payload Structure

The webhooks send the following fields (verified from source code):

### Pre-Sales Report Webhook
**URL**: `POST https://team.autoprep.ai/api/lindy/presales-report`
**Agent ID**: `68aa4cb7ebbc5f9222a2696e`

### Actual Payload Structure:
```json
{
  "calendar_event_id": "evt_123",
  "event_title": "Meeting with Acme Corp",
  "event_description": "Discuss Q4 partnership opportunities",
  "attendee_email": "john@acmecorp.com",
  "user_profile_id": 1,
  "webhook_callback_url": "https://team.autoprep.ai/api/lindy/webhook",
  "company_info": "string" | {
    "filename": "company.pdf",
    "mimetype": "application/pdf",
    "size": 1048576,
    "data": "base64_encoded_content"
  },
  "company_info_type": "text" | "file"
}
```

### Field Descriptions:

#### `calendar_event_id` (string, required)
The unique identifier for the calendar event from the database.
**Example**: `"evt_123"`, `"20251103_meeting_001"`

#### `event_title` (string, required)
The title/subject of the calendar event.
**Example**: `"Meeting with Acme Corp"`, `"Q4 Strategy Discussion"`

#### `event_description` (string, optional)
The description or notes for the calendar event. May be empty string.
**Example**: `"Discuss Q4 partnership opportunities"`, `""`

#### `attendee_email` (string, required)
The email address of the OTHER attendee (not the user's email).
**Example**: `"john@acmecorp.com"`, `"sarah@techstartup.io"`

#### `user_profile_id` (number, required)
The database ID of the user's profile.
**Example**: `1`, `42`

#### `webhook_callback_url` (string, required)
The URL where the Lindy agent should send the results back.
**Example**: `"https://team.autoprep.ai/api/lindy/webhook"`

#### `company_info` (string | object, optional)
Company information provided by the user. Can be either:
- **Text**: Plain string with company description
- **File**: Object with base64-encoded file data

**Text Example**:
```json
"company_info": "Acme Corp is a leading software company specializing in enterprise solutions..."
```

**File Example**:
```json
"company_info": {
  "filename": "acme_corp_info.pdf",
  "mimetype": "application/pdf",
  "size": 1048576,
  "data": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA0OCBUZgoxMCA3MDAgVGQKKEhlbGxvIFdvcmxkKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDc0IDAwMDAwIG4gCjAwMDAwMDAxNTMgMDAwMDAgbiAKMDAwMDAwMDI3MSAwMDAwMCBuIAowMDAwMDAwMzU5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDUzCiUlRU9GCg=="
}
```

#### `company_info_type` (string, optional)
Indicates whether `company_info` is text or file.
**Values**: `"text"` or `"file"`

---

## Slides Generation Webhook
**URL**: `POST https://team.autoprep.ai/api/lindy/slides`
**Agent ID**: `68ed392b02927e7ace232732`

### Actual Payload Structure:
```json
{
  "calendar_event_id": "evt_123",
  "event_title": "Meeting with Acme Corp",
  "event_description": "Discuss Q4 partnership opportunities",
  "attendee_email": "john@acmecorp.com",
  "user_profile_id": 1,
  "webhook_url": "https://team.autoprep.ai/api/lindy/webhook",
  "slide_template": {
    "filename": "template.pptx",
    "mimetype": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "size": 5242880,
    "data": "base64_encoded_powerpoint_content"
  }
}
```

### Field Descriptions:

#### `calendar_event_id` (string, required)
The unique identifier for the calendar event.

#### `event_title` (string, required)
The title of the calendar event.

#### `event_description` (string, optional)
The description of the calendar event.

#### `attendee_email` (string, required)
The email address of the other attendee.

#### `user_profile_id` (number, required)
The database ID of the user's profile.

#### `webhook_url` (string, required)
The callback URL for results.
**Note**: This field is called `webhook_url` in slides webhook but `webhook_callback_url` in presales webhook.

#### `slide_template` (object, optional)
PowerPoint template file with base64-encoded data.

---

## 🔑 Key Points for Your Lindy Agents

### 1. Calendar Event Information
Your agents receive complete event context:
- **Event ID**: `calendar_event_id` (not just `event_id`)
- **Event Title**: `event_title`
- **Event Description**: `event_description` (may be empty)
- **Attendee Email**: `attendee_email` (the OTHER person, not the user)

### 2. User Profile ID
- `user_profile_id` is the database ID
- Use this to look up additional profile information if needed

### 3. Callback URL
- **Pre-sales webhook**: Uses `webhook_callback_url`
- **Slides webhook**: Uses `webhook_url`
- Send your results back to this URL when complete

### 4. Company Info Handling
```javascript
// Check if company info exists and what type
if (payload.company_info_type === "text") {
  const companyText = payload.company_info;
  // Use text directly
} else if (payload.company_info_type === "file") {
  const fileData = payload.company_info;
  // Decode base64
  const fileBuffer = Buffer.from(fileData.data, 'base64');
  // Process file (PDF, Word, etc.)
}
```

### 5. Slide Template Handling
```javascript
if (payload.slide_template) {
  const template = payload.slide_template;
  // Decode base64 PowerPoint
  const pptxBuffer = Buffer.from(template.data, 'base64');
  // Load and modify template
}
```

---

## 📤 Example: Complete Pre-Sales Report Payload

```json
{
  "calendar_event_id": "evt_20251103_001",
  "event_title": "Q4 Partnership Discussion with Acme Corp",
  "event_description": "Discuss potential partnership opportunities for Q4 2025. Focus on enterprise solutions and integration capabilities.",
  "attendee_email": "john.smith@acmecorp.com",
  "user_profile_id": 1,
  "webhook_callback_url": "https://team.autoprep.ai/api/lindy/webhook",
  "company_info_type": "file",
  "company_info": {
    "filename": "acme_corp_overview.pdf",
    "mimetype": "application/pdf",
    "size": 2458624,
    "data": "JVBERi0xLjQKJeLjz9MK... [truncated base64 data]"
  }
}
```

---

## 📤 Example: Complete Slides Generation Payload

```json
{
  "calendar_event_id": "evt_20251103_002",
  "event_title": "Product Demo for TechStartup Inc",
  "event_description": "Demonstrate our platform capabilities and answer technical questions.",
  "attendee_email": "sarah@techstartup.io",
  "user_profile_id": 1,
  "webhook_url": "https://team.autoprep.ai/api/lindy/webhook",
  "slide_template": {
    "filename": "demo_template.pptx",
    "mimetype": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "size": 5832704,
    "data": "UEsDBBQABgAIAAAAIQDd... [truncated base64 data]"
  }
}
```

---

## ✅ What Your Agents Should Do

### Pre-Sales Report Agent:
1. ✅ Receive webhook with event details and company info
2. ✅ Check `company_info_type` (text or file)
3. ✅ If file, decode base64 and extract text
4. ✅ Use event context (`event_title`, `event_description`, `attendee_email`)
5. ✅ Generate personalized pre-sales report
6. ✅ Upload report to storage
7. ✅ Send result back to `webhook_callback_url` with:
   ```json
   {
     "calendar_event_id": "evt_123",
     "status": "completed",
     "report_url": "https://storage.example.com/report.pdf"
   }
   ```

### Slides Generation Agent:
1. ✅ Receive webhook with event details and slide template
2. ✅ Decode base64 PowerPoint template
3. ✅ Load template file
4. ✅ Use event context to personalize slides
5. ✅ Generate final presentation
6. ✅ Upload presentation to storage
7. ✅ Send result back to `webhook_url` with:
   ```json
   {
     "calendar_event_id": "evt_123",
     "status": "completed",
     "slides_url": "https://storage.example.com/slides.pptx"
   }
   ```

---

## 🔍 Testing Checklist

- [ ] Verify `calendar_event_id` is received correctly
- [ ] Verify `event_title` is received correctly
- [ ] Verify `event_description` is received (may be empty)
- [ ] Verify `attendee_email` is received correctly
- [ ] Verify `user_profile_id` is received correctly
- [ ] Verify callback URL is received correctly
- [ ] Test with text company info
- [ ] Test with file company info (PDF)
- [ ] Test base64 decoding
- [ ] Test file processing (PDF text extraction)
- [ ] Test PowerPoint template loading
- [ ] Test callback response format

---

*Documentation corrected based on actual source code analysis*
*November 3, 2025, 10:55 PM CST*
