# Deployment Instructions - OAuth Setup Complete

## ✅ What Has Been Completed

1. **Confirmation Dialogs Added**
   - Google authentication now shows "Connect with Google" confirmation dialog
   - Outlook authentication now shows "Connect with Outlook" confirmation dialog
   - Both dialogs explain the OAuth process before redirecting

2. **OAuth API Endpoints Created**
   - `/api/auth/google` - Handles Google OAuth flow
   - `/api/auth/outlook` - Handles Microsoft/Outlook OAuth flow
   - Both endpoints handle authorization code exchange and token storage

3. **Code Pushed to GitHub**
   - All changes committed and pushed to main branch
   - Vercel will automatically deploy these changes

## 🔧 Required: Add Environment Variables to Vercel

To complete the OAuth setup, you need to add the following environment variables in your Vercel dashboard:

### Steps:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the `AutoPrep-Team` project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

### Google OAuth Credentials (Provided by User)

```
GOOGLE_CLIENT_ID=1051265458075-8q5utrrhvqt29fvop7ftdj6qg71uiba6.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Microsoft/Outlook OAuth Credentials (To Be Configured)

```
OUTLOOK_CLIENT_ID=your_outlook_client_id_here
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret_here
```

### App URL (Already Set)

```
NEXT_PUBLIC_APP_URL=https://team.autoprep.ai
```

## 📋 Google OAuth Configuration Required

You also need to update your Google Cloud Console OAuth settings:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add the following **Authorized redirect URIs**:
   - `https://team.autoprep.ai/api/auth/google`
   - `http://localhost:3001/api/auth/google` (for local testing)

## 📋 Microsoft/Outlook OAuth Setup (Optional)

If you want to enable Outlook calendar integration:

1. Follow the instructions in `OAUTH_SETUP.md`
2. Create an Azure AD app registration
3. Add the credentials to Vercel environment variables
4. Add redirect URI: `https://team.autoprep.ai/api/auth/outlook`

## 🚀 After Adding Environment Variables

1. Vercel will automatically redeploy with the new environment variables
2. Visit https://team.autoprep.ai
3. Navigate to a profile page
4. Click "Connect Google" or "Connect Outlook"
5. Confirm in the dialog
6. Complete the OAuth flow
7. You'll be redirected back with the calendar connected!

## 📝 Testing Checklist

- [x] Confirmation dialog appears when clicking "Connect Google"
- [x] Confirmation dialog appears when clicking "Connect Outlook"
- [x] Cancel button closes the dialog without action
- [ ] "Continue to Google" redirects to Google OAuth (requires env vars)
- [ ] "Continue to Outlook" redirects to Microsoft OAuth (requires env vars)
- [ ] After OAuth, tokens are saved to database
- [ ] Calendar events are synced after connection

## 📚 Documentation Created

- `OAUTH_SETUP.md` - Detailed OAuth setup guide for both providers
- `.env.example` - Template for environment variables
- This file - Deployment instructions

## 🎉 Summary

The authentication buttons now properly show confirmation dialogs before redirecting to OAuth providers. Once you add the environment variables to Vercel and update the Google Cloud Console redirect URIs, the full OAuth flow will work in production!
