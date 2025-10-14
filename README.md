# AutoPrep Team Dashboard

A comprehensive team management dashboard for automating pre-sales workflows with Google/Outlook calendar integration and AI-powered report generation.

## Features

- **User Profile Management**: Create and manage team member profiles
- **Calendar Integration**: Connect Google Calendar and Outlook Calendar
- **Operation Modes**: 
  - Auto-sync: Automatically pull calendar events
  - Manual: Enter attendee emails manually
- **Keyword Filtering**: Filter calendar events by keywords
- **AI-Powered Generation**:
  - Pre-sales reports via Lindy agent
  - Presentation slides via Lindy agent
- **Token Tracking**: Monitor token usage across all operations
- **File Management**: Upload pitch deck templates and company information

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: Vercel Postgres
- **Authentication**: OAuth 2.0 (Google & Microsoft)
- **AI Integration**: Lindy AI Agents

## Getting Started

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Repository is at `https://github.com/scottsumerford/AutoPrep-Team`
3. **Google Cloud Console**: For Google OAuth credentials
4. **Microsoft Azure**: For Outlook OAuth credentials
5. **Lindy API Key**: From your Lindy account

### Deployment Steps

#### 1. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import the GitHub repository: `scottsumerford/AutoPrep-Team`
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `bun run build`
   - Output Directory: .next

#### 2. Set Up Vercel Postgres

1. In your Vercel project dashboard, go to the "Storage" tab
2. Click "Create Database" → Select "Postgres"
3. Follow the prompts to create your database
4. Vercel will automatically add the database environment variables to your project

#### 3. Initialize Database Schema

After deploying, you need to run the database schema:

```bash
# Connect to your Vercel Postgres database using the connection string from Vercel
psql "YOUR_POSTGRES_URL_FROM_VERCEL"

# Then run the schema file
\i lib/db/schema.sql
```

Or use the Vercel CLI:
```bash
vercel env pull .env.local
bun run db:init
```

#### 4. Configure OAuth Credentials

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Calendar API, Gmail API, Google Drive API, and Google Slides API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: Web application
6. Authorized redirect URIs: `https://team.autoprep.ai/api/auth/google/callback`
7. Copy the Client ID and Client Secret

**Microsoft OAuth:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Name: AutoPrep Team
5. Redirect URI: `https://team.autoprep.ai/api/auth/outlook/callback`
6. After creation, go to "Certificates & secrets" → Create new client secret
7. Copy the Application (client) ID and client secret value
8. Go to "API permissions" → Add Microsoft Graph permissions:
   - Calendars.Read
   - Mail.Read
   - User.Read

#### 5. Configure Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

```
LINDY_API_KEY=your_lindy_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
NEXTAUTH_SECRET=generate_random_string_here
NEXTAUTH_URL=https://team.autoprep.ai
NEXT_PUBLIC_APP_URL=https://team.autoprep.ai
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

#### 6. Configure Custom Domain

1. In Vercel project settings, go to "Domains"
2. Add domain: `team.autoprep.ai`
3. Follow Vercel's instructions to update your DNS records
4. Wait for DNS propagation (usually 5-10 minutes)

#### 7. Redeploy

After adding all environment variables, trigger a new deployment:
- Go to Deployments tab
- Click the three dots on the latest deployment
- Select "Redeploy"

## Lindy Agent Integration

The application integrates with two Lindy agents:

1. **Pre-sales Report Agent** (ID: `68aa4cb7ebbc5f9222a2696e`)
   - Generates comprehensive pre-sales reports
   - Uses company information and attendee details
   - Outputs PDF reports

2. **Slides Generation Agent** (ID: `68ed392b02927e7ace232732`)
   - Creates presentation slides
   - Uses pitch deck templates
   - Outputs Google Slides or PowerPoint

### Connecting Additional Lindy Agents

To add more Lindy agents in the future:

1. Update `lib/lindy.ts` with new agent IDs
2. Create new API routes in `app/api/lindy/[agent-name]/route.ts`
3. Add UI buttons in the profile page
4. Update token tracking to include new operation types

## Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/scottsumerford/AutoPrep-Team.git
cd AutoPrep-Team

# Install dependencies
bun install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
bun run dev
```

Visit `http://localhost:3000`

### Project Structure

```
autoprep-team/
├── app/
│   ├── api/              # API routes
│   │   ├── profiles/     # Profile management
│   │   ├── calendar/     # Calendar events
│   │   ├── tokens/       # Token usage tracking
│   │   └── lindy/        # Lindy agent integration
│   ├── profile/[id]/     # Profile detail page
│   ├── page.tsx          # Homepage (dashboard)
│   └── layout.tsx        # Root layout
├── components/
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── db/               # Database functions & schema
│   ├── lindy.ts          # Lindy agent integration
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## Database Schema

### Tables

- **profiles**: User profile information and OAuth tokens
- **calendar_events**: Synced calendar events
- **token_usage**: Track token consumption by operation type
- **file_uploads**: Uploaded templates and company info

See `lib/db/schema.sql` for complete schema.

## Token Tracking

The application tracks token usage for:
- **agent_run**: General agent operations
- **presales_report**: Pre-sales report generation
- **slides_generation**: Slide deck creation

View token statistics on each profile page.

## Future Development

To add new features:

1. **Via Lindy Agent** (Recommended):
   - Provide the GitHub repository URL
   - Describe the feature you want to add
   - The agent will pull the code, make changes, and push updates

2. **Manual Development**:
   - Clone the repository
   - Make your changes
   - Push to GitHub
   - Vercel will automatically deploy

## Troubleshooting

### Database Connection Issues
- Verify Vercel Postgres environment variables are set
- Check that database schema has been initialized
- Review Vercel deployment logs

### OAuth Not Working
- Verify redirect URIs match exactly in Google/Microsoft consoles
- Check that all required API permissions are granted
- Ensure environment variables are set correctly

### Lindy Agent Errors
- Verify LINDY_API_KEY is set correctly
- Check agent IDs are correct
- Review API response in browser console

## Support

For issues or questions:
- Check Vercel deployment logs
- Review browser console for errors
- Contact support with specific error messages

## License

Proprietary - AutoPrep Team Dashboard
