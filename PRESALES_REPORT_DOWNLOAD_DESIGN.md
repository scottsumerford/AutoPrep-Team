# Pre-Sales Report Download - Design Document

## Current Flow Analysis

### How It Works Now
1. User triggers pre-sales report generation from calendar event
2. Webhook calls Lindy agent (68aa4cb7ebbc5f9222a2696e) with event details + company info
3. Lindy agent generates report
4. Agent calls back to `/api/lindy/webhook` with:
   - `pdf_url` (if agent generates PDF), OR
   - `report_content` (markdown/text content)
5. System stores in database:
   - `presales_report_url` (PDF URL or data URL)
   - `presales_report_content` (text content)
   - `presales_report_status` (completed/failed)

### Current Storage
Reports are stored in `calendar_events` table:
- `presales_report_url` - TEXT (PDF URL or base64 data URL)
- `presales_report_content` - TEXT (markdown/text content)
- `presales_report_status` - VARCHAR (pending/processing/completed/failed)
- `presales_report_generated_at` - TIMESTAMP

---

## Recommended Solution: Hybrid Approach

### Option 1: Store in Supabase Storage (RECOMMENDED) ⭐

**How it works:**
1. Lindy agent generates report (PDF or markdown)
2. Agent uploads report to Supabase Storage bucket "Reports"
3. Agent calls webhook with file URL
4. System stores URL in database
5. User downloads from Supabase Storage URL

**Advantages:**
- ✅ Consistent with file upload approach
- ✅ Scalable for large reports
- ✅ CDN-ready for fast downloads
- ✅ No database size limits
- ✅ Easy to implement file versioning
- ✅ Can generate signed URLs for security

**Implementation:**
```typescript
// Lindy agent workflow:
1. Generate report content
2. Convert to PDF if needed
3. Upload to Supabase Storage: Reports/{event_id}/{timestamp}_report.pdf
4. Get public URL
5. Call webhook with: { pdf_url: "https://..." }

// Backend webhook handler:
1. Receive pdf_url
2. Store in calendar_events.presales_report_url
3. Update status to 'completed'

// Frontend download:
1. Fetch event from database
2. Display download button with presales_report_url
3. User clicks → direct download from Supabase
```

---

### Option 2: Return File in Webhook Response (SIMPLE)

**How it works:**
1. Lindy agent generates report
2. Agent returns report content/URL in webhook callback
3. System stores in database (URL or base64)
4. User downloads via API endpoint that serves from database

**Advantages:**
- ✅ Simple implementation
- ✅ No additional storage setup
- ✅ Works with current webhook flow

**Disadvantages:**
- ❌ Large reports stored in database (not ideal)
- ❌ Slower downloads for large files
- ❌ Database size concerns

**Implementation:**
```typescript
// Webhook callback receives:
{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": "123",
  "status": "completed",
  "pdf_url": "https://..." OR "report_content": "markdown..."
}

// Download endpoint: /api/events/[id]/download-report
export async function GET(request, { params }) {
  const event = await getEventById(params.id);
  if (event.presales_report_url.startsWith('http')) {
    // Redirect to external URL
    return NextResponse.redirect(event.presales_report_url);
  } else {
    // Serve from database (base64 data URL)
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="report.pdf"'
      }
    });
  }
}
```

---

### Option 3: Email Report to User

**How it works:**
1. Lindy agent generates report
2. Agent emails report directly to user
3. Webhook updates status only
4. User downloads from email

**Advantages:**
- ✅ User gets immediate notification
- ✅ No storage needed in our system
- ✅ Works offline

**Disadvantages:**
- ❌ No central repository
- ❌ Email size limits
- ❌ Spam filters may block
- ❌ No version history

---

### Option 4: Temporary Download Link

**How it works:**
1. Lindy agent uploads to temporary storage (S3, Cloudflare R2, etc.)
2. Agent generates signed URL (expires in 24-48 hours)
3. Webhook returns signed URL
4. User downloads within expiration window

**Advantages:**
- ✅ Secure (time-limited access)
- ✅ No long-term storage costs
- ✅ Fast downloads

**Disadvantages:**
- ❌ Links expire (user must download quickly)
- ❌ No permanent archive
- ❌ Requires additional service

---

## Recommended Implementation: Option 1 (Supabase Storage)

### Step 1: Create Supabase Storage Bucket for Reports

```sql
-- Create "Reports" bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('Reports', 'Reports', true);

-- Create RLS policies
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'Reports');

CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'Reports');
```

### Step 2: Update Lindy Agent Workflow

**Agent needs to:**
1. Generate report (PDF or markdown)
2. Upload to Supabase Storage:
   - Bucket: `Reports`
   - Path: `{event_id}/{timestamp}_presales_report.pdf`
   - Get public URL
3. Call webhook with URL:
```json
{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": "123",
  "status": "completed",
  "pdf_url": "https://kmswrzzlirdfnzzbnrpo.supabase.co/storage/v1/object/public/Reports/123/1762307523292_presales_report.pdf"
}
```

### Step 3: Update Webhook Handler (Already Done!)

The webhook handler already supports `pdf_url`:
```typescript
if (status === 'completed' && pdf_url) {
  await updateEventPresalesStatus(
    parseInt(calendar_event_id), 
    'completed', 
    pdf_url
  );
}
```

### Step 4: Add Download Endpoint

```typescript
// app/api/events/[id]/download-report/route.ts
export async function GET(request, { params }) {
  const event = await getEventById(parseInt(params.id));
  
  if (!event || !event.presales_report_url) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }
  
  // Redirect to Supabase Storage URL
  return NextResponse.redirect(event.presales_report_url);
}
```

### Step 5: Update Frontend

```tsx
// In calendar event component
{event.presales_report_status === 'completed' && (
  <Button asChild>
    <a 
      href={event.presales_report_url} 
      download
      target="_blank"
    >
      <Download className="mr-2 h-4 w-4" />
      Download Report
    </a>
  </Button>
)}
```

---

## Alternative: If Lindy Agent Can't Upload to Supabase

If the Lindy agent cannot directly upload to Supabase Storage, use this flow:

### Modified Flow
1. Lindy agent generates report
2. Agent calls webhook with `report_content` (markdown/text)
3. Backend receives content and:
   - Generates PDF from content
   - Uploads PDF to Supabase Storage
   - Stores URL in database
4. User downloads from Supabase Storage

**Implementation:**
```typescript
// In webhook handler
if (status === 'completed' && report_content) {
  // Generate PDF
  const pdfBuffer = await generatePdfFromContent(report_content, event_title);
  
  // Upload to Supabase Storage
  const timestamp = Date.now();
  const filePath = `${calendar_event_id}/${timestamp}_presales_report.pdf`;
  const pdfUrl = await uploadFileToSupabase('Reports', filePath, pdfBuffer, 'application/pdf');
  
  // Store URL in database
  await updateEventPresalesStatus(
    parseInt(calendar_event_id), 
    'completed', 
    pdfUrl,
    report_content
  );
}
```

---

## Security Considerations

### Public vs Private Reports

**Option A: Public URLs (Current)**
- Reports accessible to anyone with URL
- URLs not easily guessable (timestamp + event ID)
- Good for: Internal tools, trusted users

**Option B: Signed URLs (More Secure)**
```typescript
// Generate signed URL (expires in 1 hour)
const signedUrl = await getSignedUrl('Reports', filePath, 3600);
```

**Option C: Authenticated Downloads**
```typescript
// Require authentication to download
export async function GET(request, { params }) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const event = await getEventById(parseInt(params.id));
  // Check if user owns this event
  if (event.profile_id !== session.user.profile_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  return NextResponse.redirect(event.presales_report_url);
}
```

---

## Recommended Next Steps

1. **Create "Reports" bucket in Supabase** (5 minutes)
2. **Update Lindy agent to upload to Supabase** (agent configuration)
3. **Add download button to frontend** (10 minutes)
4. **Test end-to-end flow** (5 minutes)

**Total Implementation Time: ~30 minutes**

---

## Questions to Answer

1. **Can the Lindy agent upload directly to Supabase Storage?**
   - If YES → Use Option 1 (agent uploads)
   - If NO → Use modified flow (backend uploads)

2. **What format does the agent generate?**
   - PDF → Store as-is
   - Markdown/Text → Convert to PDF first

3. **Security requirements?**
   - Public URLs → Simple, fast
   - Signed URLs → More secure, time-limited
   - Authenticated → Most secure, requires login

4. **Storage duration?**
   - Permanent → Keep in Supabase
   - Temporary → Use signed URLs with expiration
   - Archive → Move old reports to cold storage

---

## Cost Considerations

**Supabase Storage Pricing:**
- Free tier: 1GB storage, 2GB bandwidth
- Pro tier: $0.021/GB storage, $0.09/GB bandwidth

**Estimated costs for 100 reports/month:**
- Average report size: 500KB
- Storage: 50MB = $0.001/month
- Downloads (1x each): 50MB = $0.004/month
- **Total: ~$0.01/month** (negligible)

---

## Conclusion

**Recommended: Option 1 - Supabase Storage**

This approach:
- ✅ Scales well
- ✅ Consistent with file upload system
- ✅ Fast downloads via CDN
- ✅ Low cost
- ✅ Easy to implement
- ✅ Supports versioning and history

**Next Action:** Create "Reports" bucket and update Lindy agent configuration.
