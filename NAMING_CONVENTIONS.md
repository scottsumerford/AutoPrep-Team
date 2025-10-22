# AutoPrep Team Dashboard - Naming Conventions & Code Standards

**Last Updated:** October 22, 2025  
**Version:** 1.0.0

---

## 📋 Table of Contents

1. [Database Naming](#database-naming)
2. [Function Naming](#function-naming)
3. [Variable Naming](#variable-naming)
4. [Environment Variables](#environment-variables)
5. [Status Values](#status-values)
6. [TypeScript Standards](#typescript-standards)
7. [SQL Query Standards](#sql-query-standards)
8. [Documentation Standards](#documentation-standards)
9. [File & Folder Naming](#file--folder-naming)

---

## 🗄️ Database Naming

### Column Naming Conventions

**Timestamps:**
```sql
-- Format: {action}_at
created_at              -- When record was created
updated_at              -- When record was last updated
presales_report_started_at    -- When report generation started
presales_report_generated_at  -- When report generation completed
slides_started_at             -- When slides generation started
slides_generated_at           -- When slides generation completed
```

**Status Fields:**
```sql
-- Format: {action}_status
presales_report_status  -- Values: 'pending', 'processing', 'completed', 'failed'
slides_status           -- Values: 'pending', 'processing', 'completed', 'failed'
```

**URLs:**
```sql
-- Format: {action}_url
presales_report_url     -- URL to download generated PDF report
slides_url              -- URL to download generated slides
slide_template_url      -- URL to pitch deck template
company_info_url        -- URL to company information document
```

**IDs:**
```sql
-- Format: {entity}_id
profile_id              -- Foreign key to profiles table
event_id                -- Calendar event identifier
lindy_agent_id          -- Lindy agent identifier
```

**Tokens:**
```sql
-- Format: {entity}_used or tokens_used
tokens_used             -- Number of tokens consumed
```

### Table Naming Conventions

```sql
-- Plural, lowercase, snake_case
profiles                -- User profiles
calendar_events         -- Calendar events
token_usage             -- Token usage tracking
file_uploads            -- File uploads
```

---

## 🔧 Function Naming

### Database Functions (lib/db/index.ts)

**Getters:**
```typescript
// Format: get{Entity}
getProfiles()                           // Fetch all profiles
getProfileById(id)                      // Fetch single profile
getCalendarEvents(profileId)            // Fetch events for profile
getEventById(eventId)                   // Fetch single event
```

**Setters/Updates:**
```typescript
// Format: update{Entity}
updateProfile(id, data)                 // Update profile
updateEventPresalesStatus(eventId, status, url?)  // Update report status
updateEventSlidesStatus(eventId, status, url?)    // Update slides status
```

**Creators:**
```typescript
// Format: create{Entity}
createProfile(data)                     // Create new profile
```

**Deleters:**
```typescript
// Format: delete{Entity}
deleteRemovedCalendarEvents(profileId, source, remoteEventIds)  // Delete old events
```

**Checkers/Markers:**
```typescript
// Format: mark{Action} or is{Condition}
markStalePresalesRuns()                 // Mark old reports as failed
markStaleSlidesRuns()                   // Mark old slides as failed
isReportStale(event)                    // Check if report is stale
areSlidesStale(event)                   // Check if slides are stale
```

### API Route Functions

**Format:** `POST /api/{resource}/{action}`

```typescript
// app/api/lindy/presales-report/route.ts
export async function POST(request: NextRequest)

// app/api/lindy/slides/route.ts
export async function POST(request: NextRequest)

// app/api/lindy/webhook/route.ts
export async function POST(request: NextRequest)

// app/api/calendar/sync/route.ts
export async function POST(request: NextRequest)
```

---

## 📝 Variable Naming

### Timestamps

```typescript
// Format: {action}Time or {action}At
const startedTime = new Date(event.presales_report_started_at).getTime();
const completedTime = new Date(event.presales_report_generated_at).getTime();
const createdTime = new Date(event.created_at).getTime();
const now = new Date().getTime();
```

### Counts

```typescript
// Format: {entity}Count
const eventsCount = events.length;
const deletedEventsCount = 2;
const syncedEventsCount = 15;
const tokensUsedCount = 1500;
```

### Flags/Booleans

```typescript
// Format: is{State} or {action}ed
const isReportStale = true;
const areSlidesStale = false;
const isDatabaseConfigured = true;
const isProcessing = false;
```

### Collections

```typescript
// Format: {entity}s or {entity}List or {entity}Array
const events = [];
const profiles = [];
const remoteEventIds = ['event1', 'event2'];
const attendees = ['email1@example.com', 'email2@example.com'];
```

### Objects/Entities

```typescript
// Format: {entity} (singular)
const event = await getEventById(123);
const profile = await getProfileById(1);
const webhook = { url, secret };
```

### Request/Response

```typescript
// Format: {action}Request or {action}Response
const agentPayload = { ... };
const webhookResponse = await fetch(url);
const requestBody = await request.json();
```

---

## 🔐 Environment Variables

### Naming Format

**Format:** `UPPERCASE_WITH_UNDERSCORES`

### Prefixes

| Prefix | Purpose | Examples |
|--------|---------|----------|
| `LINDY_` | Lindy AI related | `LINDY_PRESALES_AGENT_ID`, `LINDY_PRESALES_WEBHOOK_URL` |
| `GOOGLE_` | Google OAuth/API | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| `MICROSOFT_` | Microsoft/Outlook OAuth/API | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` |
| `NEXTAUTH_` | NextAuth configuration | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` |
| `NEXT_PUBLIC_` | Public (exposed to browser) | `NEXT_PUBLIC_APP_URL` |
| `POSTGRES_` | Database related | `POSTGRES_URL` |

### Complete List

```bash
# Database
POSTGRES_URL

# Lindy Agents
LINDY_PRESALES_AGENT_ID
LINDY_SLIDES_AGENT_ID
LINDY_PRESALES_WEBHOOK_URL
LINDY_SLIDES_WEBHOOK_URL
LINDY_PRESALES_WEBHOOK_SECRET
LINDY_SLIDES_WEBHOOK_SECRET

# Application URLs
NEXT_PUBLIC_APP_URL
LINDY_CALLBACK_URL

# Google OAuth
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

# Microsoft/Outlook OAuth
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET

# NextAuth
NEXTAUTH_SECRET
NEXTAUTH_URL
```

---

## 📊 Status Values

### Processing States

```typescript
// Format: lowercase, single quotes
type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Usage
presales_report_status: 'pending'      // Not started
presales_report_status: 'processing'   // Currently generating
presales_report_status: 'completed'    // Successfully generated
presales_report_status: 'failed'       // Generation failed
```

### Calendar Sources

```typescript
// Format: lowercase, single quotes
type CalendarSource = 'google' | 'outlook';

// Usage
source: 'google'    // Google Calendar
source: 'outlook'   // Outlook Calendar
```

---

## 🔤 TypeScript Standards

### Interface Naming

```typescript
// Format: PascalCase, descriptive names
interface CalendarEvent {
  id: number;
  profile_id: number;
  event_id: string;
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  attendees: string[];
  source: 'google' | 'outlook';
  presales_report_status: 'pending' | 'processing' | 'completed' | 'failed';
  presales_report_url?: string;
  presales_report_generated_at?: Date;
  presales_report_started_at?: Date;
  slides_status: 'pending' | 'processing' | 'completed' | 'failed';
  slides_url?: string;
  slides_generated_at?: Date;
  slides_started_at?: Date;
  created_at: Date;
}

interface Profile {
  id: number;
  name: string;
  email: string;
  url_slug: string;
  title?: string;
  google_access_token?: string;
  google_refresh_token?: string;
  outlook_access_token?: string;
  outlook_refresh_token?: string;
  keyword_filter?: string;
  slide_template_url?: string;
  company_info_url?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Type Aliases

```typescript
// Format: PascalCase
type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
type CalendarSource = 'google' | 'outlook';
type OperationType = 'agent_run' | 'presales_report' | 'slides_generation';
```

### Strict Null Checks

```typescript
// ✅ CORRECT: Always check for null/undefined
if (!event.presales_report_started_at) {
  return false;
}

const startedTime = new Date(event.presales_report_started_at).getTime();

// ❌ INCORRECT: Assume value exists
const time = event.presales_report_started_at.getTime(); // May throw error
```

### Optional Properties

```typescript
// Use ? for optional properties
interface CalendarEvent {
  id: number;                           // Required
  description?: string;                 // Optional
  presales_report_url?: string;         // Optional
  presales_report_started_at?: Date;    // Optional
}

// Use || for defaults
const description = event.description || 'No description';
```

---

## 🔍 SQL Query Standards

### Parameterized Queries

```typescript
// ✅ CORRECT: Use parameterized queries
const result = await db.query(
  'DELETE FROM calendar_events WHERE profile_id = $1 AND source = $2',
  [profileId, source]
);

// ❌ INCORRECT: String interpolation (SQL injection risk)
const result = await db.query(
  `DELETE FROM calendar_events WHERE profile_id = ${profileId}`
);
```

### Array Handling

```typescript
// ✅ CORRECT: Use sql() helper for arrays
import { sql } from '@vercel/postgres';

const result = await db.query(
  sql`DELETE FROM calendar_events WHERE event_id NOT IN (${sql(remoteEventIds)})`
);

// ❌ INCORRECT: Manual string concatenation
const result = await db.query(
  `DELETE FROM calendar_events WHERE event_id NOT IN (${remoteEventIds.join(',')})`
);
```

### Query Formatting

```typescript
// Use consistent formatting for readability
const result = await db.query(
  sql`
    SELECT *
    FROM calendar_events
    WHERE profile_id = ${profileId}
      AND source = ${source}
      AND start_time >= ${startDate}
    ORDER BY start_time DESC
  `
);
```

---

## 📚 Documentation Standards

### JSDoc Comments

```typescript
/**
 * Detects if a presales report generation has stalled (> 15 minutes)
 * 
 * @param event - Calendar event with presales_report_started_at timestamp
 * @returns true if report generation started > 15 minutes ago
 * 
 * @example
 * if (isReportStale(event)) {
 *   // Show "Retry Report" button instead of spinner
 * }
 * 
 * @changelog
 * - 2025-10-22: Changed from checking created_at to presales_report_started_at
 *   for accurate stale detection (fixes timeout retry logic)
 */
export function isReportStale(event: CalendarEvent): boolean {
  if (!event.presales_report_started_at) {
    return false;
  }
  
  const startedTime = new Date(event.presales_report_started_at).getTime();
  const now = new Date().getTime();
  const fifteenMinutesMs = 15 * 60 * 1000;
  
  return (now - startedTime) > fifteenMinutesMs;
}
```

### Console Logging

```typescript
// Use emoji prefixes for clarity and easy scanning
console.log('📄 Starting pre-sales report generation:', { event_id, event_title });
console.log('✅ Pre-sales report marked as completed');
console.error('❌ Event not found in database:', event_id);
console.warn('⚠️ Unknown agent_id:', agent_id);
console.log('🔗 Triggering Pre-sales Report Lindy agent via webhook');
console.log('📍 Webhook URL:', webhookUrl);
console.log('📤 Sending to agent:', agentPayload);
console.log('📊 Webhook response:', webhookData);
console.log('📨 Received webhook from Lindy agent:', body);
```

### Emoji Reference

| Emoji | Usage | Example |
|-------|-------|---------|
| 📄 | Document/Report | `📄 Starting pre-sales report generation` |
| 🎬 | Slides/Video | `🎬 Starting slides generation` |
| ✅ | Success | `✅ Pre-sales report marked as completed` |
| ❌ | Error | `❌ Event not found in database` |
| ⚠️ | Warning | `⚠️ Unknown agent_id` |
| 🔗 | Connection/Link | `🔗 Triggering Pre-sales Report Lindy agent` |
| 📍 | Location/URL | `📍 Webhook URL` |
| 📤 | Sending/Upload | `📤 Sending to agent` |
| 📊 | Data/Response | `📊 Webhook response` |
| 📨 | Receiving/Webhook | `📨 Received webhook from Lindy agent` |
| 🔍 | Debug/Check | `🔍 POSTGRES_URL exists` |

### Inline Comments

```typescript
// Use for explaining complex logic
// CORRECT: Check presales_report_started_at, not created_at
// This ensures we detect stale reports that started > 15 minutes ago
const startedTime = new Date(event.presales_report_started_at).getTime();

// INCORRECT: Don't use for obvious code
// const now = new Date().getTime(); // Get current time
```

---

## 📁 File & Folder Naming

### API Routes

```
app/api/
├── auth/
│   ├── google/route.ts          # Google OAuth
│   └── outlook/route.ts         # Outlook OAuth
├── calendar/
│   └── sync/route.ts            # Calendar sync
├── lindy/
│   ├── presales-report/route.ts # Pre-sales report trigger
│   ├── slides/route.ts          # Slides generation trigger
│   └── webhook/route.ts         # Lindy webhook callback
├── db/
│   └── init/route.ts            # Database initialization
└── health/route.ts              # Health check
```

### Library Files

```
lib/
├── db/
│   ├── index.ts                 # Database functions
│   ├── config.ts                # Database configuration
│   └── schema.sql               # Database schema
├── lindy.ts                     # Lindy agent integration
└── utils.ts                     # Utility functions
```

### Component Files

```
components/
└── ui/                          # shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    └── ...
```

### Documentation Files

```
MASTER_AGENT_GUIDE.md            # Main reference guide
CHANGELOG.md                     # Version history
NAMING_CONVENTIONS.md            # This file
README.md                        # Project overview
.env.example                     # Environment variables template
```

---

## ✅ Checklist for New Code

Before committing new code, verify:

- [ ] Database columns follow naming conventions (`{action}_at`, `{action}_status`, `{action}_url`)
- [ ] Functions follow naming conventions (`get`, `update`, `delete`, `mark`, `is`)
- [ ] Variables follow naming conventions (`{action}Time`, `{entity}Count`, `is{State}`)
- [ ] Environment variables use correct prefix (`LINDY_`, `GOOGLE_`, `MICROSOFT_`, etc.)
- [ ] Status values are lowercase with single quotes (`'pending'`, `'processing'`, etc.)
- [ ] TypeScript interfaces are defined with strict null checks
- [ ] SQL queries use parameterized queries (no string interpolation)
- [ ] JSDoc comments added for public functions
- [ ] Console logging uses emoji prefixes
- [ ] Code follows existing patterns in the codebase

---

## 🔄 Updating Conventions

When updating these conventions:

1. Update this file (`NAMING_CONVENTIONS.md`)
2. Update `CHANGELOG.md` with the change
3. Update `MASTER_AGENT_GUIDE.md` if applicable
4. Create a new commit with clear message
5. Tag the release if it's a major change

---

**Last Updated:** October 22, 2025  
**Version:** 1.0.0  
**Status:** Active ✅
