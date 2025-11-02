# Feature Implementation: 15-Minute Timeout Retry Logic & Calendar Sync Deletion

## Overview
This document describes the implementation of two new features for the AutoPrep Team Dashboard:
1. **15-Minute Timeout Retry Logic** - Automatically mark stale presales reports and slides as failed if they remain in "processing" status for more than 15 minutes
2. **Calendar Sync Deletion** - Bidirectional calendar sync that removes events deleted from Google Calendar or Outlook

## Feature 1: 15-Minute Timeout Retry Logic

### Problem Statement
Previously, if a presales report or slides generation request failed silently or timed out, the event would remain in "processing" status indefinitely, preventing users from retrying the operation.

### Solution
Implemented automatic detection and marking of stale processing runs as failed after 15 minutes.

### Implementation Details

#### Database Functions (lib/db/index.ts)

**`markStalePresalesRuns()`**
- Checks for calendar events with `presales_report_status = 'processing'` and no `presales_report_url`
- If the event was created more than 15 minutes ago, marks it as `'failed'`
- Returns the count of marked events
- Supports both database and in-memory mock data

**`markStaleSlidesRuns()`**
- Same logic as presales runs but for slides generation
- Checks `slides_status = 'processing'` and no `slides_url`
- Marks stale runs as `'failed'`

#### API Routes

**presales-report route (`app/api/lindy/presales-report/route.ts`)**
- Calls `markStalePresalesRuns()` at the start of each request
- This ensures stale runs are cleaned up before processing new requests
- Provides automatic recovery without user intervention

**slides route (`app/api/lindy/slides/route.ts`)**
- Calls `markStaleSlidesRuns()` at the start of each request
- Same cleanup logic as presales route

#### Frontend Logic (app/profile/[id]/page.tsx)

**Helper Functions**
```typescript
function isReportStale(event: CalendarEvent): boolean
function areSlidesStale(event: CalendarEvent): boolean
```

These functions check:
1. If status is 'processing'
2. If there's no URL (report/slides not generated)
3. If created_at is more than 15 minutes ago

**UI Changes**
- When a report/slides is stale, the button shows "Try again" instead of "Retry Report"
- The button remains in destructive (red) state to indicate an issue
- Users can click to retry the generation

### User Experience Flow

1. User clicks "PDF Pre-sales Report" button
2. Button shows "Generating Report..." with spinner
3. If generation completes within 15 minutes:
   - Button turns green with "Download PDF Report"
4. If generation fails or times out:
   - After 15 minutes, button turns red with "Try again"
   - User can click to retry
5. If generation completes after 15 minutes:
   - Button turns green with "Download PDF Report"

### Database Schema
Uses existing columns:
- `presales_report_status` ('pending' | 'processing' | 'completed' | 'failed')
- `presales_report_url` (TEXT, NULL if not generated)
- `created_at` (TIMESTAMP)
- Similar columns for slides

## Feature 2: Calendar Sync Deletion

### Problem Statement
Previously, the calendar sync only added and updated events from Google Calendar and Outlook. If a user deleted an event from their calendar, it would remain in the AutoPrep database indefinitely.

### Solution
Implemented bidirectional calendar sync that removes events that no longer exist in the remote calendars.

### Implementation Details

#### Database Function (lib/db/index.ts)

**`deleteRemovedCalendarEvents(profileId, source, remoteEventIds)`**
- Takes the profile ID, calendar source ('google' or 'outlook'), and list of remote event IDs
- Deletes all local events for that profile/source that are NOT in the remote list
- Returns the count of deleted events
- Supports both database and in-memory mock data

```typescript
export async function deleteRemovedCalendarEvents(
  profileId: number,
  source: 'google' | 'outlook',
  remoteEventIds: string[]
): Promise<number>
```

#### Calendar Sync Route (app/api/calendar/sync/route.ts)

**Google Calendar Sync**
1. Fetch all events from Google Calendar API
2. Extract event IDs: `const googleEventIds = googleEvents.map(e => e.id)`
3. Call `deleteRemovedCalendarEvents(profileId, 'google', googleEventIds)`
4. Save/update all fetched events

**Outlook Calendar Sync**
1. Fetch all events from Outlook Calendar API
2. Extract event IDs: `const outlookEventIds = outlookEvents.map(e => e.id)`
3. Call `deleteRemovedCalendarEvents(profileId, 'outlook', outlookEventIds)`
4. Save/update all fetched events

**Response**
```json
{
  "success": true,
  "synced_events": 5,
  "deleted_events": 2,
  "message": "Successfully synced 5 events and deleted 2 removed events"
}
```

### User Experience Flow

1. User clicks "Sync Calendar Now" button
2. System fetches all events from Google Calendar and/or Outlook
3. System compares local events with remote events
4. Events that exist locally but not remotely are deleted
5. New/updated events are synced
6. User sees confirmation: "Successfully synced X events and deleted Y removed events"

### Edge Cases Handled

1. **No remote events**: If the remote calendar returns 0 events, all local events for that source are deleted
2. **Multiple calendars**: Each calendar source (Google/Outlook) is handled independently
3. **Partial sync**: If only Google is connected, only Google events are synced/deleted
4. **Token refresh**: If Google token is expired, it's automatically refreshed before sync

## Testing Recommendations

### Test 15-Minute Timeout Logic

1. **Manual Testing**
   - Create a presales report request
   - Wait 15+ minutes without the webhook completing
   - Refresh the page
   - Button should show "Try again"
   - Click "Try again" to retry

2. **Automated Testing**
   - Create a test event with `created_at` set to 16 minutes ago
   - Set `presales_report_status = 'processing'` and `presales_report_url = NULL`
   - Call `/api/lindy/presales-report`
   - Verify the event is marked as 'failed'

### Test Calendar Sync Deletion

1. **Manual Testing**
   - Connect Google Calendar
   - Sync calendar (should show events)
   - Delete an event from Google Calendar
   - Click "Sync Calendar Now"
   - Verify deleted event is removed from AutoPrep

2. **Automated Testing**
   - Create test events in database
   - Call `/api/calendar/sync` with fewer remote events
   - Verify extra local events are deleted

## Files Modified

1. **lib/db/index.ts**
   - Added `markStalePresalesRuns()`
   - Added `markStaleSlidesRuns()`
   - Added `deleteRemovedCalendarEvents()`

2. **app/api/lindy/presales-report/route.ts**
   - Added call to `markStalePresalesRuns()` at start of request

3. **app/api/lindy/slides/route.ts**
   - Added call to `markStaleSlidesRuns()` at start of request

4. **app/api/calendar/sync/route.ts**
   - Added calls to `deleteRemovedCalendarEvents()` for Google and Outlook
   - Updated response to include `deleted_events` count

5. **app/profile/[id]/page.tsx**
   - Added `isReportStale()` helper function
   - Added `areSlidesStale()` helper function
   - Updated presales report button logic to show "Try again" for stale reports
   - Updated slides button logic to show "Try again" for stale slides
   - Added `presales_report_generated_at` and `slides_generated_at` to CalendarEvent interface
   - Added `created_at` to CalendarEvent interface

## Deployment Notes

1. **Database Migration**: No migration needed - uses existing columns
2. **Environment Variables**: No new environment variables required
3. **Backward Compatibility**: Fully backward compatible with existing data
4. **Performance**: Minimal performance impact - cleanup happens on-demand

## Future Enhancements

1. **Configurable Timeout**: Make the 15-minute timeout configurable per profile
2. **Notification**: Send email/notification when a report times out
3. **Automatic Retry**: Automatically retry failed reports after timeout
4. **Sync History**: Track calendar sync history and deleted events
5. **Partial Sync**: Allow syncing specific date ranges instead of just next month

## Commit Information

- **Commit Hash**: 82da5d9
- **Date**: October 22, 2025
- **Message**: feat: implement 15-minute timeout retry logic and calendar sync deletion
