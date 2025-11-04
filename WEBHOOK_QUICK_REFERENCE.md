# 🚀 Webhook Quick Reference Guide
**For Lindy Agent Configuration**

---

## 📍 Webhook URLs

### Pre-Sales Report Webhook
```
POST https://team.autoprep.ai/api/lindy/presales-report
```
**Agent ID**: `68aa4cb7ebbc5f9222a2696e`

### Slides Generation Webhook
```
POST https://team.autoprep.ai/api/lindy/slides
```
**Agent ID**: `68ed392b02927e7ace232732`

---

## 📥 What You'll Receive

### Pre-Sales Report Payload (Simplified)
```json
{
  "event_id": "evt_123",
  "profile_slug": "scott-sumerford",
  "company_info_type": "text" | "file",
  "company_info": "text string" | {
    "filename": "company.pdf",
    "mimetype": "application/pdf",
    "size": 1048576,
    "data": "base64_encoded_file_content"
  },
  "profile_data": {
    "full_name": "Scott Sumerford",
    "email": "scott@example.com",
    "company": "AutoPrep",
    "title": "CEO",
    "bio": "...",
    "expertise_areas": "...",
    // ... all profile fields
  }
}
```

### Slides Generation Payload (Simplified)
```json
{
  "event_id": "evt_123",
  "profile_slug": "scott-sumerford",
  "slide_template": {
    "filename": "template.pptx",
    "mimetype": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "size": 5242880,
    "data": "base64_encoded_powerpoint_content"
  },
  "profile_data": {
    "full_name": "Scott Sumerford",
    // ... all profile fields
  }
}
```

---

## 🔑 Key Points for Configuration

### 1. Check `company_info_type` First
```javascript
if (payload.company_info_type === "text") {
  // company_info is a plain string
  const companyText = payload.company_info;
} else if (payload.company_info_type === "file") {
  // company_info is a file object with base64 data
  const fileData = payload.company_info;
  const decoded = Buffer.from(fileData.data, 'base64');
}
```

### 2. Decode Base64 Files
```javascript
// Node.js/JavaScript
const fileBuffer = Buffer.from(fileData.data, 'base64');
fs.writeFileSync(fileData.filename, fileBuffer);
```

```python
# Python
import base64
file_bytes = base64.b64decode(file_data['data'])
with open(file_data['filename'], 'wb') as f:
    f.write(file_bytes)
```

### 3. Handle File Types
- **PDF**: `application/pdf`
- **Word (.docx)**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Word (.doc)**: `application/msword`
- **Excel (.xlsx)**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **PowerPoint (.pptx)**: `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- **Text**: `text/plain`
- **CSV**: `text/csv`

---

## ⚡ Quick Setup Steps

### For Pre-Sales Report Agent:

1. **Configure Webhook URL**: `https://team.autoprep.ai/api/lindy/presales-report`
2. **Set Method**: POST
3. **Expected Fields**:
   - `event_id` (string)
   - `profile_slug` (string)
   - `company_info_type` (string: "text" or "file")
   - `company_info` (string or object)
   - `profile_data` (object with all profile fields)

4. **Your Agent Should**:
   - Check if `company_info_type` is "text" or "file"
   - If "file", decode base64 data
   - Extract text from file (PDF/Word/etc.)
   - Use profile data to personalize report
   - Generate pre-sales report
   - Return report URL or content

### For Slides Generation Agent:

1. **Configure Webhook URL**: `https://team.autoprep.ai/api/lindy/slides`
2. **Set Method**: POST
3. **Expected Fields**:
   - `event_id` (string)
   - `profile_slug` (string)
   - `slide_template` (object with base64 PowerPoint)
   - `profile_data` (object with all profile fields)

4. **Your Agent Should**:
   - Decode base64 PowerPoint template
   - Load template file
   - Populate slides with profile data
   - Generate final presentation
   - Return presentation URL or content

---

## 📊 File Size Limits

- **Maximum**: 50MB (52,428,800 bytes)
- **Recommended**: Under 10MB
- **Base64 Overhead**: ~33% larger than original file

---

## 🧪 Test Scenarios

### Test 1: Text Company Info
```json
{
  "company_info_type": "text",
  "company_info": "Acme Corp is a leading software company..."
}
```
✅ Your agent should process this as plain text

### Test 2: PDF Company Info
```json
{
  "company_info_type": "file",
  "company_info": {
    "filename": "company.pdf",
    "mimetype": "application/pdf",
    "size": 1048576,
    "data": "JVBERi0xLjQK..."
  }
}
```
✅ Your agent should decode base64 and extract PDF text

### Test 3: PowerPoint Template
```json
{
  "slide_template": {
    "filename": "template.pptx",
    "mimetype": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "size": 5242880,
    "data": "UEsDBBQABgAI..."
  }
}
```
✅ Your agent should decode base64 and load PowerPoint

---

## 🔍 Debugging Tips

1. **Check payload structure**: Log the entire payload to see what you're receiving
2. **Verify base64 decoding**: Test with a small file first
3. **Check MIME types**: Ensure your agent handles the file type
4. **Test with small files**: Start with files under 1MB
5. **Handle null values**: Profile fields can be null

---

## 📞 Common Issues

### Issue: "Can't decode base64"
**Solution**: Ensure you're using the correct base64 decoder for your language

### Issue: "File too large"
**Solution**: Files over 50MB are rejected at upload time

### Issue: "Can't extract text from PDF"
**Solution**: Use a PDF parsing library (pdf-parse, PyPDF2, etc.)

### Issue: "PowerPoint template not loading"
**Solution**: Ensure you're using a PowerPoint library (python-pptx, pptxgenjs, etc.)

---

## 📚 Full Documentation

For complete details, see: `WEBHOOK_PAYLOAD_DOCUMENTATION.md`

---

*Quick Reference prepared by AutoPrep - App Developer*
*Last Updated: November 3, 2025*
