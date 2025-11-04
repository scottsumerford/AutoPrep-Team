# Webhook Quick Reference Guide

## For Lindy Agent Developers

This is a quick reference for developers building Lindy agents that receive webhooks from the AutoPrep Team Dashboard.

---

## 1. Pre-Sales Report Webhook

### What You'll Receive

```json
{
  "calendar_event_id": 123,
  "event_title": "Product Demo with Acme Corp",
  "event_description": "Discuss features and pricing",
  "attendee_email": "john.doe@acmecorp.com",
  "user_profile_id": 456,
  "webhook_callback_url": "https://team.autoprep.ai/api/lindy/webhook",
  "company_info": "...",
  "company_info_type": "text"
}
```

### Company Info - Two Formats

#### Option 1: Text (Simple)
```json
{
  "company_info": "We are a SaaS company that provides...",
  "company_info_type": "text"
}
```

**How to use**:
```javascript
if (payload.company_info_type === 'text') {
  const companyDescription = payload.company_info;
  // Use directly in your report
}
```

#### Option 2: File (Base64)
```json
{
  "company_info": {
    "filename": "company-info.pdf",
    "mimetype": "application/pdf",
    "size": 245678,
    "data": "JVBERi0xLjQKJeLjz9MK..."
  },
  "company_info_type": "file"
}
```

**How to use**:
```javascript
if (payload.company_info_type === 'file') {
  const file = payload.company_info;
  const buffer = Buffer.from(file.data, 'base64');
  // Process the file (PDF, Word, Excel, etc.)
}
```

### What to Send Back

When your report is ready, POST to `webhook_callback_url`:

```json
{
  "calendar_event_id": 123,
  "report_url": "https://storage.example.com/reports/report-123.pdf",
  "report_content": "Full text of the report...",
  "status": "completed"
}
```

---

## 2. Slides Generation Webhook

### What You'll Receive

```json
{
  "calendar_event_id": 123,
  "event_title": "Product Demo with Acme Corp",
  "event_description": "Discuss features and pricing",
  "attendee_email": "john.doe@acmecorp.com",
  "user_profile_id": 456,
  "webhook_url": "https://team.autoprep.ai/api/lindy/webhook",
  "slide_template": {
    "filename": "template.pptx",
    "mimetype": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "size": 1245678,
    "data": "UEsDBBQABgAI..."
  }
}
```

### Slide Template Format

```json
{
  "filename": "company-template.pptx",
  "mimetype": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "size": 1245678,
  "data": "base64_encoded_content..."
}
```

**How to use**:
```javascript
if (payload.slide_template) {
  const template = payload.slide_template;
  const buffer = Buffer.from(template.data, 'base64');
  // Load and modify the PowerPoint template
}
```

### What to Send Back

When your slides are ready, POST to `webhook_url`:

```json
{
  "calendar_event_id": 123,
  "slides_url": "https://storage.example.com/slides/slides-123.pptx",
  "status": "completed"
}
```

---

## File Types You Might Receive

### Company Info Files
- PDF: `application/pdf`
- Word: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Excel: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Text: `text/plain`, `text/csv`

### Slide Template Files
- PowerPoint: `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- PDF: `application/pdf`

---

## Authentication

All webhooks include:
```
Authorization: Bearer {SECRET_TOKEN}
```

Verify this token matches your configured secret.

---

## Error Handling

If processing fails, POST to callback URL:

```json
{
  "calendar_event_id": 123,
  "status": "failed",
  "error": "Description of what went wrong"
}
```

---

## Testing

### Decode Base64 in Node.js
```javascript
const buffer = Buffer.from(base64String, 'base64');
fs.writeFileSync('output.pdf', buffer);
```

### Decode Base64 in Python
```python
import base64
file_data = base64.b64decode(base64_string)
with open('output.pdf', 'wb') as f:
    f.write(file_data)
```

---

## Common Issues

### Issue: "File data is too large"
**Solution**: The base64 encoding increases size by ~33%. Ensure your webhook can handle payloads up to 70MB.

### Issue: "Can't parse file"
**Solution**: Check the `mimetype` field and use appropriate parser for that file type.

### Issue: "No company info received"
**Solution**: Company info is optional. Check if `company_info` field exists before processing.

---

## Need More Details?

See `WEBHOOK_SPECIFICATIONS.md` for complete documentation.

---

**Last Updated**: November 3, 2025
