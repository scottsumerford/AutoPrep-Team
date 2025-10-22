# AutoPrep Team Dashboard - Master Agent Guide

**Last Updated:** October 22, 2025  
**Version:** 1.0.0  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Quick Reference](#quick-reference)
2. [Environment Variables](#environment-variables)
3. [Database Configuration](#database-configuration)
4. [Lindy Agent Integration](#lindy-agent-integration)
5. [OAuth Configuration](#oauth-configuration)
6. [API Endpoints](#api-endpoints)
7. [Webhook Configuration](#webhook-configuration)
8. [Deployment Checklist](#deployment-checklist)
9. [Troubleshooting](#troubleshooting)
10. [Code Standards](#code-standards)

---

## 🚀 Quick Reference

### Application URLs
- **Local Development:** `http://localhost:3000`
- **Production:** `https://team.autoprep.ai`
- **Database:** PostgreSQL on `localhost:5432` (local) or Vercel Postgres (production)

### Key Credentials (DO NOT COMMIT)
- **Database Password:** `FFQm0w5aPUMIXnGqiBKGUqzt`
- **Database User:** `sandbox`
- **Database Name:** `autoprep_team`

### Agent IDs (Hardcoded - Do Not Change)
- **Pre-sales Report Agent:** `68aa4cb7ebbc5f9222a2696e`
- **Slides Generation Agent:** `68ed392b02927e7ace232732`

### Timeout Configuration
- **Report Generation Timeout:** 15 minutes (900,000 ms)
- **Slides Generation Timeout:** 15 minutes (900,000 ms)
- **Stale Detection:** Checks `presales_report_started_at` and `slides_started_at` timestamps

---

## 🔐 Environment Variables

### Local Development (.env)

```bash
# ============================================
# DATABASE CONFIGURATION
# ============================================
POSTGRES_URL=postgresql://sandbox:FFQm0w5aPUMIXnGqiBKGUqzt@localhost:5432/autoprep_team

# ============================================
# LINDY AGENT CONFIGURATION
# ============================================
# Agent IDs (DO NOT CHANGE - These are hardcoded in lib/lindy.ts)
LINDY_PRESALES_AGENT_ID=68aa4cb7ebbc5f9222a2696e
LINDY_SLIDES_AGENT_ID=68ed392b02927e7ace232732

# Webhook URLs - These trigger the agents
LINDY_PRESALES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa
LINDY_SLIDES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/66bf87f2-034e-463b-a7da-83e9adbf03d4

# Webhook Secrets - Used to authenticate webhook calls
LINDY_PRESALES_WEBHOOK_SECRET=2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07
LINDY_SLIDES_WEBHOOK_SECRET=f395b62647c72da770de97f7715ee68824864b21b9a2435bdaab7004762359c5

# ============================================
# APPLICATION URLS
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
LINDY_CALLBACK_URL=http://localhost:3000/api/lindy/webhook

# ============================================
# OAUTH CONFIGURATION (Optional for local dev)
# ============================================
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Microsoft/Outlook OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here

# NextAuth Configuration
NEXTAUTH_SECRET=generate_with_openssl_rand_-base64_32
NEXTAUTH_URL=http://localhost:3000
```

### Production Environment (Vercel)

```bash
# ============================================
# DATABASE CONFIGURATION
# ============================================
POSTGRES_URL=postgresql://[user]:[password]@[host]:[port]/[database]
# (Automatically set by Vercel Postgres)

# ============================================
# LINDY AGENT CONFIGURATION
# ============================================
LINDY_PRESALES_AGENT_ID=68aa4cb7ebbc5f9222a2696e
LINDY_SLIDES_AGENT_ID=68ed392b02927e7ace232732

# Webhook URLs - Same as local (Lindy endpoints)
LINDY_PRESALES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa
LINDY_SLIDES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/66bf87f2-034e-463b-a7da-83e9adbf03d4

# Webhook Secrets - Same as local
LINDY_PRESALES_WEBHOOK_SECRET=2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07
LINDY_SLIDES_WEBHOOK_SECRET=f395b62647c72da770de97f7715ee68824864b21b9a2435bdaab7004762359c5

# ============================================
# APPLICATION URLS
# ============================================
NEXT_PUBLIC_APP_URL=https://team.autoprep.ai
LINDY_CALLBACK_URL=https://team.autoprep.ai/api/lindy/webhook

# ============================================
# OAUTH CONFIGURATION
# ============================================
# Google OAuth
GOOGLE_CLIENT_ID=your_production_google_client_id
GOOGLE_CLIENT_SECRET=your_production_google_client_secret

# Microsoft/Outlook OAuth
MICROSOFT_CLIENT_ID=your_production_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_production_microsoft_client_secret

# NextAuth Configuration
NEXTAUTH_SECRET=your_production_nextauth_secret
NEXTAUTH_URL=https://team.autoprep.ai
```

### Environment Variable Usage Map

| Variable | Used In | Purpose |
|----------|---------|---------|
| `POSTGRES_URL` | `lib/db/config.ts`, `lib/db/index.ts` | Database connection string |
| `LINDY_PRESALES_AGENT_ID` | `lib/lindy.ts` | Pre-sales report agent identifier |
| `LINDY_SLIDES_AGENT_ID` | `lib/lindy.ts` | Slides generation agent identifier |
| `LINDY_PRESALES_WEBHOOK_URL` | `app/api/lindy/presales-report/route.ts` | Webhook to trigger pre-sales agent |
| `LINDY_SLIDES_WEBHOOK_URL` | `app/api/lindy/slides/route.ts` | Webhook to trigger slides agent |
| `LINDY_PRESALES_WEBHOOK_SECRET` | `app/api/lindy/presales-report/route.ts` | Authentication for pre-sales webhook |
| `LINDY_SLIDES_WEBHOOK_SECRET` | `app/api/lindy/slides/route.ts` | Authentication for slides webhook |
| `NEXT_PUBLIC_APP_URL` | `app/api/lindy/presales-report/route.ts`, `app/api/lindy/slides/route.ts` | Application base URL (public) |
| `LINDY_CALLBACK_URL` | `app/api/lindy/presales-report/route.ts`, `app/api/lindy/slides/route.ts` | Webhook callback URL for Lindy agents |
| `GOOGLE_CLIENT_ID` | `app/api/auth/google/route.ts`, `app/api/calendar/sync/route.ts` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | `app/api/auth/google/route.ts`, `app/api/calendar/sync/route.ts` | Google OAuth client secret |
| `MICROSOFT_CLIENT_ID` | `app/api/auth/outlook/route.ts` | Microsoft OAuth client ID |
| `MICROSOFT_CLIENT_SECRET` | `app/api/auth/outlook/route.ts` | Microsoft OAuth client secret |
| `NEXTAUTH_SECRET` | NextAuth configuration | Session encryption secret |
| `NEXTAUTH_URL` | NextAuth configuration | Application URL for NextAuth |

---

## 🗄️ Database Configuration

### Connection Details

**Local Development:**
```
Host: localhost
Port: 5432
Username: sandbox
Password: FFQm0w5aPUMIXnGqiBKGUqzt
Database: autoprep_team
Connection String: postgresql://sandbox:FFQm0w5aPUMIXnGqiBKGUqzt@localhost:5432/autoprep_team
```

**Production (Vercel):**
- Connection string automatically provided by Vercel
- Set in `POSTGRES_URL` environment variable

### Database Schema

#### Tables

**1. profiles**
```sql
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  url_slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255),
  google_access_token TEXT,
  google_refresh_token TEXT,
  outlook_access_token TEXT,
  outlook_refresh_token TEXT,
  keyword_filter TEXT,
  slide_template_url TEXT,
  company_info_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2. calendar_events**
```sql
CREATE TABLE calendar_events (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  event_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  attendees JSONB,
  source VARCHAR(50) NOT NULL, -- 'google' or 'outlook'
  presales_report_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  presales_report_url TEXT,
  presales_report_generated_at TIMESTAMP,
  presales_report_started_at TIMESTAMP, -- NEW: Tracks when processing started
  slides_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  slides_url TEXT,
  slides_generated_at TIMESTAMP,
  slides_started_at TIMESTAMP, -- NEW: Tracks when processing started
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, event_id)
);
```

**3. token_usage**
```sql
CREATE TABLE token_usage (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  operation_type VARCHAR(100) NOT NULL, -- 'agent_run', 'presales_report', 'slides_generation'
  tokens_used INTEGER NOT NULL,
  lindy_agent_id VARCHAR(255),
  event_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**4. file_uploads**
```sql
CREATE TABLE file_uploads (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  file_type VARCHAR(50) NOT NULL, -- 'slide_template' or 'company_info'
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Initialization

**Local Development:**
```bash
# Create database
createdb -h localhost autoprep_team

# Initialize schema
psql -h localhost -U sandbox -d autoprep_team -f lib/db/schema.sql

# Or use the API endpoint
curl http://localhost:3000/api/db/init
```

**Production (Vercel):**
```bash
# Pull environment variables
vercel env pull .env.local

# Run initialization
bun run db:init
```

### Key Database Functions (lib/db/index.ts)

| Function | Purpose |
|----------|---------|
| `getProfiles()` | Fetch all user profiles |
| `getProfileById(id)` | Fetch single profile by ID |
| `createProfile(data)` | Create new user profile |
| `updateProfile(id, data)` | Update profile information |
| `getCalendarEvents(profileId)` | Fetch calendar events for profile |
| `getEventById(eventId)` | Fetch single event by ID |
| `updateEventPresalesStatus(eventId, status, url?)` | Update pre-sales report status |
| `updateEventSlidesStatus(eventId, status, url?)` | Update slides status |
| `markStalePresalesRuns()` | Mark reports > 15 min as failed |
| `markStaleSlidesRuns()` | Mark slides > 15 min as failed |
| `deleteRemovedCalendarEvents(profileId, source, remoteEventIds)` | Delete events not in remote calendar |

---

## 🤖 Lindy Agent Integration

### Agent Configuration

**Pre-sales Report Agent**
- **Agent ID:** `68aa4cb7ebbc5f9222a2696e`
- **Webhook URL:** `https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa`
- **Webhook Secret:** `2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07`
- **Purpose:** Generate PDF pre-sales reports from meeting details
- **Input Parameters:**
  - `attendee_email` - Email of meeting attendee
  - `meeting_title` - Title of the meeting
  - `meeting_date` - ISO timestamp of meeting
  - `additional_details` - Meeting description/notes
  - `calendar_event_id` - Database event ID for callback
  - `webhook_url` - Callback URL for results

**Slides Generation Agent**
- **Agent ID:** `68ed392b02927e7ace232732`
- **Webhook URL:** `https://public.lindy.ai/api/v1/webhooks/lindy/66bf87f2-034e-463b-a7da-83e9adbf03d4`
- **Webhook Secret:** `f395b62647c72da770de97f7715ee68824864b21b9a2435bdaab7004762359c5`
- **Purpose:** Generate presentation slides from pre-sales report PDF
- **Input Parameters:**
  - `fileId` - File ID of pre-sales report PDF
  - `mimeType` - File MIME type (application/pdf)
  - `format` - Output format (Google Slides)
  - `meeting_title` - Title of the meeting
  - `attendee_email` - Email of meeting attendee
  - `calendar_event_id` - Database event ID for callback
  - `webhook_url` - Callback URL for results

### Data Flow

```
User clicks "PDF Pre-sales Report"
    ↓
POST /api/lindy/presales-report
    ↓
Set calendar_events.presales_report_status = 'processing'
Set calendar_events.presales_report_started_at = NOW()
    ↓
POST to LINDY_PRESALES_WEBHOOK_URL with agent payload
    ↓
Lindy agent processes request (generates PDF)
    ↓
Lindy agent calls /api/lindy/webhook with results
    ↓
Update calendar_events.presales_report_status = 'completed'
Update calendar_events.presales_report_url = pdf_url
Update calendar_events.presales_report_generated_at = NOW()
    ↓
Frontend detects status change and shows "Download PDF Report"
```

### Stale Detection Logic

**Problem:** Reports showing "Generating Report..." indefinitely

**Solution:** Check when processing started, not when event was created

```typescript
// CORRECT: Check presales_report_started_at
function isReportStale(event: CalendarEvent): boolean {
  if (!event.presales_report_started_at) {
    return false;
  }
  
  const startedTime = new Date(event.presales_report_started_at).getTime();
  const now = new Date().getTime();
  const fifteenMinutesMs = 15 * 60 * 1000;
  
  return (now - startedTime) > fifteenMinutesMs;
}

// INCORRECT: Don't check created_at
// const createdTime = new Date(event.created_at).getTime(); // ❌ WRONG
```

---

## 🔑 OAuth Configuration

### Google OAuth Setup

**Console:** https://console.cloud.google.com/

**Steps:**
1. Create new project or select existing
2. Enable APIs:
   - Google Calendar API
   - Gmail API
   - Google Drive API
   - Google Slides API
3. Create OAuth 2.0 credentials:
   - Type: Web application
   - Authorized redirect URIs:
     - Local: `http://localhost:3000/api/auth/google/callback`
     - Production: `https://team.autoprep.ai/api/auth/google/callback`
4. Copy credentials to environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### Microsoft/Outlook OAuth Setup

**Portal:** https://portal.azure.com/

**Steps:**
1. Navigate to Azure Active Directory → App registrations
2. Click "New registration"
3. Configure:
   - Name: AutoPrep Team
   - Supported account types: Any organizational directory and personal Microsoft accounts
   - Redirect URI (Web):
     - Local: `http://localhost:3000/api/auth/outlook/callback`
     - Production: `https://team.autoprep.ai/api/auth/outlook/callback`
4. Create client secret in "Certificates & secrets"
5. Add API permissions (Microsoft Graph):
   - `Calendars.Read`
   - `User.Read`
   - `offline_access`
6. Copy credentials to environment variables:
   - `MICROSOFT_CLIENT_ID`
   - `MICROSOFT_CLIENT_SECRET`

---

## 📡 API Endpoints

### Calendar Sync

**Endpoint:** `POST /api/calendar/sync`

**Purpose:** Sync calendar events from Google or Outlook

**Request Body:**
```json
{
  "profile_id": 3,
  "source": "google" // or "outlook"
}
```

**Response:**
```json
{
  "success": true,
  "events_synced": 15,
  "events_deleted": 2,
  "message": "Calendar synced successfully"
}
```

### Pre-sales Report Generation

**Endpoint:** `POST /api/lindy/presales-report`

**Purpose:** Trigger pre-sales report generation for a calendar event

**Request Body:**
```json
{
  "event_id": 123,
  "event_title": "Sales Meeting with Acme Corp",
  "event_description": "Initial discovery call",
  "attendee_email": "contact@acmecorp.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pre-sales report generation started. You will be notified when it is ready.",
  "event_id": 123,
  "webhook_response": { ... }
}
```

### Slides Generation

**Endpoint:** `POST /api/lindy/slides`

**Purpose:** Trigger slides generation from pre-sales report

**Request Body:**
```json
{
  "event_id": 123,
  "event_title": "Sales Meeting with Acme Corp",
  "event_description": "Initial discovery call",
  "attendee_email": "contact@acmecorp.com",
  "file_id": "pdf_file_id_from_presales_report"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Slides generation started. You will be notified when they are ready.",
  "event_id": 123,
  "webhook_response": { ... }
}
```

### Webhook Callback

**Endpoint:** `POST /api/lindy/webhook`

**Purpose:** Receive results from Lindy agents

**Request Body (from Lindy):**
```json
{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "calendar_event_id": 123,
  "status": "completed",
  "pdf_url": "https://example.com/report.pdf",
  "error_message": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

## 🔗 Webhook Configuration

### Webhook Flow

1. **Trigger:** User clicks "PDF Pre-sales Report" button
2. **Request:** Frontend sends POST to `/api/lindy/presales-report`
3. **Processing:** Backend sets status to 'processing' and calls Lindy webhook
4. **Agent Work:** Lindy agent generates PDF (async)
5. **Callback:** Lindy agent calls `/api/lindy/webhook` with results
6. **Update:** Backend updates database with PDF URL and status
7. **Display:** Frontend detects change and shows download button

### Webhook URLs (Do Not Change)

**Pre-sales Report Webhook:**
```
URL: https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa
Secret: 2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07
```

**Slides Generation Webhook:**
```
URL: https://public.lindy.ai/api/v1/webhooks/lindy/66bf87f2-034e-463b-a7da-83e9adbf03d4
Secret: f395b62647c72da770de97f7715ee68824864b21b9a2435bdaab7004762359c5
```

### Webhook Authentication

All webhook calls include Bearer token authentication:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${webhookSecret}`,
}
```

---

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] All environment variables set in Vercel
- [ ] Database schema initialized
- [ ] OAuth credentials configured
- [ ] Lindy webhook URLs verified
- [ ] Build passes without errors: `bun run build`
- [ ] All tests pass: `bun run test`

### Environment Variables to Verify

```bash
# Database
POSTGRES_URL ✓

# Lindy Agents
LINDY_PRESALES_AGENT_ID ✓
LINDY_SLIDES_AGENT_ID ✓
LINDY_PRESALES_WEBHOOK_URL ✓
LINDY_SLIDES_WEBHOOK_URL ✓
LINDY_PRESALES_WEBHOOK_SECRET ✓
LINDY_SLIDES_WEBHOOK_SECRET ✓

# Application URLs
NEXT_PUBLIC_APP_URL ✓
LINDY_CALLBACK_URL ✓

# OAuth
GOOGLE_CLIENT_ID ✓
GOOGLE_CLIENT_SECRET ✓
MICROSOFT_CLIENT_ID ✓
MICROSOFT_CLIENT_SECRET ✓
NEXTAUTH_SECRET ✓
NEXTAUTH_URL ✓
```

### Post-Deployment

- [ ] Test calendar sync: https://team.autoprep.ai/profile/3
- [ ] Test pre-sales report generation
- [ ] Test slides generation
- [ ] Verify webhook callbacks working
- [ ] Check database for new records
- [ ] Monitor error logs

---

## 🐛 Troubleshooting

### Issue: "Generating Report..." shows indefinitely

**Cause:** Report generation started > 15 minutes ago

**Solution:** 
- Check `presales_report_started_at` timestamp in database
- Verify Lindy webhook is being called
- Check Lindy agent logs for errors
- Click "Retry Report" button to restart

**Code Location:** `app/profile/[id]/page.tsx` - `isReportStale()` function

### Issue: Calendar events not syncing

**Cause:** OAuth tokens expired or calendar sync failed

**Solution:**
- Reconnect Google/Outlook calendar
- Check OAuth token refresh logic
- Verify calendar permissions granted
- Check database for sync errors

**Code Location:** `app/api/calendar/sync/route.ts`

### Issue: Webhook not receiving results

**Cause:** Webhook URL or secret incorrect

**Solution:**
- Verify `LINDY_PRESALES_WEBHOOK_URL` and `LINDY_SLIDES_WEBHOOK_URL`
- Verify `LINDY_PRESALES_WEBHOOK_SECRET` and `LINDY_SLIDES_WEBHOOK_SECRET`
- Check Lindy agent configuration
- Verify callback URL is accessible

**Code Location:** `app/api/lindy/presales-report/route.ts`, `app/api/lindy/slides/route.ts`

### Issue: Database connection failed

**Cause:** `POSTGRES_URL` not set or incorrect

**Solution:**
- Verify `POSTGRES_URL` environment variable
- Check database is running (local) or accessible (Vercel)
- Test connection: `psql $POSTGRES_URL`
- Check database credentials

**Code Location:** `lib/db/config.ts`, `lib/db/index.ts`

### Issue: OAuth redirect URI mismatch

**Cause:** Redirect URI in OAuth console doesn't match application

**Solution:**
- Update OAuth console with correct redirect URI
- For local: `http://localhost:3000/api/auth/google/callback`
- For production: `https://team.autoprep.ai/api/auth/google/callback`
- Wait 5-10 minutes for changes to propagate

**Code Location:** `app/api/auth/google/route.ts`, `app/api/auth/outlook/route.ts`

---

## 📝 Code Standards

### Naming Conventions

**Database Columns:**
- Timestamps: `{action}_at` (e.g., `created_at`, `presales_report_started_at`)
- Status fields: `{action}_status` (e.g., `presales_report_status`)
- URLs: `{action}_url` (e.g., `presales_report_url`)

**Function Names:**
- Getters: `get{Entity}` (e.g., `getCalendarEvents`)
- Setters/Updates: `update{Entity}` (e.g., `updateEventPresalesStatus`)
- Deleters: `delete{Entity}` (e.g., `deleteRemovedCalendarEvents`)
- Checkers: `is{Condition}` or `are{Condition}` (e.g., `isReportStale`)

**Variable Names:**
- Timestamps: `{action}Time` (e.g., `startedTime`, `createdTime`)
- Counts: `{entity}Count` (e.g., `deletedEvents`, `syncedEvents`)
- Flags: `{action}ed` or `is{State}` (e.g., `isDatabaseConfigured`)

**Status Values:**
- Processing states: `'pending'` | `'processing'` | `'completed'` | `'failed'`
- Calendar sources: `'google'` | `'outlook'`

### Environment Variable Naming

**Format:** `UPPERCASE_WITH_UNDERSCORES`

**Prefixes:**
- `LINDY_` - Lindy AI related
- `GOOGLE_` - Google OAuth/API
- `MICROSOFT_` - Microsoft/Outlook OAuth/API
- `NEXTAUTH_` - NextAuth configuration
- `NEXT_PUBLIC_` - Public (exposed to browser)
- `POSTGRES_` - Database related

### SQL Query Standards

**Use Parameterized Queries:**
```typescript
// ✅ CORRECT: Parameterized query
const result = await db.query(
  'DELETE FROM calendar_events WHERE profile_id = $1 AND source = $2',
  [profileId, source]
);

// ❌ INCORRECT: String interpolation
const result = await db.query(
  `DELETE FROM calendar_events WHERE profile_id = ${profileId}`
);
```

**Use sql Helper for Arrays:**
```typescript
// ✅ CORRECT: Using sql() helper
const result = await db.query(
  sql`DELETE FROM calendar_events WHERE event_id NOT IN (${sql(remoteEventIds)})`
);

// ❌ INCORRECT: Manual string concatenation
const result = await db.query(
  `DELETE FROM calendar_events WHERE event_id NOT IN (${remoteEventIds.join(',')})`
);
```

### TypeScript Standards

**Always Define Interfaces:**
```typescript
interface CalendarEvent {
  id: number;
  profile_id: number;
  event_id: string;
  title: string;
  presales_report_status: 'pending' | 'processing' | 'completed' | 'failed';
  presales_report_started_at?: Date;
  // ... other fields
}
```

**Use Strict Null Checks:**
```typescript
// ✅ CORRECT: Check for null/undefined
if (!event.presales_report_started_at) {
  return false;
}

// ❌ INCORRECT: Assume value exists
const time = event.presales_report_started_at.getTime();
```

### Documentation Standards

**Add JSDoc Comments:**
```typescript
/**
 * Detects if a presales report generation has stalled (> 15 minutes)
 * 
 * @param event - Calendar event with presales_report_started_at timestamp
 * @returns true if report generation started > 15 minutes ago
 * 
 * @changelog
 * - 2025-10-22: Changed from checking created_at to presales_report_started_at
 *   for accurate stale detection (fixes timeout retry logic)
 */
export function isReportStale(event: CalendarEvent): boolean {
  // implementation
}
```

**Add Console Logging:**
```typescript
// Use emoji prefixes for clarity
console.log('📄 Starting pre-sales report generation:', { event_id, event_title });
console.error('❌ Event not found in database:', event_id);
console.log('✅ Pre-sales report marked as completed');
console.warn('⚠️ Unknown agent_id:', agent_id);
```

---

## 📚 File Structure Reference

```
AutoPrep-Team/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── google/route.ts          # Google OAuth
│   │   │   └── outlook/route.ts         # Outlook OAuth
│   │   ├── calendar/
│   │   │   └── sync/route.ts            # Calendar sync endpoint
│   │   ├── lindy/
│   │   │   ├── presales-report/route.ts # Pre-sales report trigger
│   │   │   ├── slides/route.ts          # Slides generation trigger
│   │   │   └── webhook/route.ts         # Lindy webhook callback
│   │   ├── db/
│   │   │   └── init/route.ts            # Database initialization
│   │   └── health/route.ts              # Health check endpoint
│   ├── profile/[id]/page.tsx            # Profile detail page
│   ├── page.tsx                         # Dashboard homepage
│   └── layout.tsx                       # Root layout
├── lib/
│   ├── db/
│   │   ├── index.ts                     # Database functions
│   │   ├── config.ts                    # Database configuration
│   │   └── schema.sql                   # Database schema
│   ├── lindy.ts                         # Lindy agent integration
│   └── utils.ts                         # Utility functions
├── components/
│   └── ui/                              # shadcn/ui components
├── .env                                 # Local environment variables
├── .env.example                         # Environment variables template
├── MASTER_AGENT_GUIDE.md               # This file
├── CHANGELOG.md                         # Version history
├── NAMING_CONVENTIONS.md                # Code naming standards
└── README.md                            # Project overview
```

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-22 | Initial Master Agent Guide - Consolidated all documentation |

---

## 📞 Support

For issues or questions:
1. Check this Master Agent Guide first
2. Review relevant code files listed in troubleshooting
3. Check Vercel deployment logs
4. Review browser console for errors
5. Check database for data consistency

---

**Last Updated:** October 22, 2025  
**Maintained By:** AutoPrep Development Team  
**Status:** Production Ready ✅
