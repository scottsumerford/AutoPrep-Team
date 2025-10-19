# Calendar Sync Database Integration - Fix Session
**Date:** October 19, 2025  
**Issue:** Google Calendar events not persisting to Supabase database

---

## Problem Summary

Calendar sync was reporting "Successfully synced 2 events" but events were not appearing in the database or on the profile page. Events were being saved to in-memory storage instead of the Supabase PostgreSQL database.

---

## Root Causes Identified

### 1. **Wrong Database Library**
- **Issue:** Code was using `@vercel/postgres` instead of `postgres` library
- **Why it matters:** `@vercel/postgres` is incompatible with Supabase pooled connections
- **Reference:** SUPABASE_DATABASE_CONNECTION.md clearly documents that `postgres` with `require()` is the correct approach

### 2. **Missing POSTGRES_URL Environment Variable**
- **Issue:** `POSTGRES_URL` was not set in Vercel environment variables
- **Impact:** `isDatabaseConfigured()` returned `false`, causing all data to save to in-memory storage
- **Solution:** Set environment variable using Vercel API with token

### 3. **Incorrect Query Result Handling**
- **Issue:** Code was accessing `.rows` property on query results
- **Why it matters:** `postgres` library returns results directly as arrays, not wrapped in `{rows}` objects
- **Affected functions:** All database queries (profiles, events, token usage)

### 4. **TypeScript Errors Blocking Deployment**
- **Issue 1:** Google disconnect route using `null` instead of `undefined` for optional fields
- **Issue 2:** Unused `result` variable in token usage function
- **Issue 3:** Debug endpoints using wrong database library
- **Impact:** Deployments failing with ERROR state

### 5. **Array Handling in PostgreSQL**
- **Issue:** Using `JSON.stringify()` for attendees array
- **Why it matters:** PostgreSQL expects native arrays, not JSON strings
- **Error:** "malformed array literal"

### 6. **Missing Database Constraint**
- **Current Issue:** `ON CONFLICT (profile_id, event_id)` references non-existent unique constraint
- **Status:** Still needs to be fixed

---

## Fixes Applied

### Fix 1: Reverted to `postgres` Library
**File:** `lib/db/index.ts`

```typescript
// ✅ CORRECT
// eslint-disable-next-line @typescript-eslint/no-require-imports
const postgres = require('postgres');

const connectionString = process.env.POSTGRES_URL;
const sql = connectionString ? postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
}) : null;

// ❌ WRONG (what we had before)
import { sql } from '@vercel/postgres';
```

**Commit:** `c827676` - "CRITICAL FIX: Revert to postgres library with require() per reference guide"

### Fix 2: Fixed Query Result Handling
**Changed:** All queries to access results directly instead of `.rows`

```typescript
// ✅ CORRECT
const rows = await sql`SELECT * FROM profiles`;
return rows;

// ❌ WRONG (what we had before)
const result = await sql`SELECT * FROM profiles`;
return result.rows;
```

**Affected functions:**
- `getAllProfiles()`
- `getProfileById()`
- `getProfileBySlug()`
- `getCalendarEvents()`
- `saveCalendarEvent()`
- `getTokenUsage()`

**Commit:** `c827676` (same commit as library fix)

### Fix 3: Set POSTGRES_URL in Vercel
**Method:** Used Vercel API with access token

```bash
TOKEN="dZ0KTwg5DFwRw4hssw3EqzM9"
PROJECT_ID="prj_VqH4fC394t9m4zvREcJz3dUwDpFC"

# Delete old variable
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$ENV_ID"

# Create new variable
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "POSTGRES_URL",
    "value": "postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
    "type": "encrypted",
    "target": ["production", "preview", "development"]
  }' \
  "https://api.vercel.com/v10/projects/$PROJECT_ID/env"
```

**Connection String:** `postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres`

**Saved to:** SUPABASE_DATABASE_CONNECTION.md

**Commit:** `b23a99f` - "Trigger redeploy after setting POSTGRES_URL in Vercel"

### Fix 4: Fixed TypeScript Errors
**Issue 1:** Google disconnect route
```typescript
// ✅ CORRECT
await updateProfile(parseInt(profile_id), {
  google_access_token: undefined,
  google_refresh_token: undefined
});

// ❌ WRONG
await updateProfile(parseInt(profile_id), {
  google_access_token: null,
  google_refresh_token: null
});
```

**Issue 2:** Token usage function
```typescript
// ✅ CORRECT
const rows = await sql<TokenUsage>`SELECT * FROM token_usage...`;
console.log(`✅ Found ${rows.length} token usage records`);
return rows;

// ❌ WRONG
const result = await sql<TokenUsage>`SELECT * FROM token_usage...`;
console.log(`✅ Found ${rows.length} token usage records`); // rows doesn't exist!
return result.rows;
```

**Issue 3:** Removed debug endpoints
- Deleted entire `app/api/debug/` directory
- These were using `@vercel/postgres` and causing build failures

**Commits:**
- `3a69436` - "Fix TypeScript errors: use undefined instead of null, fix unused variable"
- `8a09886` - "Remove debug endpoints causing build failures"
- `383c196` - "Fix getTokenUsage to use result directly (postgres library)"

### Fix 5: Fixed Array Handling
**File:** `lib/db/index.ts` - `saveCalendarEvent()` function

```typescript
// ✅ CORRECT
VALUES (
  ${data.profile_id}, ${data.event_id}, ${data.title}, ${data.description || null},
  ${data.start_time.toISOString()}, ${data.end_time.toISOString()}, 
  ${data.attendees || []},  // Pass array directly
  ${data.source}
)

// ❌ WRONG
VALUES (
  ${data.profile_id}, ${data.event_id}, ${data.title}, ${data.description || null},
  ${data.start_time.toISOString()}, ${data.end_time.toISOString()}, 
  ${JSON.stringify(data.attendees || [])},  // Don't stringify!
  ${data.source}
)
```

**Commit:** `3494fc9` - "Fix attendees array: pass directly to postgres instead of JSON.stringify"

---

## Current Status

### ✅ Working
- Database connection established with Supabase
- `POSTGRES_URL` environment variable configured
- All TypeScript errors resolved
- Deployments succeeding (State: READY)
- Profile data persisting correctly

### ❌ Still Broken
- Calendar events not persisting due to missing unique constraint
- Error: "there is no unique or exclusion constraint matching the ON CONFLICT specification"

---

## Next Steps Required

### 1. Fix Database Schema
The `calendar_events` table needs a unique constraint on `(profile_id, event_id)` to support the `ON CONFLICT` clause.

**Option A:** Add unique constraint to existing table
```sql
ALTER TABLE calendar_events 
ADD CONSTRAINT calendar_events_profile_event_unique 
UNIQUE (profile_id, event_id);
```

**Option B:** Remove `ON CONFLICT` clause and handle duplicates in application code
```typescript
// Check if event exists first
const existing = await sql`
  SELECT id FROM calendar_events 
  WHERE profile_id = ${data.profile_id} AND event_id = ${data.event_id}
`;

if (existing.length > 0) {
  // Update existing event
  const rows = await sql`
    UPDATE calendar_events 
    SET title = ${data.title}, description = ${data.description}, ...
    WHERE profile_id = ${data.profile_id} AND event_id = ${data.event_id}
    RETURNING *
  `;
} else {
  // Insert new event
  const rows = await sql`INSERT INTO calendar_events...`;
}
```

### 2. Verify Schema File
Check if `lib/db/schema.sql` exists and contains the correct table definitions.

### 3. Test Calendar Sync
Once schema is fixed, test the full flow:
1. Navigate to profile page
2. Click "Sync Calendar Now"
3. Verify events appear in calendar view
4. Check `/api/calendar/3` endpoint returns events
5. Verify events persist after page refresh

---

## Key Learnings

1. **Always check reference documentation first** - SUPABASE_DATABASE_CONNECTION.md had the correct solution all along
2. **`postgres` library ≠ `@vercel/postgres`** - They have different APIs and compatibility
3. **Supabase requires pooled connections** - Use port 6543, not 5432
4. **Environment variables must be set in Vercel** - Local `.env.local` is not enough for production
5. **PostgreSQL arrays are native types** - Don't use `JSON.stringify()` for array columns
6. **TypeScript strict mode catches errors** - But can block deployments if not fixed

---

## Important Files

- **Database Layer:** `lib/db/index.ts`
- **Database Config:** `lib/db/config.ts`
- **Schema:** `lib/db/schema.sql` (needs verification)
- **Reference Guide:** `SUPABASE_DATABASE_CONNECTION.md`
- **Connection String:** Documented in SUPABASE_DATABASE_CONNECTION.md

---

## Vercel Access Information

- **Access Token:** `dZ0KTwg5DFwRw4hssw3EqzM9`
- **Project ID:** `prj_VqH4fC394t9m4zvREcJz3dUwDpFC`
- **Project Name:** `autoprep-team-subdomain-deployment`
- **Production URL:** `https://team.autoprep.ai`

---

## Deployment Commands

### Check Deployment Status
```bash
./check_deployment_logs.sh
```

### Get Build Logs
```bash
./get_latest_logs.sh
```

### Check for Errors
```bash
./check_latest_error.sh
```

---

## Git Commits (in order)

1. `c827676` - CRITICAL FIX: Revert to postgres library with require() per reference guide
2. `86212e1` - Add health check endpoint to verify POSTGRES_URL
3. `b23a99f` - Trigger redeploy after setting POSTGRES_URL in Vercel
4. `3a69436` - Fix TypeScript errors: use undefined instead of null, fix unused variable
5. `8a09886` - Remove debug endpoints causing build failures
6. `383c196` - Fix getTokenUsage to use result directly (postgres library)
7. `3494fc9` - Fix attendees array: pass directly to postgres instead of JSON.stringify

---

## Testing Checklist

- [x] Database connection established
- [x] POSTGRES_URL configured in Vercel
- [x] Deployments succeeding
- [x] Profile data persisting
- [ ] Calendar events persisting (blocked by schema issue)
- [ ] Events appearing in calendar view
- [ ] Events surviving page refresh
- [ ] Sync reporting accurate event counts

---

## Contact Information

- **Profile ID:** 3 (North Texas Shutters)
- **Email:** northtexasshutters@gmail.com
- **Repository:** https://github.com/scottsumerford/AutoPrep-Team

---

## FINAL FIX - Database Constraint Added

### Issue
The `calendar_events` table was missing the UNIQUE constraint on `(profile_id, event_id)` even though it was defined in the schema file.

### Solution
Connected directly to the Supabase database and added the constraint:

```sql
ALTER TABLE calendar_events 
ADD CONSTRAINT calendar_events_profile_event_unique 
UNIQUE (profile_id, event_id);
```

### Verification Script
```javascript
// check_db_schema.js - Verified table structure
// add_unique_constraint.js - Added the missing constraint
```

### Result
✅ **CALENDAR SYNC NOW FULLY WORKING!**

- Events persist to Supabase database
- Events appear in calendar view
- Events appear in events list
- Events survive page refresh
- API endpoint `/api/calendar/3` returns events from database
- Sync reports accurate event counts

### Test Results
- **Profile ID:** 3 (North Texas Shutters)
- **Events Synced:** 2 events
- **Events in Database:** 2 events
- **Events Displayed:** 2 events
- **Status:** ✅ FULLY WORKING

### Events Successfully Synced
1. "new test Intro Call - Genome Medical" (10/22/2025)
2. "Intro Call - party city" (10/31/2025)

---

## Final Status: ✅ COMPLETE

All calendar sync issues have been resolved. The Google Calendar integration is now fully functional and persisting events to the Supabase database.

**Date Completed:** October 19, 2025, 2:36 AM (America/Chicago)
