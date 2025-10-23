# AutoPrep Team Dashboard - Master Agent Guide

**Last Updated:** October 22, 2025  
**Version:** 1.1.0  
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
- **Database:** PostgreSQL on Supabase (production) or localhost:5432 (local)

### Production Database (Supabase)
- **Hostname:** `aws-0-us-east-1.pooler.supabase.com`
- **Port:** `6543` (pooled connection)
- **Database Name:** `postgres`
- **Connection Type:** Pooled connection via environment variable `POSTGRES_URL`
- **Status:** Set in Vercel environment variables

### Local Development Database
- **Hostname:** `localhost`
- **Port:** `5432`
- **Database User:** `sandbox`
- **Database Password:** `FFQm0w5aPUMIXnGqiBKGUqzt`
- **Database Name:** `autoprep_team`

### Key Credentials (DO NOT COMMIT)
- **Production Database:** Configured via Vercel environment variables (POSTGRES_URL)
- **Local Database Password:** `FFQm0w5aPUMIXnGqiBKGUqzt`
- **Local Database User:** `sandbox`
- **Local Database Name:** `autoprep_team`

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
# DATABASE CONFIGURATION (Local)
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

### Production Environment (Vercel with Supabase)

```bash
# ============================================
# DATABASE CONFIGURATION (Supabase)
# ============================================
# Connection String Format:
# postgresql://[user]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
#
# This is automatically set by Vercel when connecting to Supabase
# The pooled connection (port 6543) is used for better performance
POSTGRES_URL=postgresql://[user]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

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
| `POSTGRES_URL` | `lib/db/config.ts`, `lib/db/index.ts` | Database connection string (Supabase in production) |
| `LINDY_PRESALES_AGENT_ID` | `lib/lindy.ts` | Pre-sales report agent identifier |
| `LINDY_SLIDES_AGENT_ID` | `lib/lindy.ts` | Slides generation agent identifier |
| `LINDY_PRESALES_WEBHOOK_URL` | `app/api/lindy/presales-report/route.ts` | Webhook to trigger pre-sales agent |
| `LINDY_SLIDES_WEBHOOK_URL` | `app/api/lindy/slides/route.ts` | Webhook to trigger slides agent |
| `LINDY_PRESALES_WEBHOOK_SECRET` | `app/api/lindy/presales-report/route.ts` | Authentication for pre-sales webhook |
| `LINDY_SLIDES_WEBHOOK_SECRET` | `app/api/lindy/slides/route.ts` | Authentication for slides webhook |
| `NEXT_PUBLIC_APP_URL` | `app/api/lindy/presales-report/route.ts`, `app/api/lindy/slides/route.ts` | Application base URL (public) |

---

## 🗄️ Database Configuration

### Production Database (Supabase)

**Connection Details:**
- **Provider:** Supabase (PostgreSQL)
- **Hostname:** `aws-0-us-east-1.pooler.supabase.com`
- **Port:** `6543` (pooled connection for better performance)
- **Database:** `postgres`
- **Connection Method:** Environment variable `POSTGRES_URL` in Vercel

**Connection String Format:**
```
postgresql://[user]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**How to Use:**
1. The `POSTGRES_URL` is automatically set in Vercel environment variables
2. The application reads this variable in `lib/db/config.ts`
3. Connection pooling is handled by Supabase
4. Fallback to mock data if database is not configured

**Deployment Process:**
1. Test locally with local PostgreSQL database
2. Push code to GitHub
3. Vercel automatically deploys and uses Supabase connection
4. Verify deployment at https://team.autoprep.ai

### Local Development Database

**Connection Details:**
- **Provider:** PostgreSQL
- **Hostname:** `localhost`
- **Port:** `5432`
- **Database:** `autoprep_team`
- **User:** `sandbox`
- **Password:** `FFQm0w5aPUMIXnGqiBKGUqzt`

**Connection String:**
```
postgresql://sandbox:FFQm0w5aPUMIXnGqiBKGUqzt@localhost:5432/autoprep_team
```

**Setup Instructions:**
```bash
# Create database
createdb -h localhost autoprep_team

# Connect to database
psql -h localhost -U sandbox -d autoprep_team

# Run migrations (if applicable)
# See lib/db/schema.sql for schema
```

### Database Schema

**Key Tables:**
- `profiles` - User profiles with `url_slug` column for semantic URLs
- `calendar_events` - Calendar events synced from Google/Outlook
- `presales_reports` - Generated pre-sales reports
- `slides` - Generated presentation slides

**Key Columns:**
- `profiles.url_slug` - Semantic URL slug (e.g., "john-smith")
- `profiles.presales_report_started_at` - Timestamp for 15-minute timeout
- `profiles.slides_started_at` - Timestamp for 15-minute timeout
- `calendar_events.external_id` - ID from Google/Outlook for sync

---

## 🔗 Lindy Agent Integration

### Pre-sales Report Agent

**Agent ID:** `68aa4cb7ebbc5f9222a2696e`

**Webhook URL:** `https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa`

**Webhook Secret:** `2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07`

**Trigger:** `POST /api/lindy/presales-report`

**Payload:**
```json
{
  "profileId": 1,
  "profileName": "John Smith",
  "profileEmail": "john.smith@example.com",
  "calendarEvents": [
    {
      "title": "Meeting with Client",
      "start": "2025-10-23T10:00:00Z",
      "end": "2025-10-23T11:00:00Z",
      "description": "Discuss project requirements"
    }
  ]
}
```

### Slides Generation Agent

**Agent ID:** `68ed392b02927e7ace232732`

**Webhook URL:** `https://public.lindy.ai/api/v1/webhooks/lindy/66bf87f2-034e-463b-a7da-83e9adbf03d4`

**Webhook Secret:** `f395b62647c72da770de97f7715ee68824864b21b9a2435bdaab7004762359c5`

**Trigger:** `POST /api/lindy/slides`

**Payload:**
```json
{
  "profileId": 1,
  "profileName": "John Smith",
  "profileEmail": "john.smith@example.com",
  "presalesReport": "Generated report content here..."
}
```

---

## 🔐 OAuth Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://team.autoprep.ai/api/auth/callback/google`
6. Copy Client ID and Client Secret to environment variables

### Microsoft/Outlook OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com)
2. Register a new application
3. Add platform: Web
4. Add redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/microsoft`
   - Production: `https://team.autoprep.ai/api/auth/callback/microsoft`
5. Create client secret
6. Copy Client ID and Client Secret to environment variables

---

## 🔌 API Endpoints

### Profile Endpoints

**Get Profile by URL Slug:**
```
GET /api/profiles/slug/[slug]
```

**Get Profile by ID:**
```
GET /api/profiles/[id]
```

**Create Profile:**
```
POST /api/profiles
Body: { name: string, email: string }
```

### Calendar Endpoints

**Sync Calendar:**
```
POST /api/calendar/sync
Body: { profileId: number, provider: "google" | "outlook" }
```

**Get Calendar Events:**
```
GET /api/calendar/events?profileId=[id]
```

### Lindy Webhook Endpoints

**Pre-sales Report Webhook:**
```
POST /api/lindy/presales-report
```

**Slides Generation Webhook:**
```
POST /api/lindy/slides
```

---

## 🪝 Webhook Configuration

### Webhook Authentication

All webhooks use HMAC-SHA256 signature verification:

```typescript
const signature = req.headers['x-lindy-signature'];
const secret = process.env.LINDY_PRESALES_WEBHOOK_SECRET;
const body = JSON.stringify(req.body);
const hash = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

if (hash !== signature) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### Webhook Retry Logic

- **Timeout:** 15 minutes (900,000 ms)
- **Retry Trigger:** When user clicks "Try again" button
- **Timestamp Check:** Uses `presales_report_started_at` or `slides_started_at`

---

## ✅ Deployment Checklist

### Pre-Deployment (Local Testing)

- [ ] Run `bun run build` locally
- [ ] Verify no TypeScript errors
- [ ] Verify no ESLint errors
- [ ] Test all features locally
- [ ] Check database connectivity
- [ ] Verify environment variables are set

### Deployment Steps

1. [ ] Commit changes: `git add -A && git commit -m "message"`
2. [ ] Push to GitHub: `git push origin main`
3. [ ] Wait 1-2 minutes for Vercel auto-deployment
4. [ ] Verify deployment at https://team.autoprep.ai
5. [ ] Check Vercel logs for errors
6. [ ] Test production features

### Post-Deployment

- [ ] Verify database connection to Supabase
- [ ] Test profile creation
- [ ] Test URL slug routing
- [ ] Test calendar sync
- [ ] Test Lindy agent webhooks
- [ ] Monitor error logs

---

## 🔧 Troubleshooting

### Database Connection Issues

**Problem:** "Cannot connect to database"

**Solutions:**
1. Verify `POSTGRES_URL` is set in environment variables
2. Check Supabase connection string format
3. Verify firewall allows connection to `aws-0-us-east-1.pooler.supabase.com:6543`
4. Check database credentials are correct
5. Verify database exists and is accessible

### Webhook Not Triggering

**Problem:** Lindy agents not receiving webhook calls

**Solutions:**
1. Verify webhook URLs are correct in environment variables
2. Check webhook secrets match exactly
3. Verify HMAC signature calculation is correct
4. Check Lindy agent IDs are correct
5. Review Vercel logs for webhook errors

### URL Slug Not Working

**Problem:** Profile not accessible at `/profile/[slug]`

**Solutions:**
1. Verify `url_slug` column exists in profiles table
2. Check slug is generated correctly (lowercase, hyphens)
3. Verify API endpoint `/api/profiles/slug/[slug]` is working
4. Check database query returns correct profile
5. Review Next.js routing configuration

### Build Errors

**Problem:** `bun run build` fails

**Solutions:**
1. Check for TypeScript errors: `bun run type-check`
2. Check for ESLint errors: `bun run lint`
3. Verify all imports are correct
4. Check for missing function exports
5. Verify function signatures match usage

---

## 📚 Code Standards

### Database Functions

All database functions are in `lib/db/index.ts`:

```typescript
// Get profile by URL slug
export async function getProfileBySlug(slug: string): Promise<Profile | null>

// Get profile by ID
export async function getProfileById(id: number): Promise<Profile | null>

// Create profile
export async function createProfile(name: string, email: string): Promise<Profile>

// Get calendar events
export async function getCalendarEvents(profileId: number): Promise<CalendarEvent[]>

// Sync calendar events
export async function syncCalendarEvents(profileId: number, events: CalendarEvent[]): Promise<void>
```

### API Route Structure

All API routes follow this pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### TypeScript Best Practices

- ✅ Use proper types instead of `any`
- ✅ Export all functions from `lib/db/index.ts`
- ✅ Use parameterized SQL queries to prevent injection
- ✅ Convert Date objects to ISO strings in SQL
- ✅ Use type inference in callbacks instead of explicit types

---

## 📞 Support & Contact

For issues or questions:
- **Email:** scottsumerford@gmail.com
- **GitHub:** https://github.com/scottsumerford/AutoPrep-Team
- **Production URL:** https://team.autoprep.ai

---

**Last Updated:** October 22, 2025  
**Version:** 1.1.0  
**Status:** ✅ Production Ready
