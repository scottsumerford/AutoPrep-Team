# Code Changes Summary

## Overview
This document provides a detailed summary of all code changes made to implement the 15-minute timeout retry logic and calendar sync deletion features.

---

## 1. Database Functions (lib/db/index.ts)

### Added: markStalePresalesRuns()
```typescript
export async function markStalePresalesRuns(): Promise<number> {
  if (!isDatabaseConfigured()) {
    console.log('⏱️ Checking for stale presales runs in memory');
    let count = 0;
    const now = new Date();
    mockEvents.forEach(event => {
      if (
        event.presales_report_status === 'processing' &&
        !event.presales_report_url &&
        event.created_at &&
        (now.getTime() - event.created_at.getTime()) > 15 * 60 * 1000
      ) {
        event.presales_report_status = 'failed';
        count++;
      }
    });
    if (count > 0) console.log(`⏱️ Marked ${count} stale presales runs as failed`);
    return count;
  }

  try {
    console.log('⏱️ Checking for stale presales report runs (> 15 minutes)...');
    const result = await sql`
      UPDATE calendar_events
      SET presales_report_status = 'failed'
      WHERE presales_report_status = 'processing'
        AND presales_report_url IS NULL
        AND NOW() - created_at > interval '15 minutes'
      RETURNING id
    `;
    const count = result.length;
    if (count > 0) console.log(`⏱️ Marked ${count} stale presales runs as failed`);
    return count;
  } catch (error) {
    console.error('❌ Database error marking stale presales runs:', error);
    return 0;
  }
}
```

### Added: markStaleSlidesRuns()
```typescript
export async function markStaleSlidesRuns(): Promise<number> {
  if (!isDatabaseConfigured()) {
    console.log('⏱️ Checking for stale slides runs in memory');
    let count = 0;
    const now = new Date();
    mockEvents.forEach(event => {
      if (
        event.slides_status === 'processing' &&
        !event.slides_url &&
        event.created_at &&
        (now.getTime() - event.created_at.getTime()) > 15 * 60 * 1000
      ) {
        event.slides_status = 'failed';
        count++;
      }
    });
    if (count > 0) console.log(`⏱️ Marked ${count} stale slides runs as failed`);
    return count;
  }

  try {
    console.log('⏱️ Checking for stale slides runs (> 15 minutes)...');
    const result = await sql`
      UPDATE calendar_events
      SET slides_status = 'failed'
      WHERE slides_status = 'processing'
        AND slides_url IS NULL
        AND NOW() - created_at > interval '15 minutes'
      RETURNING id
    `;
    const count = result.length;
    if (count > 0) console.log(`⏱️ Marked ${count} stale slides runs as failed`);
    return count;
  } catch (error) {
    console.error('❌ Database error marking stale slides runs:', error);
    return 0;
  }
}
```

### Added: deleteRemovedCalendarEvents()
```typescript
export async function deleteRemovedCalendarEvents(
  profileId: number,
  source: 'google' | 'outlook',
  remoteEventIds: string[]
): Promise<number> {
  if (!isDatabaseConfigured()) {
    console.log(`🗑️ Deleting removed ${source} events for profile ${profileId} in memory`);
    const remoteSet = new Set(remoteEventIds);
    const beforeCount = mockEvents.length;
    const filtered = mockEvents.filter(e => 
      !(e.profile_id === profileId && e.source === source && !remoteSet.has(e.event_id))
    );
    const deletedCount = beforeCount - filtered.length;
    if (deletedCount > 0) {
      mockEvents.length = 0;
      mockEvents.push(...filtered);
      console.log(`🗑️ Deleted ${deletedCount} removed events`);
    }
    return deletedCount;
  }

  try {
    console.log(`🗑️ Deleting removed ${source} events for profile ${profileId}...`);
    
    // Build the list of remote event IDs to keep
    const remoteEventIdList = remoteEventIds.map(id => `'${id}'`).join(',');
    
    if (remoteEventIds.length === 0) {
      // If no remote events, delete all local events for this profile/source
      const result = await sql`
        DELETE FROM calendar_events
        WHERE profile_id = ${profileId}
          AND source = ${source}
        RETURNING id
      `;
      const count = result.length;
      if (count > 0) console.log(`🗑️ Deleted ${count} removed events (all events removed from remote)`);
      return count;
    }
    
    // Delete events that exist locally but not in remote
    const result = await sql.unsafe(`
      DELETE FROM calendar_events
      WHERE profile_id = ${profileId}
        AND source = '${source}'
        AND event_id NOT IN (${remoteEventIdList})
      RETURNING id
    `);
    const count = result.length;
    if (count > 0) console.log(`🗑️ Deleted ${count} removed events`);
    return count;
  } catch (error) {
    console.error('❌ Database error deleting removed events:', error);
    return 0;
  }
}
```

---

## 2. Presales Report Route (app/api/lindy/presales-report/route.ts)

### Key Change: Added stale run cleanup
```typescript
export async function POST(request: NextRequest) {
  try {
    // Mark any stale presales runs as failed (> 15 minutes)
    await markStalePresalesRuns();

    const body = await request.json();
    // ... rest of the function
  }
}
```

**Import Updated:**
```typescript
import { updateEventPresalesStatus, getEventById, markStalePresalesRuns } from '@/lib/db';
```

---

## 3. Slides Route (app/api/lindy/slides/route.ts)

### Key Change: Added stale run cleanup
```typescript
export async function POST(request: NextRequest) {
  try {
    // Mark any stale slides runs as failed (> 15 minutes)
    await markStaleSlidesRuns();

    const body = await request.json();
    // ... rest of the function
  }
}
```

**Import Updated:**
```typescript
import { updateEventSlidesStatus, getEventById, markStaleSlidesRuns } from '@/lib/db';
```

---

## 4. Calendar Sync Route (app/api/calendar/sync/route.ts)

### Key Changes: Added event deletion logic

**Google Calendar Sync:**
```typescript
// Delete events that no longer exist in Google Calendar
const googleEventIds = googleEvents.map(e => e.id);
const deleted = await deleteRemovedCalendarEvents(parseInt(profile_id), 'google', googleEventIds);
deletedEvents += deleted;
```

**Outlook Calendar Sync:**
```typescript
// Delete events that no longer exist in Outlook Calendar
const outlookEventIds = outlookEvents.map(e => e.id);
const deleted = await deleteRemovedCalendarEvents(parseInt(profile_id), 'outlook', outlookEventIds);
deletedEvents += deleted;
```

**Response Updated:**
```typescript
return NextResponse.json({ 
  success: true, 
  synced_events: syncedEvents,
  deleted_events: deletedEvents,
  message: `Successfully synced ${syncedEvents} events and deleted ${deletedEvents} removed events`
});
```

**Import Updated:**
```typescript
import { getProfileById, saveCalendarEvent, deleteRemovedCalendarEvents } from '@/lib/db';
```

---

## 5. Profile Page (app/profile/[id]/page.tsx)

### Added: Helper Functions for Stale Detection

```typescript
// Helper function to check if a report is stale (processing > 15 minutes)
function isReportStale(event: CalendarEvent): boolean {
  if (event.presales_report_status !== 'processing') {
    return false;
  }
  
  // If it has a URL, it's not stale
  if (event.presales_report_url) {
    return false;
  }
  
  // Check if created_at is more than 15 minutes ago
  if (!event.created_at) {
    return false;
  }
  
  const createdTime = new Date(event.created_at).getTime();
  const now = new Date().getTime();
  const fifteenMinutesMs = 15 * 60 * 1000;
  
  return (now - createdTime) > fifteenMinutesMs;
}

// Helper function to check if slides are stale (processing > 15 minutes)
function areSlidesStale(event: CalendarEvent): boolean {
  if (event.slides_status !== 'processing') {
    return false;
  }
  
  // If it has a URL, it's not stale
  if (event.slides_url) {
    return false;
  }
  
  // Check if created_at is more than 15 minutes ago
  if (!event.created_at) {
    return false;
  }
  
  const createdTime = new Date(event.created_at).getTime();
  const now = new Date().getTime();
  const fifteenMinutesMs = 15 * 60 * 1000;
  
  return (now - createdTime) > fifteenMinutesMs;
}
```

### Updated: CalendarEvent Interface
```typescript
interface CalendarEvent {
  id: number;
  event_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  attendees?: string[];
  source: 'google' | 'outlook';
  presales_report_status?: 'pending' | 'processing' | 'completed' | 'failed';
  presales_report_url?: string;
  presales_report_generated_at?: string;  // NEW
  slides_status?: 'pending' | 'processing' | 'completed' | 'failed';
  slides_url?: string;
  slides_generated_at?: string;  // NEW
  created_at?: string;  // NEW
}
```

### Updated: Presales Report Button Logic
```typescript
{/* Pre-sales Report Button */}
{reportStatus === 'completed' && event.presales_report_url ? (
  <Button 
    onClick={() => handleDownloadPDF(event.presales_report_url!)}
    variant="default"
    size="sm"
    className="gap-2 bg-green-600 hover:bg-green-700"
  >
    <Download className="w-4 h-4" />
    Download PDF Report
  </Button>
) : reportStatus === 'processing' && !reportIsStale ? (
  <Button 
    disabled
    variant="default"
    size="sm"
    className="gap-2"
  >
    <Loader2 className="w-4 h-4 animate-spin" />
    Generating Report...
  </Button>
) : reportStatus === 'failed' || reportIsStale ? (
  <Button 
    onClick={() => handleGenerateReport(event)}
    variant="destructive"
    size="sm"
    className="gap-2"
  >
    <FileText className="w-4 h-4" />
    {reportIsStale ? 'Try again' : 'Retry Report'}
  </Button>
) : (
  <Button 
    onClick={() => handleGenerateReport(event)}
    variant="default"
    size="sm"
    className="gap-2"
  >
    <FileText className="w-4 h-4" />
    PDF Pre-sales Report
  </Button>
)}
```

### Updated: Slides Button Logic
```typescript
{/* Create Slides Button */}
{slidesStatus === 'completed' && event.slides_url ? (
  <Button 
    onClick={() => handleDownloadSlides(event.slides_url!)}
    variant="outline"
    size="sm"
    className="gap-2 border-green-600 text-green-600 hover:bg-green-50"
  >
    <Download className="w-4 h-4" />
    Download Slides
  </Button>
) : slidesStatus === 'processing' && !slidesAreStale ? (
  <Button 
    disabled
    variant="outline"
    size="sm"
    className="gap-2"
  >
    <Loader2 className="w-4 h-4 animate-spin" />
    Creating Slides...
  </Button>
) : slidesStatus === 'failed' || slidesAreStale ? (
  <Button 
    onClick={() => handleGenerateSlides(event)}
    variant="destructive"
    size="sm"
    className="gap-2"
  >
    <Presentation className="w-4 h-4" />
    {slidesAreStale ? 'Try again' : 'Retry Slides'}
  </Button>
) : (
  <Button 
    onClick={() => handleGenerateSlides(event)}
    variant="outline"
    size="sm"
    className="gap-2"
  >
    <Presentation className="w-4 h-4" />
    Create Slides
  </Button>
)}
```

### Updated: Event Mapping Logic
```typescript
{filteredEvents.map((event) => {
  const reportStatus = event.presales_report_status || 'pending';
  const slidesStatus = event.slides_status || 'pending';
  const reportIsStale = isReportStale(event);  // NEW
  const slidesAreStale = areSlidesStale(event);  // NEW
  
  return (
    // ... event card JSX
  );
})}
```

---

## Summary of Changes

| File | Type | Changes |
|------|------|---------|
| lib/db/index.ts | Backend | +3 functions, ~150 lines |
| app/api/lindy/presales-report/route.ts | Backend | +1 function call |
| app/api/lindy/slides/route.ts | Backend | +1 function call |
| app/api/calendar/sync/route.ts | Backend | +6 function calls, updated response |
| app/profile/[id]/page.tsx | Frontend | +2 helper functions, updated UI logic |

**Total Changes:** 5 files modified, ~217 lines added

---

## Testing the Changes

### Test 1: Stale Report Detection
```bash
# Create a test event with old created_at
INSERT INTO calendar_events (
  profile_id, event_id, title, start_time, end_time, 
  presales_report_status, created_at, source
) VALUES (
  3, 'test-event', 'Test Event', NOW(), NOW() + interval '1 hour',
  'processing', NOW() - interval '20 minutes', 'google'
);

# Call presales-report endpoint
curl -X POST http://localhost:3000/api/lindy/presales-report \
  -H "Content-Type: application/json" \
  -d '{"event_id": 1, "event_title": "Test", "attendee_email": "test@example.com"}'

# Verify status changed to 'failed'
SELECT presales_report_status FROM calendar_events WHERE id = 1;
```

### Test 2: Calendar Sync Deletion
```bash
# Create test events
INSERT INTO calendar_events (profile_id, event_id, title, start_time, end_time, source)
VALUES 
  (3, 'event-1', 'Event 1', NOW(), NOW() + interval '1 hour', 'google'),
  (3, 'event-2', 'Event 2', NOW(), NOW() + interval '1 hour', 'google'),
  (3, 'event-3', 'Event 3', NOW(), NOW() + interval '1 hour', 'google');

# Call sync with only 2 events
curl -X POST http://localhost:3000/api/calendar/sync \
  -H "Content-Type: application/json" \
  -d '{"profile_id": 3}'

# Verify event-3 was deleted
SELECT COUNT(*) FROM calendar_events WHERE profile_id = 3 AND source = 'google';
```

---

## Deployment Checklist

- [x] Code changes implemented
- [x] Database functions added
- [x] API routes updated
- [x] Frontend logic updated
- [x] Local testing completed
- [x] Code committed to GitHub
- [x] Documentation created
- [ ] Deploy to Vercel (manual step)
- [ ] Verify in production
- [ ] Monitor logs for stale run cleanup

