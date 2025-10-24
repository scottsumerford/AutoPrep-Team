# Quick Reference: Production Database Setup Checklist

## 🚨 Critical Issue
Production site is using **in-memory storage** instead of PostgreSQL. Calendar events and pre-sales reports are NOT persisting.

## ✅ What's Already Done
- ✅ Frontend bug fixed (event ID corrected)
- ✅ API endpoints implemented
- ✅ Webhook integration configured
- ✅ Database schema updated with presales columns
- ✅ Code deployed to production

## ⚠️ What Still Needs to Be Done

### Step 1: Create PostgreSQL Database (5 minutes)
**Option A: Vercel Postgres (Recommended)**
1. Go to https://vercel.com/dashboard
2. Select "AutoPrep Team" project
3. Click "Storage" tab
4. Click "Create Database" → "Postgres"
5. Copy the connection string

**Option B: External Provider**
- Neon: https://neon.tech
- Supabase: https://supabase.com
- Railway: https://railway.app

### Step 2: Set Environment Variables (3 minutes)
1. Go to https://vercel.com/dashboard
2. Select "AutoPrep Team" project
3. Go to "Settings" → "Environment Variables"
4. Add:
```
POSTGRES_URL=postgresql://user:password@host:5432/autoprep_team
```

### Step 3: Redeploy (2 minutes)
1. Push any change to GitHub or click "Redeploy" in Vercel
2. Wait for deployment to complete

### Step 4: Initialize Database (1 minute)
```bash
curl -X POST https://team.autoprep.ai/api/db/init
curl -X POST https://team.autoprep.ai/api/db/migrate
```

### Step 5: Sync Calendar Events (1 minute)
```bash
curl -X POST https://team.autoprep.ai/api/calendar/sync \
  -H "Content-Type: application/json" \
  -d '{"profile_id": 1}'
```

### Step 6: Test (2 minutes)
1. Go to https://team.autoprep.ai/profile/north-texas-shutters
2. Click "Generate Pre-Sales Report" on any event
3. Wait 1-2 minutes for report generation
4. Download the PDF

## 📊 Status Dashboard

| Task | Status | Time | Notes |
|------|--------|------|-------|
| Create PostgreSQL DB | ⏳ TODO | 5 min | Use Vercel Postgres or external provider |
| Set POSTGRES_URL | ⏳ TODO | 3 min | Add to Vercel environment variables |
| Redeploy App | ⏳ TODO | 2 min | Automatic after env var change |
| Initialize DB | ⏳ TODO | 1 min | Call /api/db/init endpoint |
| Migrate Schema | ⏳ TODO | 1 min | Call /api/db/migrate endpoint |
| Sync Calendar | ⏳ TODO | 1 min | Call /api/calendar/sync endpoint |
| Test Workflow | ⏳ TODO | 2 min | Click button and verify report |
| **TOTAL** | **⏳ TODO** | **~15 min** | **Complete setup** |

## 🔗 Important Links

- **Production Site**: https://team.autoprep.ai
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/scottsumerford/AutoPrep-Team
- **Neon Database**: https://neon.tech
- **Supabase**: https://supabase.com

## 📝 API Endpoints

```bash
# Initialize database tables
POST /api/db/init

# Add missing columns to existing database
POST /api/db/migrate

# Sync calendar events from Google Calendar
POST /api/calendar/sync
Body: {"profile_id": 1}

# Get all calendar events
GET /api/calendar/events?profile_id=1

# Trigger pre-sales report generation
POST /api/lindy/presales-report
Body: {
  "event_id": 1,
  "event_title": "Meeting Title",
  "event_description": "Description",
  "attendee_email": "email@example.com"
}

# Webhook receiver (called by Lindy agent)
POST /api/lindy/webhook
Body: {
  "event_id": 1,
  "presales_report_url": "https://...",
  "slides_url": "https://..."
}
```

## 🐛 Troubleshooting

**Problem**: Events not persisting after sync
- **Solution**: Check if POSTGRES_URL is set in Vercel environment variables

**Problem**: "Event not found" error
- **Solution**: Make sure you're using event.id (database primary key), not event.event_id

**Problem**: Pre-sales report button doesn't respond
- **Solution**: Check browser console for errors, verify database is configured

**Problem**: Database migration fails
- **Solution**: Check Vercel logs, ensure POSTGRES_URL is correct

## 📞 Support

For detailed information, see:
- `BUG_FIX_SUMMARY.md` - Root cause analysis
- `PRODUCTION_SETUP_GUIDE.md` - Detailed setup instructions
- GitHub commits: `758fe58`, `c8fd4c4`, `c88b25f`, `04125cf`

## 🎯 Success Criteria

✅ All of the following should be true:
1. POSTGRES_URL is set in Vercel environment variables
2. Database tables are created (call /api/db/init)
3. Presales columns exist (call /api/db/migrate)
4. Calendar events are synced and visible
5. "Generate Pre-Sales Report" button works
6. Reports are generated and downloadable as PDFs
