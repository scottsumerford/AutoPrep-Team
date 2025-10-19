# Vercel Database Setup Guide for AutoPrep Team

## Current Issue

Your profiles are **NOT being saved to the database** on the live site (team.autoprep.ai) because the `POSTGRES_URL` environment variable is not configured in Vercel.

**Evidence from logs:**
```
❌ No POSTGRES_URL found in environment variables
⚠️ No POSTGRES_URL found - using in-memory storage
📦 Database not configured, saving to in-memory storage
```

This means profiles are saved to memory temporarily but are **lost when the server restarts or redeploys**.

---

## Solution: Set Up Vercel Postgres Database

### Option 1: Create New Vercel Postgres Database (Recommended)

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Sign in with your account

2. **Select Your Project**
   - Find and click on "AutoPrep-Team" project
   - Or go directly to: https://vercel.com/scottsumerford/autoprep-team

3. **Create Postgres Database**
   - Click on the **"Storage"** tab at the top
   - Click **"Create Database"**
   - Select **"Postgres"**
   - Choose a name (e.g., "autoprep-team-db")
   - Select your preferred region (closest to your users)
   - Click **"Create"**

4. **Connect Database to Project**
   - Vercel will show you a list of projects
   - Select **"AutoPrep-Team"**
   - Click **"Connect"**
   - Vercel will automatically add these environment variables:
     - `POSTGRES_URL` (pooled connection - this is what we need!)
     - `POSTGRES_URL_NON_POOLING` (direct connection)
     - `POSTGRES_PRISMA_URL` (for Prisma)
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

5. **Redeploy Your Application**
   - Go to the **"Deployments"** tab
   - Click the three dots (...) on the latest deployment
   - Select **"Redeploy"**
   - Wait for deployment to complete (usually 1-2 minutes)

6. **Verify Database Connection**
   - Go to: https://team.autoprep.ai
   - Open browser console (F12)
   - Create a test profile
   - Check the Vercel logs for:
     ```
     ✅ Database connection string configured
     💾 Inserting profile into database...
     ✅ Profile created successfully in database
     ```

---

### Option 2: Use Existing Postgres Database

If you already have a Postgres database elsewhere:

1. **Get Your Connection String**
   - Format: `postgres://username:password@host:PORT/database?sslmode=require`
   - **IMPORTANT:** Use a **pooled connection** (port 6543) not direct (port 5432)
   - Example: `postgres://user:pass@db.example.com:6543/autoprep?sslmode=require`

2. **Add to Vercel Environment Variables**
   - Go to: https://vercel.com/scottsumerford/autoprep-team/settings/environment-variables
   - Click **"Add New"**
   - Key: `POSTGRES_URL`
   - Value: Your connection string
   - Environment: Select **"Production"**, **"Preview"**, and **"Development"**
   - Click **"Save"**

3. **Redeploy**
   - Go to Deployments tab
   - Redeploy the latest deployment

---

## Verifying the Fix

### Step 1: Check Vercel Logs

1. Go to: https://vercel.com/scottsumerford/autoprep-team
2. Click on the latest deployment
3. Click **"View Function Logs"**
4. Look for these success indicators:

**Before Fix (Current State):**
```
❌ No POSTGRES_URL found in environment variables
⚠️ No POSTGRES_URL found - using in-memory storage
📦 Database not configured, saving to in-memory storage
```

**After Fix (Expected):**
```
✅ Database connection string configured: postgres://****@****
🔧 Initializing database tables...
✅ Profiles table ready
✅ Calendar events table ready
✅ Token usage table ready
✅ File uploads table ready
✅ Database tables initialized successfully
```

### Step 2: Test Profile Creation

1. Go to: https://team.autoprep.ai
2. Click **"Create New Profile"**
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Title: Test Manager
4. Click **"Create Profile"**
5. Check Vercel logs for:
   ```
   📝 Creating new profile: { name: 'Test User', email: 'test@example.com' }
   💾 Inserting profile into database...
   ✅ Profile created successfully in database: { id: 1, name: 'Test User' }
   ```

### Step 3: Verify Persistence

1. Create a profile on https://team.autoprep.ai
2. Note the profile name
3. Refresh the page
4. **The profile should still be there!** ✅
5. If it disappears, the database is not connected ❌

---

## Database Schema Initialization

The database tables will be **automatically created** on the first API call after setting up POSTGRES_URL. The application includes an `initializeDatabase()` function that creates:

- ✅ `profiles` table
- ✅ `calendar_events` table
- ✅ `token_usage` table
- ✅ `file_uploads` table
- ✅ All necessary indexes

**No manual SQL execution required!**

However, if you want to run the schema manually:

```bash
# Get your POSTGRES_URL from Vercel
# Then run:
psql "$POSTGRES_URL" < lib/db/schema.sql
```

---

## Troubleshooting

### Issue: "Still seeing in-memory storage messages"

**Cause:** Environment variable not set or deployment not restarted

**Fix:**
1. Verify POSTGRES_URL is in Vercel environment variables
2. Make sure it's set for "Production" environment
3. Redeploy the application
4. Clear browser cache and reload

### Issue: "Database connection timeout"

**Cause:** Using direct connection (port 5432) instead of pooled (port 6543)

**Fix:**
1. Check your POSTGRES_URL
2. Make sure it uses port **6543** (pooled)
3. Update the environment variable
4. Redeploy

### Issue: "Table does not exist"

**Cause:** Database tables not created

**Fix:**
1. Check Vercel logs for initialization messages
2. If not initialized, manually run the schema:
   ```bash
   psql "$POSTGRES_URL" < lib/db/schema.sql
   ```
3. Or trigger initialization by making an API call

### Issue: "Permission denied"

**Cause:** Database user doesn't have CREATE TABLE permissions

**Fix:**
1. Grant permissions to your database user
2. Or use a user with admin privileges
3. Update POSTGRES_URL with correct credentials

---

## Quick Checklist

- [ ] Go to Vercel Dashboard
- [ ] Navigate to AutoPrep-Team project
- [ ] Go to Storage tab
- [ ] Create Postgres database
- [ ] Connect to project
- [ ] Verify POSTGRES_URL is in environment variables
- [ ] Redeploy application
- [ ] Test profile creation
- [ ] Check Vercel logs for ✅ success messages
- [ ] Verify profile persists after page refresh

---

## Expected Results After Setup

### Homepage (team.autoprep.ai)
- ✅ Profiles are displayed
- ✅ Profiles persist after refresh
- ✅ Can create new profiles
- ✅ Can click on profiles to view details

### Profile Page
- ✅ Profile information loads
- ✅ Can update settings
- ✅ Can connect Google/Outlook
- ✅ Calendar events are saved
- ✅ Token usage is tracked

### Vercel Logs
```
✅ Database connection string configured
📝 Creating new profile: { name: 'John Doe', email: 'john@example.com' }
💾 Inserting profile into database...
✅ Profile created successfully in database: { id: 1, name: 'John Doe' }
🔍 Fetching all profiles from database...
✅ Successfully fetched 1 profiles from database
```

---

## Need Help?

If you're still having issues after following this guide:

1. **Check Vercel Logs:**
   - Go to: https://vercel.com/scottsumerford/autoprep-team
   - Click latest deployment → "View Function Logs"
   - Look for error messages

2. **Check Browser Console:**
   - Press F12 on team.autoprep.ai
   - Go to Console tab
   - Look for API errors

3. **Verify Environment Variables:**
   - Go to: https://vercel.com/scottsumerford/autoprep-team/settings/environment-variables
   - Confirm POSTGRES_URL exists
   - Confirm it's set for Production

4. **Contact Support:**
   - Provide Vercel logs
   - Provide browser console errors
   - Describe what you've tried

---

**Last Updated:** October 18, 2025, 8:56 PM CST  
**Status:** Waiting for Vercel Postgres setup
