# ✅ Webhook Fields Summary - VERIFIED
**Last Updated**: November 3, 2025, 10:56 PM CST

---

## 🎯 Quick Answer: YES, All Event Information is Passed!

Your webhooks ARE passing all the calendar event information that the "Generate Pre-Sales Report" button was originally sending.

---

## 📋 Pre-Sales Report Webhook Fields

**URL**: `POST https://team.autoprep.ai/api/lindy/presales-report`

### Fields Sent (Verified from Source Code):

✅ **`calendar_event_id`** - The unique event ID from database
✅ **`event_title`** - The title of the calendar event
✅ **`event_description`** - The description/notes (may be empty string)
✅ **`attendee_email`** - The OTHER attendee's email (not the user's)
✅ **`user_profile_id`** - The user's profile database ID
✅ **`webhook_callback_url`** - Where to send results back
✅ **`company_info`** - Company information (text or file object)
✅ **`company_info_type`** - "text" or "file"

### Example Payload:
```json
{
  "calendar_event_id": "evt_123",
  "event_title": "Meeting with Acme Corp",
  "event_description": "Discuss Q4 partnership opportunities",
  "attendee_email": "john@acmecorp.com",
  "user_profile_id": 1,
  "webhook_callback_url": "https://team.autoprep.ai/api/lindy/webhook",
  "company_info_type": "text",
  "company_info": "Acme Corp is a leading software company..."
}
```

---

## 📋 Slides Generation Webhook Fields

**URL**: `POST https://team.autoprep.ai/api/lindy/slides`

### Fields Sent (Verified from Source Code):

✅ **`calendar_event_id`** - The unique event ID from database
✅ **`event_title`** - The title of the calendar event
✅ **`event_description`** - The description/notes (may be empty string)
✅ **`attendee_email`** - The OTHER attendee's email (not the user's)
✅ **`user_profile_id`** - The user's profile database ID
✅ **`webhook_url`** - Where to send results back (note: different field name)
✅ **`slide_template`** - PowerPoint template file object (if uploaded)

### Example Payload:
```json
{
  "calendar_event_id": "evt_123",
  "event_title": "Product Demo for TechStartup Inc",
  "event_description": "Demonstrate our platform capabilities",
  "attendee_email": "sarah@techstartup.io",
  "user_profile_id": 1,
  "webhook_url": "https://team.autoprep.ai/api/lindy/webhook",
  "slide_template": {
    "filename": "template.pptx",
    "mimetype": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "size": 5242880,
    "data": "base64_encoded_content"
  }
}
```

---

## 🔍 What the Original Button Sent

The "Generate Pre-Sales Report" button sends:
```javascript
{
  event_id: event.id,
  event_title: event.title,
  event_description: event.description || '',
  attendee_email: otherAttendeeEmail,
}
```

## ✅ What the Webhook Sends

The webhook receives those fields and adds more:
```javascript
{
  calendar_event_id: event_id,        // ← Same as event_id from button
  event_title: event_title,           // ← Same from button
  event_description: event_description, // ← Same from button
  attendee_email: attendee_email,     // ← Same from button
  user_profile_id: profile.id,        // ← ADDED: Profile ID
  webhook_callback_url: "...",        // ← ADDED: Callback URL
  company_info: "...",                // ← ADDED: Company info
  company_info_type: "text|file"      // ← ADDED: Info type
}
```

---

## 🎯 Key Takeaways

1. ✅ **All original event information is preserved and sent**
2. ✅ **Additional context is added** (profile ID, company info, callback URL)
3. ✅ **Your Lindy agents get everything they need** to generate personalized reports
4. ⚠️ **Field name change**: `event_id` → `calendar_event_id` (more descriptive)
5. ⚠️ **Callback field names differ**: `webhook_callback_url` vs `webhook_url`

---

## 📝 What Your Agents Should Expect

### Pre-Sales Report Agent:
```javascript
// You will receive:
const payload = {
  calendar_event_id: "evt_123",      // Use this to identify the event
  event_title: "Meeting Title",       // Use for context
  event_description: "Details...",    // Use for context
  attendee_email: "client@email.com", // The client's email
  user_profile_id: 1,                 // The user's profile
  webhook_callback_url: "https://...", // Send results here
  company_info: "..." | {...},        // Company data
  company_info_type: "text" | "file"  // How to process it
};

// When done, send back to webhook_callback_url:
{
  calendar_event_id: payload.calendar_event_id,
  status: "completed",
  report_url: "https://storage.example.com/report.pdf"
}
```

### Slides Generation Agent:
```javascript
// You will receive:
const payload = {
  calendar_event_id: "evt_123",      // Use this to identify the event
  event_title: "Meeting Title",       // Use for context
  event_description: "Details...",    // Use for context
  attendee_email: "client@email.com", // The client's email
  user_profile_id: 1,                 // The user's profile
  webhook_url: "https://...",         // Send results here (different name!)
  slide_template: {...}               // PowerPoint template
};

// When done, send back to webhook_url:
{
  calendar_event_id: payload.calendar_event_id,
  status: "completed",
  slides_url: "https://storage.example.com/slides.pptx"
}
```

---

## ✅ Verification Complete

**Status**: All calendar event information is being passed correctly to webhooks.

**Source Code Verified**:
- ✅ `/app/profile/[slug]/page.tsx` - Button handler
- ✅ `/app/api/lindy/presales-report/route.ts` - Webhook endpoint
- ✅ `/app/api/lindy/slides/route.ts` - Webhook endpoint

**Documentation Updated**:
- ✅ `WEBHOOK_PAYLOAD_DOCUMENTATION_CORRECTED.md` - Complete reference
- ✅ `WEBHOOK_FIELDS_SUMMARY.md` - This summary

---

*Verified by source code analysis - November 3, 2025, 10:56 PM CST*
