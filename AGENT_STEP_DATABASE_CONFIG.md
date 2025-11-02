# 🗄️ Production Database Configuration - Agent Step Reference

**For use in Agent Step prompts and automation**

---

## Database Provider

- **Type:** PostgreSQL (Supabase)
- **Hosting:** AWS (us-east-1 region)
- **Environment Variable:** `POSTGRES_URL`

---

## Connection Details

| Property | Value |
|----------|-------|
| **Hostname** | `aws-0-us-east-1.pooler.supabase.com` |
| **Port** | `6543` (pooled connection) |
| **Database Name** | `postgres` |
| **Connection Type** | Pooled connection (optimized for performance) |
| **Protocol** | PostgreSQL |

---

## Connection String Format

```
postgresql://[user]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Example:**
```
postgresql://postgres:your_password_here@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## Environment Variable

**Variable Name:** `POSTGRES_URL`

**Where to Set:**
- Vercel Project Settings → Environment Variables
- Apply to: Production, Preview, Development

**Format:**
```
postgresql://[user]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

## Database Tables

| Table Name | Purpose |
|-----------|---------|
| `profiles` | User profiles with `url_slug` column for semantic URLs |
| `calendar_events` | Calendar events synced from Google/Outlook |
| `presales_reports` | Generated pre-sales reports |
| `slides` | Generated presentation slides |

---

## Key Configuration Points

✅ **Pooled Connection:** Uses port 6543 for better performance and connection management  
✅ **Automatic Failover:** Supabase handles redundancy and backups  
✅ **Environment-Based:** Credentials stored in Vercel, never hardcoded  
✅ **Production-Ready:** Fully managed by Supabase with automatic scaling  

---

## How It's Configured in the Application

1. Full connection string stored in Vercel environment variables as `POSTGRES_URL`
2. Application reads this variable in `lib/db/config.ts`
3. Connection pooling automatically handled by Supabase
4. Application falls back to mock data if database is not configured

---

## For Agent Steps

When an Agent Step needs to connect to or reference the production database:

**Host:** `aws-0-us-east-1.pooler.supabase.com`  
**Port:** `6543`  
**Database:** `postgres`  
**Connection String:** `postgresql://[user]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`  
**Environment Variable:** `POSTGRES_URL` (in Vercel)

---

## Important Notes

⚠️ **Never expose credentials in code or logs**  
⚠️ **Always use port 6543 (pooled), NOT 5432**  
⚠️ **Credentials are stored securely in Vercel**  
⚠️ **Connection string format must include the full path**

---

## Related Documentation

- `MASTER_AGENT_GUIDE.md` - Complete environment variable reference
- `SUPABASE_DATABASE_CONNECTION.md` - Detailed Supabase setup
- `PRODUCTION_DATABASE_FIX.md` - Production database fix guide
- `CALENDAR_EVENTS_PERSISTENCE_ISSUE.md` - Calendar sync issue analysis
- `README_CALENDAR_FIX.md` - Quick reference for calendar fix

---

**Last Updated:** October 22, 2025, 10:37 PM (America/Chicago)  
**Status:** Production Ready  
**Format:** Agent Step Reference
