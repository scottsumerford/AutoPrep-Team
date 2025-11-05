# ✅ Deployment Checklist - Supabase Storage Integration

Print this checklist and check off each item as you complete it.

---

## 📋 Pre-Deployment (Supabase)

### Storage Bucket Setup
- [ ] Logged into Supabase dashboard
- [ ] Navigated to Storage section
- [ ] Created new bucket named "Files"
- [ ] Set bucket to Public
- [ ] Verified bucket appears in Storage list

### Storage Policies
- [ ] Opened SQL Editor in Supabase
- [ ] Copied storage policy SQL from QUICK_START.md
- [ ] Pasted and executed SQL
- [ ] Verified "Success" message
- [ ] Confirmed 4 policies created

### Database Migration
- [ ] Still in SQL Editor
- [ ] Copied migration SQL from QUICK_START.md
- [ ] Pasted and executed SQL
- [ ] Verified "Success" message
- [ ] Confirmed 3 columns added to profiles table

### Get Anon Key
- [ ] Navigated to Settings → API
- [ ] Located "anon public" key
- [ ] Copied key to clipboard
- [ ] Saved key in secure location (password manager)

---

## 🚀 Deployment (Vercel)

### Environment Variables
- [ ] Opened Vercel dashboard
- [ ] Navigated to project settings
- [ ] Clicked Environment Variables
- [ ] Added new variable: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Pasted anon key as value
- [ ] Selected all environments (Production, Preview, Development)
- [ ] Clicked Save
- [ ] Verified variable appears in list

### Code Deployment
- [ ] Opened terminal in project directory
- [ ] Ran: `git add -A`
- [ ] Ran: `git commit -m "feat: migrate file storage to Supabase Storage"`
- [ ] Ran: `git push origin main`
- [ ] Opened Vercel deployments page
- [ ] Verified deployment started
- [ ] Waited for deployment to complete (1-2 minutes)
- [ ] Verified deployment status: ✅ Ready

---

## 🧪 Testing (Production)

### File Upload Test - Company Info
- [ ] Opened: https://team.autoprep.ai/profile/scott-autoprep
- [ ] Scrolled to "Upload Company Files" section
- [ ] Clicked "Upload File" tab
- [ ] Selected a test PDF or Word document
- [ ] Clicked "Upload" button
- [ ] Verified success message appeared
- [ ] Noted filename in success message

### Verify in Supabase Storage
- [ ] Opened Supabase dashboard → Storage → Files
- [ ] Navigated to profile folder (e.g., "1/company_info/")
- [ ] Verified uploaded file appears
- [ ] Clicked file to view details
- [ ] Copied public URL

### Verify in Database
- [ ] Opened Supabase dashboard → Table Editor → profiles
- [ ] Found your profile row
- [ ] Checked `company_info_file` column
- [ ] Verified it contains the file URL
- [ ] Confirmed URL matches Supabase Storage URL

### File Upload Test - Slide Template
- [ ] Back to: https://team.autoprep.ai/profile/scott-autoprep
- [ ] Scrolled to "Upload Slide Template" section
- [ ] Selected a test PowerPoint or PDF
- [ ] Clicked "Upload" button
- [ ] Verified success message appeared
- [ ] Checked Supabase Storage (Files/1/slides/)
- [ ] Verified file appears
- [ ] Checked database `slides_file` column
- [ ] Confirmed URL is stored

### Webhook Integration Test - Pre-sales Report
- [ ] On profile page, found a calendar event
- [ ] Clicked "Generate Pre-Sales Report"
- [ ] Waited for processing
- [ ] Opened Vercel dashboard → Logs
- [ ] Searched for "PRESALES_REPORT_WEBHOOK"
- [ ] Verified webhook payload includes `company_info_file_url`
- [ ] Confirmed URL matches uploaded file

### Webhook Integration Test - Slides
- [ ] On profile page, found a calendar event
- [ ] Clicked "Generate Slides"
- [ ] Waited for processing
- [ ] Opened Vercel dashboard → Logs
- [ ] Searched for "SLIDES_WEBHOOK"
- [ ] Verified webhook payload includes `slides_template_url`
- [ ] Confirmed URL matches uploaded file

---

## 🎉 Post-Deployment

### Documentation
- [ ] Read IMPLEMENTATION_SUMMARY.md
- [ ] Bookmarked SUPABASE_STORAGE_SETUP.md for reference
- [ ] Saved DEPLOYMENT_INSTRUCTIONS.md for future deployments
- [ ] Shared documentation with team (if applicable)

### Monitoring
- [ ] Set up Vercel deployment notifications
- [ ] Bookmarked Vercel logs page
- [ ] Bookmarked Supabase dashboard
- [ ] Added calendar reminder to check logs in 24 hours

### Cleanup (Optional)
- [ ] Deleted old test files from Supabase Storage
- [ ] Reviewed and cleaned up test data in database
- [ ] Updated any internal documentation

---

## 📊 Success Criteria

All of these should be ✅ true:

- [ ] Files upload successfully via web interface
- [ ] Files appear in Supabase Storage bucket "Files"
- [ ] File URLs stored in database profiles table
- [ ] Pre-sales report webhook receives file URLs
- [ ] Slides generation webhook receives file URLs
- [ ] No errors in Vercel logs
- [ ] No errors in browser console
- [ ] Success messages appear after uploads

---

## 🆘 If Something Goes Wrong

### Deployment Failed
1. Check Vercel deployment logs for errors
2. Verify all environment variables are set
3. Try redeploying from Vercel dashboard

### File Upload Fails
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set in Vercel
3. Check Supabase Storage policies are applied
4. Verify bucket name is exactly "Files" (case-sensitive)

### Files Upload But Not Stored in Database
1. Verify database migration was applied
2. Check Vercel logs for database errors
3. Confirm `POSTGRES_URL` is set correctly

### Webhooks Don't Receive File URLs
1. Check Vercel logs for webhook payload
2. Verify latest code is deployed
3. Confirm profile has uploaded files

### Need Help?
- **Email:** scottsumerford@gmail.com
- **Documentation:** See DEPLOYMENT_INSTRUCTIONS.md
- **Logs:** https://vercel.com/scott-s-projects-53d26130/autoprep-team-subdomain-deployment/logs

---

## 📅 Deployment Info

**Date:** ___________________

**Time:** ___________________

**Deployed By:** ___________________

**Deployment URL:** https://team.autoprep.ai

**Vercel Deployment ID:** ___________________

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

**Status:** 
- [ ] ✅ Deployment Complete
- [ ] ✅ All Tests Passed
- [ ] ✅ Production Ready

**Signature:** _____________________  **Date:** ___________
