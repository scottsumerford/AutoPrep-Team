# AutoPrep Team - Deployment Guide

## Quick Start Checklist

Follow these steps in order to deploy your AutoPrep Team Dashboard:

### ✅ Step 1: GitHub Repository (COMPLETED)
- [x] Repository created: https://github.com/scottsumerford/AutoPrep-Team
- [x] Code pushed to main branch

### 📋 Step 2: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account (scottsumerford)
3. **Import Project**:
   - Click "Add New..." → "Project"
   - Select "scottsumerford/AutoPrep-Team" from your repositories
   - Click "Import"

4. **Configure Build Settings**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `bun run build` (or leave default)
   - Output Directory: `.next` (leave as default)
   - Install Command: `bun install` (or leave default)

5. **Click "Deploy"** (don't add environment variables yet)

### 📋 Step 3: Set Up Vercel Postgres Database

1. **In your Vercel project dashboard**:
   - Go to the "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a database name (e.g., "autoprep-team-db")
   - Select region closest to your users
   - Click "Create"

2. **Connect Database to Project**:
   - Vercel will automatically add these environment variables:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

3. **Initialize Database Schema**:
   - Go to the "Data" tab in your Postgres database
   - Click "Query" or use the SQL editor
   - Copy and paste the contents of `lib/db/schema.sql`
   - Click "Run Query"

### 📋 Step 4: Configure OAuth Credentials

#### Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create/Select Project**:
   - Click project dropdown → "New Project"
   - Name: "AutoPrep Team"
   - Click "Create"

3. **Enable APIs**:
   - Go to "APIs & Services" → "Library"
   - Search and enable:
     - Google Calendar API
     - Gmail API
     - Google Drive API
     - Google Slides API

4. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Configure consent screen if prompted:
     - User Type: External
     - App name: AutoPrep Team
     - User support email: scottsumerford@gmail.com
     - Developer contact: scottsumerford@gmail.com
   - Application type: **Web application**
   - Name: "AutoPrep Team Production"
   - Authorized redirect URIs:
     - `https://team.autoprep.ai/api/auth/google/callback`
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need these)

#### Microsoft/Outlook OAuth Setup

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to Azure Active Directory**:
   - Search for "Azure Active Directory"
   - Click "App registrations"
   - Click "New registration"

3. **Register Application**:
   - Name: "AutoPrep Team"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI:
     - Platform: Web
     - URI: `https://team.autoprep.ai/api/auth/outlook/callback`
   - Click "Register"

4. **Create Client Secret**:
   - In your app, go to "Certificates & secrets"
   - Click "New client secret"
   - Description: "AutoPrep Team Production"
   - Expires: 24 months (or your preference)
   - Click "Add"
   - **Copy the secret VALUE immediately** (it won't show again)

5. **Copy Application (client) ID**:
   - Go to "Overview" tab
   - Copy the "Application (client) ID"

6. **Set API Permissions**:
   - Go to "API permissions"
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Select "Delegated permissions"
   - Add these permissions:
     - `Calendars.Read`
     - `Calendars.ReadWrite`
     - `Mail.Read`
     - `User.Read`
   - Click "Add permissions"
   - Click "Grant admin consent" (if you have admin rights)

### 📋 Step 5: Get Lindy API Key

1. **Go to your Lindy dashboard**: https://app.lindy.ai
2. **Navigate to Settings** → **API Keys**
3. **Create new API key** or copy existing one
4. **Save this key securely**

### 📋 Step 6: Add Environment Variables to Vercel

1. **In Vercel project dashboard**:
   - Go to "Settings" → "Environment Variables"

2. **Add these variables** (one at a time):

```
LINDY_API_KEY=your_lindy_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
NEXTAUTH_URL=https://team.autoprep.ai
NEXT_PUBLIC_APP_URL=https://team.autoprep.ai
```

3. **Generate NEXTAUTH_SECRET**:
   - Open terminal and run: `openssl rand -base64 32`
   - Copy the output
   - Add as environment variable:
     ```
     NEXTAUTH_SECRET=paste_generated_secret_here
     ```

4. **Select environments**: Production, Preview, Development (check all three)

### 📋 Step 7: Configure Custom Domain

1. **In Vercel project dashboard**:
   - Go to "Settings" → "Domains"
   - Click "Add"
   - Enter: `team.autoprep.ai`
   - Click "Add"

2. **Update DNS Records**:
   - Vercel will show you the DNS records to add
   - Go to your domain registrar (where autoprep.ai is registered)
   - Add the DNS records as shown by Vercel
   - Typically:
     - Type: `CNAME`
     - Name: `team`
     - Value: `cname.vercel-dns.com`

3. **Wait for DNS propagation** (5-30 minutes)

### 📋 Step 8: Redeploy with Environment Variables

1. **In Vercel project dashboard**:
   - Go to "Deployments" tab
   - Find the latest deployment
   - Click the three dots (•••)
   - Select "Redeploy"
   - Check "Use existing Build Cache"
   - Click "Redeploy"

2. **Wait for deployment to complete**

### 📋 Step 9: Test the Deployment

1. **Visit**: https://team.autoprep.ai
2. **Test these features**:
   - [ ] Homepage loads correctly
   - [ ] Can create a new profile
   - [ ] Profile page loads
   - [ ] Google OAuth button works
   - [ ] Outlook OAuth button works
   - [ ] Can toggle operation mode
   - [ ] Can enter manual email
   - [ ] Can set keyword filter

## Troubleshooting

### Database Connection Issues
- Verify Postgres environment variables are set in Vercel
- Check that schema was initialized correctly
- Review deployment logs in Vercel

### OAuth Errors
- Verify redirect URIs match exactly (including https://)
- Check that all required API permissions are granted
- Ensure environment variables are set correctly
- Make sure OAuth consent screen is configured

### Deployment Fails
- Check build logs in Vercel
- Verify all dependencies are in package.json
- Ensure environment variables are set

### Domain Not Working
- Verify DNS records are correct
- Wait for DNS propagation (can take up to 48 hours)
- Check domain configuration in Vercel

## Post-Deployment

### Testing Lindy Agent Integration

Once deployed, test the Lindy agent integration:

1. Create a test profile
2. Add a manual email address
3. Create a test calendar event (or wait for sync)
4. Click "PDF Pre-sales Report" button
5. Check that the agent is called successfully
6. Verify token usage is tracked

### Monitoring

- **Vercel Analytics**: Monitor performance and usage
- **Vercel Logs**: Check for errors and issues
- **Database**: Monitor query performance in Vercel Postgres dashboard

## Future Updates

To add features in the future:

1. **Tell this Lindy agent** what you want to add
2. **Provide context**: "Update the AutoPrep-Team repository"
3. **The agent will**:
   - Pull the latest code
   - Make the changes
   - Push to GitHub
   - Vercel will auto-deploy

## Support Contacts

- **GitHub Repository**: https://github.com/scottsumerford/AutoPrep-Team
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Domain**: https://team.autoprep.ai

## Security Notes

- Never commit `.env.local` or `.env` files to GitHub
- Keep OAuth credentials secure
- Rotate API keys periodically
- Use environment variables for all sensitive data
- Enable 2FA on GitHub and Vercel accounts

## Backup Strategy

- **Code**: Backed up in GitHub
- **Database**: Vercel Postgres has automatic backups
- **Environment Variables**: Document separately in secure location

---

**Deployment completed by**: Lindy AI Agent
**Date**: October 13, 2025
**Repository**: https://github.com/scottsumerford/AutoPrep-Team
