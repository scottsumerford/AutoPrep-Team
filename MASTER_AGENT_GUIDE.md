# AutoPrep Team Dashboard - Master Agent Guide

**Last Updated:** October 24, 2025  
**Version:** 1.2.0  
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
- **Vercel Project Folder:** https://vercel.com/scott-s-projects-53d26130/autoprep-team-subdomain-deployment/


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

### Webhook URLs for the Agents
- LINDY_PRESALES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa
- LINDY_SLIDES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/66bf87f2-034e-463b-a7da-83e9adbf03d4

### Webhook Secrets - Used to authenticate webhook calls
- LINDY_PRESALES_WEBHOOK_SECRET=2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07
- LINDY_SLIDES_WEBHOOK_SECRET=f395b62647c72da770de97f7715ee68824864b21b9a2435bdaab7004762359c5
- LINDY_WEBHOOK_SECRET=[configured in Vercel - used for webhook callback signature verification]

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

### Webhook Flow Overview

The application uses a two-way webhook system:

1. **Outbound Webhook:** Backend → Lindy Agent
   - Triggers report/slides generation
   - Uses `Authorization: Bearer [secret]` header
   - Endpoints: `LINDY_PRESALES_WEBHOOK_URL` or `LINDY_SLIDES_WEBHOOK_URL`

2. **Callback Webhook:** Lindy Agent → Backend
   - Returns generated report/slides URL
   - Uses HMAC-SHA256 signature verification
   - Endpoint: `LINDY_CALLBACK_URL` (https://team.autoprep.ai/api/lindy/webhook)

### Outbound Webhook Authentication

When calling Lindy agents, use the `Authorization: Bearer` header:

```typescript
const headers: HeadersInit = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.LINDY_PRESALES_WEBHOOK_SECRET}`,
};

const response = await fetch(process.env.LINDY_PRESALES_WEBHOOK_URL, {
  method: 'POST',
  headers,
  body: JSON.stringify(payload),
});
```

### Callback Webhook Signature Verification

All callbacks from Lindy agents include an `x-lindy-signature` header with HMAC-SHA256 signature:

```typescript
const signature = request.headers.get('x-lindy-signature');
const secret = process.env.LINDY_WEBHOOK_SECRET;

if (signature) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
}
```

**Important:** The signature must be verified against the raw request body (not JSON-parsed), and the secret used is `LINDY_WEBHOOK_SECRET` (not the outbound webhook secret).

### Webhook Retry Logic

- **Timeout:** 15 minutes (900,000 ms)
- **Retry Trigger:** When user clicks "Try again" button
- **Timestamp Check:** Uses `presales_report_started_at` or `slides_started_at`

### Environment Variables Required

```bash
# Outbound Webhook (Backend → Lindy Agent)
LINDY_PRESALES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa
LINDY_PRESALES_WEBHOOK_SECRET=2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07
LINDY_SLIDES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/66bf87f2-034e-463b-a7da-83e9adbf03d4
LINDY_SLIDES_WEBHOOK_SECRET=f395b62647c72da770de97f7715ee68824864b21b9a2435bdaab7004762359c5

# Callback Webhook (Lindy Agent → Backend)
LINDY_CALLBACK_URL=https://team.autoprep.ai/api/lindy/webhook
LINDY_WEBHOOK_SECRET=[configured in Vercel - used for signature verification]
```

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

**Last Updated:** October 24, 2025  
**Version:** 1.2.0  
**Status:** ✅ Production Ready

---

## 🚀 Vercel Deployment Guide

### Vercel Project Information

**Project Details:**
- **Project Name:** AutoPrep-Team
- **Project URL:** https://vercel.com/scottsumerford/autoprep-team
- **Production Domain:** https://team.autoprep.ai
- **GitHub Repository:** https://github.com/scottsumerford/AutoPrep-Team
- **Framework:** Next.js 15.5.3

### Vercel CLI Setup

#### Installation

```bash
# Install Vercel CLI globally
npm install -g vercel
# or with bun
bun add -g vercel
```

#### Authentication

```bash
# Login to Vercel (opens browser for authentication)
vercel login

# Verify authentication
vercel whoami
```

#### Link Project

```bash
# Link local project to Vercel
cd /home/code/AutoPrep-Team
vercel link

# When prompted:
# - Select "scottsumerford" as the scope
# - Select "AutoPrep-Team" as the project
# - Link to existing project: Yes
```

### Environment Variables in Vercel

#### Setting Environment Variables via Dashboard

1. **Go to Vercel Dashboard:**
   - Navigate to: https://vercel.com/scottsumerford/autoprep-team/settings/environment-variables

2. **Add POSTGRES_URL (Production Database):**
   - Click "Add New"
   - Name: `POSTGRES_URL`
   - Value: `postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres`
   - Environments: Select all (Production, Preview, Development)
   - Click "Save"

3. **Add Lindy Agent Variables:**
   - `LINDY_PRESALES_AGENT_ID=68aa4cb7ebbc5f9222a2696e`
   - `LINDY_SLIDES_AGENT_ID=68ed392b02927e7ace232732`
   - `LINDY_PRESALES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/b149f3a8-2679-4d0b-b4ba-7dfb5f399eaa`
   - `LINDY_SLIDES_WEBHOOK_URL=https://public.lindy.ai/api/v1/webhooks/lindy/66bf87f2-034e-463b-a7da-83e9adbf03d4`
   - `LINDY_PRESALES_WEBHOOK_SECRET=2d32c0eab49ac81fad1578ab738e6a9ab2d811691c4afb8947928a90e6504f07`
   - `LINDY_SLIDES_WEBHOOK_SECRET=f395b62647c72da770de97f7715ee68824864b21b9a2435bdaab7004762359c5`
   - `NEXT_PUBLIC_APP_URL=https://team.autoprep.ai`
   - `LINDY_CALLBACK_URL=https://team.autoprep.ai/api/lindy/webhook`

#### Setting Environment Variables via Vercel CLI

```bash
# Set POSTGRES_URL for production
vercel env add POSTGRES_URL production
# Paste: postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres

# Set POSTGRES_URL for preview
vercel env add POSTGRES_URL preview
# Paste: postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres

# Set POSTGRES_URL for development
vercel env add POSTGRES_URL development
# Paste: postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres

# Set other environment variables
vercel env add LINDY_PRESALES_AGENT_ID production
# Paste: 68aa4cb7ebbc5f9222a2696e

# Repeat for all other environment variables
```

### Deployment Methods

#### Method 1: Git Push (Recommended - Auto-Deploy)

This is the **preferred method** as it automatically deploys when you push to the main branch.

```bash
# 1. Make changes to code
# 2. Test locally
bun run build

# 3. Commit changes
git add -A
git commit -m "feat: your feature description"

# 4. Push to GitHub
git push origin main

# 5. Vercel automatically deploys (1-2 minutes)
# 6. Verify at https://team.autoprep.ai
```

**Vercel Auto-Deploy Configuration:**
- Vercel is configured to auto-deploy on every push to `main` branch
- Deployments are automatic and require no manual intervention
- Check deployment status at: https://vercel.com/scottsumerford/autoprep-team/deployments

#### Method 2: Vercel CLI Deploy

Use this method for manual deployments or testing.

```bash
# Deploy to production
vercel --prod

# Deploy to preview (staging)
vercel

# View deployment logs
vercel logs

# Rollback to previous deployment
vercel rollback
```

#### Method 3: Vercel Dashboard Redeploy

1. Go to: https://vercel.com/scottsumerford/autoprep-team/deployments
2. Find the deployment you want to redeploy
3. Click the three dots (...) menu
4. Click "Redeploy"
5. Wait for deployment to complete

### Deployment Workflow (Step-by-Step)

#### Complete Deployment Process

```bash
# ============================================
# STEP 1: Make Code Changes
# ============================================
cd /home/code/AutoPrep-Team
# Edit files as needed

# ============================================
# STEP 2: Test Build Locally
# ============================================
bun run build
# ✅ Must complete with exit code 0
# ✅ No TypeScript errors
# ✅ No ESLint errors

# ============================================
# STEP 3: Run Development Server
# ============================================
bun run dev
# ✅ Test features at http://localhost:3000
# ✅ Verify all functionality works
# ✅ Check browser console for errors

# ============================================
# STEP 4: Commit Changes
# ============================================
git add -A
git commit -m "feat: descriptive commit message"
# Format: type(scope): description
# Types: feat, fix, docs, style, refactor, test, chore

# ============================================
# STEP 5: Push to GitHub
# ============================================
git push origin main
# ✅ Vercel auto-deploys automatically

# ============================================
# STEP 6: Verify Deployment
# ============================================
# Wait 1-2 minutes for Vercel to deploy
# Check: https://vercel.com/scottsumerford/autoprep-team/deployments
# Verify: https://team.autoprep.ai

# ============================================
# STEP 7: Test Production
# ============================================
# Test all features on production URL
# Check browser console for errors
# Verify database connectivity
# Test Lindy agent webhooks
```

### Monitoring Deployments

#### Check Deployment Status

```bash
# View all deployments
vercel list

# View specific deployment details
vercel inspect [deployment-url]

# View deployment logs
vercel logs [deployment-url]
```

#### Vercel Dashboard Monitoring

1. **Deployments Tab:** https://vercel.com/scottsumerford/autoprep-team/deployments
   - Shows all deployment history
   - Click on any deployment to see details
   - View build logs and errors

2. **Settings Tab:** https://vercel.com/scottsumerford/autoprep-team/settings
   - Environment variables
   - Domains and SSL
   - Git integration settings

3. **Analytics Tab:** https://vercel.com/scottsumerford/autoprep-team/analytics
   - Performance metrics
   - Request analytics
   - Error tracking

---

## 🐙 GitHub Deployment Guide

### GitHub Repository Information

**Repository Details:**
- **Repository URL:** https://github.com/scottsumerford/AutoPrep-Team
- **Owner:** scottsumerford
- **Branch:** main (production)
- **Visibility:** Private

### GitHub CLI Setup

#### Installation

```bash
# Install GitHub CLI
# macOS with Homebrew
brew install gh

# Linux
sudo apt-get install gh

# Windows with Chocolatey
choco install gh
```

#### Authentication

```bash
# Login to GitHub
gh auth login

# When prompted:
# - Select "GitHub.com"
# - Select "HTTPS"
# - Select "Paste an authentication token"
# - Paste your GitHub Personal Access Token

# Verify authentication
gh auth status
```

### GitHub Personal Access Token

#### Creating a Personal Access Token

1. **Go to GitHub Settings:**
   - Navigate to: https://github.com/settings/tokens

2. **Create New Token:**
   - Click "Generate new token" → "Generate new token (classic)"
   - Token name: `AutoPrep-Team-Deployment`
   - Expiration: 90 days (or as needed)

3. **Select Scopes:**
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `read:user` (Read user profile data)

4. **Generate and Save:**
   - Click "Generate token"
   - **IMPORTANT:** Copy the token immediately (you won't see it again)
   - Store in `.env.local` (NOT committed to git):
     ```bash
     GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```

#### Using GitHub Token with CLI

```bash
# Set token in environment
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Or add to .env.local
echo "GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" >> .env.local

# Verify token works
gh auth status
```

### Git Workflow for Deployment

#### Standard Git Workflow

```bash
# ============================================
# STEP 1: Create Feature Branch (Optional)
# ============================================
git checkout -b feature/your-feature-name

# ============================================
# STEP 2: Make Changes
# ============================================
# Edit files as needed

# ============================================
# STEP 3: Stage Changes
# ============================================
git add -A
# Or add specific files
git add path/to/file.ts

# ============================================
# STEP 4: Commit Changes
# ============================================
git commit -m "type(scope): description"

# Commit message format:
# feat(profile): add URL slug-based routing
# fix(database): correct connection string
# docs(guide): update deployment instructions
# style(code): format TypeScript files
# refactor(api): simplify webhook handling
# test(unit): add profile tests
# chore(deps): update dependencies

# ============================================
# STEP 5: Push to GitHub
# ============================================
git push origin main
# Or push feature branch
git push origin feature/your-feature-name

# ============================================
# STEP 6: Create Pull Request (Optional)
# ============================================
gh pr create --title "Your PR Title" --body "Description"

# ============================================
# STEP 7: Merge to Main
# ============================================
# Via GitHub CLI
gh pr merge [PR-NUMBER] --merge

# Or merge locally
git checkout main
git merge feature/your-feature-name
git push origin main
```

### GitHub CLI Commands for Deployment

```bash
# View repository information
gh repo view

# List all branches
gh repo list

# View recent commits
gh api repos/scottsumerford/AutoPrep-Team/commits

# Create a release
gh release create v1.1.0 --title "Version 1.1.0" --notes "Release notes here"

# View deployment status
gh api repos/scottsumerford/AutoPrep-Team/deployments

# View pull requests
gh pr list

# View issues
gh issue list
```

---

## 📋 Complete Build, Test, and Deploy Checklist

### Pre-Deployment Checklist

**Local Environment:**
- [ ] All code changes completed
- [ ] `.env.local` has all required variables
- [ ] No uncommitted changes (except `.env.local`)

**Code Quality:**
- [ ] Run `bun run lint` - No ESLint errors
- [ ] Run `bun run type-check` - No TypeScript errors
- [ ] Run `bun run build` - Build succeeds with exit code 0

**Testing:**
- [ ] Run `bun run dev` - Dev server starts without errors
- [ ] Test all modified features locally
- [ ] Check browser console - No errors or warnings
- [ ] Test database connectivity
- [ ] Test API endpoints with curl or Postman

**Git:**
- [ ] Review all changes: `git diff`
- [ ] Stage changes: `git add -A`
- [ ] Verify staged changes: `git status`

### Deployment Checklist

**Before Pushing:**
- [ ] Commit message is descriptive and follows format
- [ ] All tests pass locally
- [ ] Build completes successfully
- [ ] No console errors in dev server

**Push to GitHub:**
- [ ] Run: `git push origin main`
- [ ] Verify push succeeded: `git log --oneline -1`
- [ ] Check GitHub: https://github.com/scottsumerford/AutoPrep-Team/commits/main

**Vercel Deployment:**
- [ ] Wait 1-2 minutes for Vercel to detect push
- [ ] Check deployments: https://vercel.com/scottsumerford/autoprep-team/deployments
- [ ] Verify deployment status is "Ready"
- [ ] Check build logs for errors

**Post-Deployment Verification:**
- [ ] Visit https://team.autoprep.ai
- [ ] Test all modified features
- [ ] Check browser console - No errors
- [ ] Verify database connectivity
- [ ] Test API endpoints
- [ ] Monitor error logs for 5-10 minutes

### Rollback Procedure

If deployment has issues:

```bash
# Option 1: Rollback via Vercel Dashboard
# 1. Go to https://vercel.com/scottsumerford/autoprep-team/deployments
# 2. Find the previous working deployment
# 3. Click three dots (...) → "Promote to Production"

# Option 2: Rollback via Vercel CLI
vercel rollback

# Option 3: Revert Git Commit
git revert HEAD
git push origin main
# Vercel will auto-deploy the reverted code
```

---

## 🔐 Credential Management

### Storing Credentials Securely

**DO NOT commit credentials to GitHub:**

```bash
# ❌ WRONG - Never commit .env
git add .env
git commit -m "add env file"

# ✅ CORRECT - Use .env.local (in .gitignore)
echo "GITHUB_TOKEN=ghp_xxxx" >> .env.local
echo "VERCEL_TOKEN=xxxx" >> .env.local
```

**Credential Storage Locations:**

| Credential | Storage | Visibility |
|-----------|---------|-----------|
| `POSTGRES_URL` | Vercel Dashboard | Production only |
| `LINDY_*` | Vercel Dashboard | Production only |
| `GITHUB_TOKEN` | `.env.local` | Local only (gitignored) |
| `VERCEL_TOKEN` | `.env.local` | Local only (gitignored) |

### .gitignore Configuration

Verify `.gitignore` includes:

```bash
# Environment variables
.env
.env.local
.env.*.local

# Vercel
.vercel

# Dependencies
node_modules
.bun

# Build output
.next
dist
build

# IDE
.vscode
.idea
*.swp
```

---

## 🚨 Troubleshooting Deployment Issues

### Build Fails Locally

**Problem:** `bun run build` fails

**Solutions:**
```bash
# 1. Check for TypeScript errors
bun run type-check

# 2. Check for ESLint errors
bun run lint

# 3. Clear cache and rebuild
rm -rf .next
bun run build

# 4. Check Node version
node --version  # Should be 18+

# 5. Reinstall dependencies
rm -rf node_modules
bun install
bun run build
```

### Vercel Deployment Fails

**Problem:** Deployment fails on Vercel

**Solutions:**
1. Check Vercel build logs: https://vercel.com/scottsumerford/autoprep-team/deployments
2. Verify environment variables are set in Vercel
3. Check for missing dependencies in `package.json`
4. Verify `POSTGRES_URL` is correct
5. Check for TypeScript errors in build output

### Database Connection Issues in Production

**Problem:** "Cannot connect to database" in production

**Solutions:**
```bash
# 1. Verify POSTGRES_URL in Vercel
# Go to: https://vercel.com/scottsumerford/autoprep-team/settings/environment-variables
# Check POSTGRES_URL value

# 2. Test connection string locally
psql postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres

# 3. Check Supabase status
# Go to: https://supabase.com/dashboard

# 4. Verify firewall allows connection
# Port 6543 should be open for pooled connections
```

### Git Push Fails

**Problem:** `git push origin main` fails

**Solutions:**
```bash
# 1. Check authentication
git config user.email
git config user.name

# 2. Verify GitHub token
gh auth status

# 3. Pull latest changes
git pull origin main

# 4. Resolve conflicts if any
# Edit conflicting files
git add -A
git commit -m "resolve merge conflicts"
git push origin main

# 5. Force push (use with caution!)
git push origin main --force-with-lease
```

---

# Pre-Sales Report Webhook Integration Guide

## Overview

This webhook enables external applications to automatically generate pre-sales reports when a calendar event is created. The workflow listens for incoming webhook calls and processes the event data to create comprehensive pre-sales analysis reports. Go to https://docs.lindy.ai/skills/by-lindy/webhooks for more information on how to connect to Lindy Agents via webhooks. 

## Webhook Endpoint

```
POST https://api.lindy.ai/webhooks/{your-webhook-id}
```

## Required Headers

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {your-api-key}"
}
```

## Request Payload Structure

### Minimum Required Fields

```json
{
  "event_type": "calendar.event.created",
  "event_data": {
    "title": "Meeting with [Company Name]",
    "start_time": "2025-10-24T14:00:00Z",
    "end_time": "2025-10-24T15:00:00Z",
    "attendees": [
      {
        "email": "contact@company.com",
        "name": "Contact Name"
      }
    ],
    "description": "Pre-sales meeting discussion",
    "company_name": "Target Company Inc.",
  }
}
```

### Optional Enhanced Fields

```json
{
  "event_type": "calendar.event.created",
  "event_data": {
    "title": "Meeting with [Company Name]",
    "start_time": "2025-10-24T14:00:00Z",
    "end_time": "2025-10-24T15:00:00Z",
    "attendees": [
      {
        "email": "contact@company.com",
        "name": "Contact Name",
        "role": "CTO"
      }
    ],
    "description": "Pre-sales meeting discussion",
    "company_name": "Target Company Inc.",
    "company_domain": "company.com",
    "meeting_type": "pre_sales",
    "deal_value": 50000,
    "industry": "Technology",
    "location": "San Francisco, CA",
    "notes": "Follow-up from initial demo"
  }
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event_type` | string | ✅ | Must be "calendar.event.created" |
| `event_data.title` | string | ✅ | Meeting title (include company name) |
| `event_data.start_time` | ISO 8601 | ✅ | Meeting start time in UTC |
| `event_data.end_time` | ISO 8601 | ✅ | Meeting end time in UTC |
| `event_data.attendees` | array | ✅ | List of meeting attendees |
| `event_data.attendees[].email` | string | ✅ | Attendee email address |
| `event_data.attendees[].name` | string | ✅ | Attendee full name |
| `event_data.company_name` | string | ✅ | Target company name |
| `event_data.meeting_type` | string | ✅ | Must be "pre_sales" |
| `event_data.description` | string | ⚪ | Meeting description/agenda |
| `event_data.company_domain` | string | ⚪ | Company website domain |
| `event_data.deal_value` | number | ⚪ | Estimated deal value (USD) |
| `event_data.industry` | string | ⚪ | Company industry |
| `event_data.location` | string | ⚪ | Meeting location |
| `event_data.notes` | string | ⚪ | Additional context |

## Response Format

### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Pre-sales report generation initiated",
  "task_id": "68fadd49c0f99f5bfeb49769",
  "report_url": "https://chat.lindy.ai/workspace/reports/68fadd49c0f99f5bfeb49769"
}
```

### Error Response (400 Bad Request)

```json
{
  "status": "error",
  "message": "Missing required field: company_name",
  "errors": [
    {
      "field": "event_data.company_name",
      "message": "This field is required"
    }
  ]
}
```

## What the Workflow Does

1. Receives webhook with calendar event data
2. Validates required fields
3. Enriches data using People Data Labs (company info, attendee details)
4. Researches company background using Perplexity AI
5. Analyzes competitive landscape and market position
6. Generates comprehensive pre-sales report including:
   - Company overview and financials
   - Key decision-maker profiles
   - Competitive analysis
   - Recommended talking points
   - Risk assessment
   - Next steps and action items
7. Delivers report via email and stores in workspace

## Example cURL Request

```bash
curl -X POST https://api.lindy.ai/webhooks/{your-webhook-id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your-api-key}" \
  -d '{
    "event_type": "calendar.event.created",
    "event_data": {
      "title": "Pre-sales Meeting with Acme Corp",
      "start_time": "2025-10-24T14:00:00Z",
      "end_time": "2025-10-24T15:00:00Z",
      "attendees": [
        {
          "email": "john.doe@acmecorp.com",
          "name": "John Doe",
          "role": "VP of Engineering"
        }
      ],
      "description": "Initial discovery call to discuss enterprise solution",
      "company_name": "Acme Corp",
      "company_domain": "acmecorp.com",
      "meeting_type": "pre_sales",
      "deal_value": 75000,
      "industry": "SaaS",
      "location": "Virtual - Zoom"
    }
  }'
```

## Integration Examples

### Calendly Webhook

Configure Calendly to send webhook on event creation:

```javascript
// Calendly webhook payload transformation
const calendlyToPreSales = (calendlyPayload) => ({
  event_type: "calendar.event.created",
  event_data: {
    title: calendlyPayload.event.name,
    start_time: calendlyPayload.event.start_time,
    end_time: calendlyPayload.event.end_time,
    attendees: calendlyPayload.invitees.map(inv => ({
      email: inv.email,
      name: inv.name
    })),
    company_name: calendlyPayload.questions_and_answers
      .find(q => q.question === "Company Name")?.answer,
    meeting_type: "pre_sales"
  }
});
```

### Google Calendar API

```javascript
// Google Calendar event to webhook
const googleCalToPreSales = (gcalEvent) => ({
  event_type: "calendar.event.created",
  event_data: {
    title: gcalEvent.summary,
    start_time: gcalEvent.start.dateTime,
    end_time: gcalEvent.end.dateTime,
    attendees: gcalEvent.attendees.map(att => ({
      email: att.email,
      name: att.displayName || att.email
    })),
    description: gcalEvent.description,
    company_name: extractCompanyFromTitle(gcalEvent.summary),
    meeting_type: "pre_sales",
    location: gcalEvent.location
  }
});
```

## Best Practices

✅ Include company domain when available for better enrichment  
✅ Provide attendee roles to prioritize key decision-makers  
✅ Add deal value for prioritization and context  
✅ Use descriptive titles that include company name  
✅ Send webhook 24-48 hours before meeting for timely report generation

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Report not generated | Verify `meeting_type` is "pre_sales" |
| Missing company data | Ensure `company_name` or `company_domain` is provided |
| Attendee enrichment failed | Check email format is valid |
| Timeout errors | Reduce number of attendees or split into multiple calls |

## Support

For webhook integration support, contact: **scottsumerford@gmail.com**

---

### Next Steps

1️⃣ Export this documentation to PDF/Markdown  
2️⃣ Test webhook with sample payload  
3️⃣ Create integration code for your calendar system
---
## 📞 Quick Reference Commands

### Essential Commands

```bash
# ============================================
# LOCAL DEVELOPMENT
# ============================================
bun install              # Install dependencies
bun run dev              # Start dev server
bun run build            # Build for production
bun run lint             # Check code style
bun run type-check       # Check TypeScript types

# ============================================
# GIT OPERATIONS
# ============================================
git status               # Check status
git add -A               # Stage all changes
git commit -m "msg"      # Commit changes
git push origin main     # Push to GitHub
git pull origin main     # Pull from GitHub
git log --oneline -10    # View recent commits

# ============================================
# VERCEL OPERATIONS
# ============================================
vercel login             # Login to Vercel
vercel link              # Link project
vercel env add VAR prod  # Add environment variable
vercel --prod            # Deploy to production
vercel logs              # View deployment logs
vercel rollback          # Rollback deployment

# ============================================
# GITHUB OPERATIONS
# ============================================
gh auth login            # Login to GitHub
gh auth status           # Check authentication
gh repo view             # View repository info
gh pr list               # List pull requests
gh release create v1.0   # Create release
```

---

**Last Updated:** October 24, 2025  
**Version:** 1.2.0  
**Status:** ✅ Production Ready with Complete Deployment Guide

---

## 🔄 Pre-Sales Report Button Enhancement (October 25, 2025)

### Overview

The "Generate Pre-Sales Report" button has been enhanced to provide a better user experience with the following improvements:

1. **Single Button Interface**: All actions (generate, polling, retry) happen within the same button
2. **20-Minute Timer**: The button displays a countdown timer showing remaining time (MM:SS format)
3. **AirTable Polling**: The button automatically polls AirTable every 5 seconds to check for the generated report
4. **Automatic Retry**: If the report isn't found within 20 minutes, the button shows "Try again" option
5. **No Separate "Try Again" Button**: The retry functionality is integrated into the main button

### How It Works

**User Flow:**
1. User clicks "Generate Pre-Sales Report" button
2. Button changes to "Generating Report..." with spinner and 20:00 timer
3. Timer counts down in real-time (MM:SS format)
4. Backend triggers the Lindy Pre-Sales Report agent via webhook
5. Frontend polls AirTable every 5 seconds for the report
6. When report is found in AirTable:
   - Button changes to "Download Report" with download icon
   - User can click to download the PDF
7. If report not found after 20 minutes:
   - Timer reaches 0:00
   - Button shows "Try again" option
   - User can click to retry the generation

### Technical Implementation

**New API Endpoints:**

1. **GET /api/lindy/presales-report-status?event_id=123**
   - Polls AirTable for the generated report
   - Returns: `{ found: true, reportUrl: "...", status: "completed" }`
   - Returns: `{ found: false, status: "processing" }` if not ready

2. **GET /api/lindy/slides-status?event_id=123**
   - Polls AirTable for the generated slides
   - Same response format as presales-report-status

**Frontend State Management:**

```typescript
// Polling state
const [reportPollingId, setReportPollingId] = useState<number | null>(null);
const [reportTimeRemaining, setReportTimeRemaining] = useState<{ [key: number]: string }>({});

// Timer updates every 1 second
// Polling checks AirTable every 5 seconds
// Timeout after 20 minutes (1200 seconds)
```

**Button States:**

| State | Display | Action |
|-------|---------|--------|
| `pending` | "Generate Pre-Sales Report" | Click to start generation |
| `processing` | "Generating Report... (20:00)" | Disabled, shows timer |
| `completed` | "Download Report" | Click to download PDF |
| `failed` | "Report Failed" | Shows error state |
| `stale` (timeout) | "Try again" | Click to retry generation |

### AirTable Integration

**Required Environment Variables:**

```bash
AIRTABLE_API_KEY=<your-airtable-api-key>
AIRTABLE_BASE_ID=appUwKSnmMH7TVgvf
AIRTABLE_TABLE_ID=tbl3xkB7fGkC10CGN
```

**Expected AirTable Record Fields:**

The polling endpoint looks for these field names (in order of preference):
- `Calendar Event ID` or `Event ID` or `event_id` - to match the event
- `Report URL` or `PDF URL` or `report_url` - the download link
- `Status` or `status` - the generation status

**Example AirTable Record:**

```
{
  "Calendar Event ID": "123",
  "Report URL": "https://example.com/report-123.pdf",
  "Status": "completed"
}
```

### Timeout Configuration

- **Report Generation Timeout:** 20 minutes (1,200,000 ms)
- **Polling Interval:** 5 seconds (5,000 ms)
- **Timer Update Interval:** 1 second (1,000 ms)
- **Stale Detection:** Checks if `presales_report_started_at` is > 20 minutes old

### Files Modified

1. **app/profile/[slug]/page.tsx**
   - Added `reportPollingId` and `reportTimeRemaining` state
   - Added `formatTimeRemaining()` helper function
   - Added polling effect hooks for both reports and slides
   - Updated button UI to show timer and "Try again" option
   - Changed timeout from 15 minutes to 20 minutes

2. **app/api/lindy/presales-report-status/route.ts** (NEW)
   - GET endpoint to poll AirTable for report status
   - Queries AirTable and returns report URL if found
   - Updates database when report is found

3. **app/api/lindy/slides-status/route.ts** (NEW)
   - GET endpoint to poll AirTable for slides status
   - Queries AirTable and returns slides URL if found
   - Updates database when slides are found

### Testing the Feature

**Local Testing:**

1. Start the dev server: `bun run dev`
2. Navigate to a profile page
3. Click "Generate Pre-Sales Report" button
4. Verify:
   - Button shows "Generating Report..." with spinner
   - Timer counts down from 20:00
   - Console shows polling requests every 5 seconds
   - After 20 minutes, button shows "Try again"

**Production Testing:**

1. Deploy to production: `git push origin main`
2. Wait for Vercel deployment
3. Test on https://team.autoprep.ai
4. Verify AirTable credentials are set in Vercel environment variables

### Troubleshooting

**Problem:** Timer not updating
- **Solution:** Check browser console for errors, verify polling state is set

**Problem:** Report not found after 20 minutes
- **Solution:** Check AirTable for the record, verify field names match expected format

**Problem:** "Try again" button not appearing
- **Solution:** Verify `isReportStale()` function is checking correct timeout (20 minutes)

**Problem:** AirTable query fails
- **Solution:** Verify `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE_ID` are set in Vercel

### Future Enhancements

- [ ] Add email notification when report is ready
- [ ] Add webhook retry logic if AirTable query fails
- [ ] Add exponential backoff for polling (start at 5s, increase to 30s)
- [ ] Add user preference for timeout duration
- [ ] Add report preview before download

---

