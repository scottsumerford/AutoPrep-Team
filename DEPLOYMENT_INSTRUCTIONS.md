# Deployment Instructions - Lindy API Integration Fix

## Problem Summary

The "Generating Report..." and "Creating Slides..." buttons on the live site (team.autoprep.ai) are stuck in a loading state. This is because the backend is trying to trigger Lindy agents but the `LINDY_API_KEY` environment variable is not configured in the Vercel production environment.

## What Was Fixed

### Code Changes
1. **Updated `/app/api/lindy/presales-report/route.ts`**
   - Now uses Lindy API directly: `https://api.lindy.ai/v1/agents/{agentId}/invoke`
   - Requires `LINDY_API_KEY` environment variable
   - Sends event data to agent and webhook callback URL

2. **Updated `/app/api/lindy/slides/route.ts`**
   - Same implementation as presales-report
   - Uses Lindy API to trigger slides generation agent
   - Requires `LINDY_API_KEY` environment variable

3. **Updated `.env.example`**
   - Removed old webhook URL variables
   - Added `LINDY_API_KEY` as required variable
   - Documented agent IDs

## What You Need to Do

### Step 1: Get Your Lindy API Key

1. Go to [Lindy Dashboard](https://app.lindy.ai)
2. Click on your profile/settings
3. Navigate to **Settings → API Keys**
4. Click **Create New API Key**
5. Copy the API key (you won't be able to see it again)

### Step 2: Add Environment Variable to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select the **AutoPrep-Team** project
3. Go to **Settings → Environment Variables**
4. Click **Add New**
5. Fill in:
   - **Name**: `LINDY_API_KEY`
   - **Value**: (paste your Lindy API key)
   - **Environments**: Select all (Production, Preview, Development)
6. Click **Save**

### Step 3: Redeploy

The deployment should happen automatically, but you can force a redeploy:

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select the **AutoPrep-Team** project
3. Go to **Deployments**
4. Find the latest deployment
5. Click the three dots menu
6. Select **Redeploy**

Or simply push a new commit to trigger a redeploy:
```bash
git commit --allow-empty -m "chore: trigger redeploy with LINDY_API_KEY configured"
git push origin main
```

### Step 4: Verify the Fix

1. Go to [team.autoprep.ai/profile/3](https://team.autoprep.ai/profile/3)
2. Scroll down to Calendar Events
3. Click "PDF Pre-sales Report" on the "ATT intro call test" event
4. The button should show "Generating Report..." with a spinner
5. Wait 30-60 seconds for the agent to process
6. The button should change to "Download PDF Report" (green)
7. Click to download and verify the PDF

## How It Works

### Complete Flow

```
1. User clicks "PDF Pre-sales Report" button
   ↓
2. Frontend sends POST to /api/lindy/presales-report with:
   - event_id
   - event_title
   - event_description
   - attendee_email
   ↓
3. Backend updates database status to "processing"
   ↓
4. Backend calls Lindy API:
   POST https://api.lindy.ai/v1/agents/68aa4cb7ebbc5f9222a2696e/invoke
   Headers: Authorization: Bearer {LINDY_API_KEY}
   Body: {
     input: {
       calendar_event_id,
       event_title,
       event_description,
       attendee_email,
       webhook_url: "https://team.autoprep.ai/api/lindy/webhook"
     }
   }
   ↓
5. Lindy agent receives the request and starts processing
   ↓
6. Agent generates PDF and calls webhook:
   POST https://team.autoprep.ai/api/lindy/webhook
   Body: {
     agent_id: "68aa4cb7ebbc5f9222a2696e",
     calendar_event_id: 123,
     status: "completed",
     pdf_url: "https://storage.example.com/report.pdf"
   }
   ↓
7. Backend receives webhook and updates database:
   - Sets status to "completed"
   - Stores pdf_url
   ↓
8. Frontend polls for status updates every 10 seconds
   ↓
9. Frontend detects status change and updates button:
   - Changes text to "Download PDF Report"
   - Changes color to green
   - Enables click to download
```

## Troubleshooting

### Button Still Shows "Generating Report..."

**Check 1: Is LINDY_API_KEY configured?**
```bash
# In Vercel dashboard, go to Settings → Environment Variables
# Verify LINDY_API_KEY is listed and has a value
```

**Check 2: Is the API key valid?**
- Go to Lindy Dashboard
- Check if the API key is still active
- Try creating a new API key if the old one is expired

**Check 3: Check server logs**
- Go to Vercel Dashboard
- Select AutoPrep-Team project
- Go to Deployments → Latest → Logs
- Look for error messages about LINDY_API_KEY or Lindy API failures

### Button Shows "Retry Report"

This means the agent failed to process. Possible causes:
1. Agent couldn't find company information for the attendee
2. PDF generation failed
3. Network error during processing

**Solution:**
1. Click "Retry Report" to try again
2. Check Lindy agent logs for error details
3. Verify attendee email is valid

### PDF URL Not Accessible

If the button shows "Download PDF Report" but clicking doesn't work:
1. Check if the storage service is accessible
2. Verify the PDF URL in the database
3. Try regenerating the report

## Agent IDs

These are hardcoded in the endpoints:

- **Pre-sales Report Agent**: `68aa4cb7ebbc5f9222a2696e`
- **Slides Generation Agent**: `68ed392b02927e7ace232732`

If you need to change these, update:
- `/app/api/lindy/presales-report/route.ts` (line with `const agentId = ...`)
- `/app/api/lindy/slides/route.ts` (line with `const agentId = ...`)

## Testing Locally

If you want to test locally before deploying:

1. Create a `.env.local` file in the project root:
```bash
LINDY_API_KEY=your_lindy_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Run the development server:
```bash
npm run dev
```

3. Navigate to `http://localhost:3000/profile/3`

4. Click "PDF Pre-sales Report" button

5. Check the terminal for logs to see if the Lindy API call succeeds

## Files Modified

- `/app/api/lindy/presales-report/route.ts` - Updated to use Lindy API
- `/app/api/lindy/slides/route.ts` - Updated to use Lindy API
- `.env.example` - Updated environment variables
- `LINDY_API_INTEGRATION_GUIDE.md` - Comprehensive integration guide

## Support

If you encounter issues:

1. **Check Lindy Documentation**: https://docs.lindy.ai
2. **Check Vercel Logs**: Vercel Dashboard → Deployments → Logs
3. **Check Database**: Verify calendar_events table has correct status values
4. **Check Frontend Console**: Browser DevTools → Console for errors

## Next Steps

After deploying:

1. ✅ Add LINDY_API_KEY to Vercel environment variables
2. ✅ Redeploy the application
3. ✅ Test with "ATT intro call test" event
4. ✅ Verify PDF is generated and downloadable
5. ✅ Test with "Test new process" event
6. ✅ Test slides generation
7. ✅ Monitor for any errors in Vercel logs

## Questions?

Refer to:
- `LINDY_API_INTEGRATION_GUIDE.md` - Complete technical documentation
- `AGENT_CONTEXT.md` - Agent configuration details
- Lindy Dashboard - Agent logs and API key management
