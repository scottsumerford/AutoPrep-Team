# Vercel Deployment Checklist for AutoPrep Team

Use this checklist to deploy your AutoPrep Team Dashboard to production.

---

## ☐ Step 1: Import Project to Vercel

1. [ ] Go to https://vercel.com and sign in
2. [ ] Click "Add New..." → "Project"
3. [ ] Select repository: `scottsumerford/AutoPrep-Team`
4. [ ] Click "Import"
5. [ ] Keep default settings (Next.js auto-detected)
6. [ ] Click "Deploy" (without environment variables for now)
7. [ ] Wait for initial deployment to complete

---

## ☐ Step 2: Create Vercel Postgres Database

1. [ ] In your Vercel project dashboard, click "Storage" tab
2. [ ] Click "Create Database"
3. [ ] Select "Postgres"
4. [ ] Name: `autoprep-team-db`
5. [ ] Select region: (choose closest to your users)
6. [ ] Click "Create"
7. [ ] Wait for database to be created
8. [ ] Verify environment variables were auto-added to project

---

## ☐ Step 3: Initialize Database Schema

1. [ ] In Vercel Postgres dashboard, click "Data" tab
2. [ ] Click "Query" or open SQL editor
3. [ ] Copy contents from `lib/db/schema.sql` in the repository
4. [ ] Paste into SQL editor
5. [ ] Click "Run Query"
6. [ ] Verify tables were created successfully

---

## ☐ Step 4: Set Up Google OAuth

### Create Google Cloud Project

1. [ ] Go to https://console.cloud.google.com
2. [ ] Click project dropdown → "New Project"
3. [ ] Name: "AutoPrep Team"
4. [ ] Click "Create"
5. [ ] Wait for project to be created

### Enable Required APIs

1. [ ] Go to "APIs & Services" → "Library"
2. [ ] Search and enable each:
   - [ ] Google Calendar API
   - [ ] Gmail API
   - [ ] Google Drive API
   - [ ] Google Slides API

### Configure OAuth Consent Screen

1. [ ] Go to "APIs & Services" → "OAuth consent screen"
2. [ ] User Type: Select "External"
3. [ ] Click "Create"
4. [ ] Fill in required fields:
   - [ ] App name: "AutoPrep Team"
   - [ ] User support email: scottsumerford@gmail.com
   - [ ] Developer contact: scottsumerford@gmail.com
5. [ ] Click "Save and Continue"
6. [ ] Scopes: Click "Save and Continue" (we'll add scopes later)
7. [ ] Test users: Add scottsumerford@gmail.com
8. [ ] Click "Save and Continue"

### Create OAuth Credentials

1. [ ] Go to "APIs & Services" → "Credentials"
2. [ ] Click "Create Credentials" → "OAuth client ID"
3. [ ] Application type: "Web application"
4. [ ] Name: "AutoPrep Team Production"
5. [ ] Authorized redirect URIs:
   - [ ] Add: `https://team.autoprep.ai/api/auth/google/callback`
6. [ ] Click "Create"
7. [ ] **SAVE THESE VALUES:**
   - [ ] Client ID: `_______________________________`
   - [ ] Client Secret: `_______________________________`

---

## ☐ Step 5: Set Up Microsoft/Outlook OAuth

### Create Azure App Registration

1. [ ] Go to https://portal.azure.com
2. [ ] Search for "Azure Active Directory"
3. [ ] Click "App registrations"
4. [ ] Click "New registration"
5. [ ] Fill in:
   - [ ] Name: "AutoPrep Team"
   - [ ] Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - [ ] Redirect URI: 
     - Platform: Web
     - URI: `https://team.autoprep.ai/api/auth/outlook/callback`
6. [ ] Click "Register"

### Create Client Secret

1. [ ] In your app, go to "Certificates & secrets"
2. [ ] Click "New client secret"
3. [ ] Description: "AutoPrep Team Production"
4. [ ] Expires: 24 months (or your preference)
5. [ ] Click "Add"
6. [ ] **SAVE THIS VALUE IMMEDIATELY (won't show again):**
   - [ ] Client Secret Value: `_______________________________`

### Copy Application ID

1. [ ] Go to "Overview" tab
2. [ ] **SAVE THIS VALUE:**
   - [ ] Application (client) ID: `_______________________________`

### Set API Permissions

1. [ ] Go to "API permissions"
2. [ ] Click "Add a permission"
3. [ ] Select "Microsoft Graph"
4. [ ] Select "Delegated permissions"
5. [ ] Add these permissions:
   - [ ] Calendars.Read
   - [ ] Calendars.ReadWrite
   - [ ] Mail.Read
   - [ ] User.Read
6. [ ] Click "Add permissions"
7. [ ] If you have admin rights: Click "Grant admin consent"

---

## ☐ Step 6: Get Lindy API Key

1. [ ] Go to https://app.lindy.ai
2. [ ] Navigate to Settings → API Keys
3. [ ] Create new API key or copy existing
4. [ ] **SAVE THIS VALUE:**
   - [ ] Lindy API Key: `_______________________________`

---

## ☐ Step 7: Generate NextAuth Secret

1. [ ] Open terminal and run:
   ```bash
   openssl rand -base64 32
   ```
2. [ ] **SAVE THIS VALUE:**
   - [ ] NextAuth Secret: `_______________________________`

---

## ☐ Step 8: Add Environment Variables to Vercel

1. [ ] In Vercel project, go to "Settings" → "Environment Variables"
2. [ ] Add each variable (select all environments: Production, Preview, Development):

### Required Variables

- [ ] `LINDY_API_KEY` = (from Step 6)
- [ ] `GOOGLE_CLIENT_ID` = (from Step 4)
- [ ] `GOOGLE_CLIENT_SECRET` = (from Step 4)
- [ ] `MICROSOFT_CLIENT_ID` = (from Step 5)
- [ ] `MICROSOFT_CLIENT_SECRET` = (from Step 5)
- [ ] `NEXTAUTH_SECRET` = (from Step 7)
- [ ] `NEXTAUTH_URL` = `https://team.autoprep.ai`
- [ ] `NEXT_PUBLIC_APP_URL` = `https://team.autoprep.ai`

3. [ ] Click "Save" for each variable

---

## ☐ Step 9: Configure Custom Domain

1. [ ] In Vercel project, go to "Settings" → "Domains"
2. [ ] Click "Add"
3. [ ] Enter: `team.autoprep.ai`
4. [ ] Click "Add"
5. [ ] Vercel will show DNS records to add

### Update DNS Records

1. [ ] Go to your domain registrar (where autoprep.ai is registered)
2. [ ] Find DNS settings for autoprep.ai
3. [ ] Add the records shown by Vercel (typically):
   - [ ] Type: CNAME
   - [ ] Name: team
   - [ ] Value: cname.vercel-dns.com (or as shown by Vercel)
4. [ ] Save DNS changes
5. [ ] Wait 5-30 minutes for DNS propagation

---

## ☐ Step 10: Redeploy with Environment Variables

1. [ ] In Vercel project, go to "Deployments" tab
2. [ ] Find the latest deployment
3. [ ] Click the three dots (•••) menu
4. [ ] Select "Redeploy"
5. [ ] Check "Use existing Build Cache"
6. [ ] Click "Redeploy"
7. [ ] Wait for deployment to complete

---

## ☐ Step 11: Test the Deployment

### Basic Functionality

1. [ ] Visit https://team.autoprep.ai
2. [ ] Verify homepage loads correctly
3. [ ] Click "Create New Profile"
4. [ ] Create a test profile
5. [ ] Verify profile appears on homepage

### Profile Page

1. [ ] Click on the test profile
2. [ ] Verify profile page loads
3. [ ] Check token tracking dashboard displays
4. [ ] Verify all sections are visible

### Google OAuth

1. [ ] Click "Connect Google" button
2. [ ] Verify OAuth flow starts
3. [ ] Sign in with Google account
4. [ ] Verify redirect back to profile page
5. [ ] Check "Google Connected" status

### Outlook OAuth

1. [ ] Click "Connect Outlook" button
2. [ ] Verify OAuth flow starts
3. [ ] Sign in with Microsoft account
4. [ ] Verify redirect back to profile page
5. [ ] Check "Outlook Connected" status

### Operation Mode Toggle

1. [ ] Toggle "Auto-sync Calendar" switch OFF
2. [ ] Verify "Manual email lookup mode" text appears
3. [ ] Verify "Attendee Email Address" field appears
4. [ ] Enter test email and click "Save"
5. [ ] Toggle switch back ON
6. [ ] Verify manual email field disappears

### Keyword Filter

1. [ ] Enter a keyword in "Keyword Filter" field
2. [ ] Click "Apply"
3. [ ] Verify filter is saved

---

## ☐ Step 12: Test Lindy Agent Integration

### Pre-sales Report

1. [ ] Create or wait for a calendar event to appear
2. [ ] Click "PDF Pre-sales Report" button
3. [ ] Verify agent is called (check browser console for response)
4. [ ] Check token usage updates in dashboard

### Slides Generation

1. [ ] Click "Create Slides" button on an event
2. [ ] Verify agent is called
3. [ ] Check token usage updates in dashboard

---

## ☐ Step 13: Monitor and Verify

### Check Logs

1. [ ] In Vercel project, go to "Logs" tab
2. [ ] Verify no errors in recent logs
3. [ ] Check for successful API calls

### Check Database

1. [ ] In Vercel Postgres, go to "Data" tab
2. [ ] Verify profiles table has data
3. [ ] Check token_usage table for entries

### Performance

1. [ ] Test page load speeds
2. [ ] Verify responsive design on mobile
3. [ ] Check for console errors in browser

---

## 🎉 Deployment Complete!

Once all checkboxes are complete, your AutoPrep Team Dashboard is live at:
**https://team.autoprep.ai**

---

## 📞 Troubleshooting

### OAuth Not Working
- Verify redirect URIs match exactly (including https://)
- Check that all required API permissions are granted
- Ensure environment variables are set correctly
- Clear browser cache and try again

### Database Errors
- Verify Postgres environment variables are set
- Check that schema was initialized correctly
- Review deployment logs for SQL errors

### Lindy Agents Not Responding
- Verify LINDY_API_KEY is correct
- Check agent IDs are correct (68aa4cb7ebbc5f9222a2696e, 68ed392b02927e7ace232732)
- Review browser console for API errors

### Domain Not Working
- Wait longer for DNS propagation (up to 48 hours)
- Verify DNS records are correct
- Check domain configuration in Vercel

---

## 📝 Post-Deployment Notes

- [ ] Document all credentials in secure location
- [ ] Set up monitoring/alerts in Vercel
- [ ] Schedule regular backups
- [ ] Plan for OAuth token refresh handling
- [ ] Consider adding more team members

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Production URL**: https://team.autoprep.ai
