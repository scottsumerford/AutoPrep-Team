# OAuth Setup Guide

This guide explains how to set up Google and Microsoft OAuth for the AutoPrep Team Dashboard.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3001/api/auth/google` (for local development)
     - `https://team.autoprep.ai/api/auth/google` (for production)
5. Copy the Client ID and Client Secret to your `.env.local` file:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

## Microsoft/Outlook OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Configure the app:
   - Name: AutoPrep Team Dashboard
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: 
     - Platform: Web
     - URI: `http://localhost:3001/api/auth/outlook` (add production URL later)
5. After creation, go to "Certificates & secrets"
   - Create a new client secret
   - Copy the secret value immediately (it won't be shown again)
6. Go to "API permissions"
   - Click "Add a permission"
   - Choose "Microsoft Graph"
   - Select "Delegated permissions"
   - Add these permissions:
     - `Calendars.Read`
     - `User.Read`
     - `offline_access`
7. Copy the Application (client) ID and client secret to your `.env.local` file:
   ```
   OUTLOOK_CLIENT_ID=your_client_id_here
   OUTLOOK_CLIENT_SECRET=your_client_secret_here
   ```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Microsoft/Outlook OAuth
OUTLOOK_CLIENT_ID=your_outlook_client_id
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret

# Database (from Vercel)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database

# Lindy Agents
LINDY_API_KEY=your_lindy_api_key
PRESALES_AGENT_ID=68aa4cb7ebbc5f9222a2696e
SLIDES_AGENT_ID=68ed392b02927e7ace232732
```

## Testing OAuth Flow

1. Start the development server: `bun run dev`
2. Navigate to a profile page: `http://localhost:3001/profile/1`
3. Click "Connect Google" or "Connect Outlook"
4. You should see a confirmation dialog
5. Click "Continue to Google" or "Continue to Outlook"
6. Complete the OAuth flow in the popup/redirect
7. You'll be redirected back to the profile page with the connection established

## Production Deployment

For production on Vercel:

1. Add environment variables in Vercel dashboard
2. Update OAuth redirect URIs in Google Cloud Console and Azure Portal to use:
   - `https://team.autoprep.ai/api/auth/google`
   - `https://team.autoprep.ai/api/auth/outlook`
3. Set `NEXT_PUBLIC_APP_URL=https://team.autoprep.ai` in Vercel environment variables

## Database Schema

The OAuth tokens are stored in the `profiles` table:
- `google_access_token` - Google OAuth access token
- `google_refresh_token` - Google OAuth refresh token (for token renewal)
- `outlook_access_token` - Microsoft OAuth access token
- `outlook_refresh_token` - Microsoft OAuth refresh token (for token renewal)

## Security Notes

- Access tokens are stored securely in the database
- Refresh tokens allow automatic token renewal without re-authentication
- All OAuth flows use HTTPS in production
- Client secrets should never be exposed to the client-side code
