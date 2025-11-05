# 🚀 Quick Start - Supabase Storage Integration

## ⚡ 5-Minute Deployment Guide

### Step 1: Supabase Setup (2 minutes)

1. **Create Storage Bucket**
   - Go to: https://supabase.com/dashboard → Your Project → Storage
   - Click "New bucket"
   - Name: `Files`
   - Public: ✅ Yes
   - Click "Create"

2. **Set Storage Policies**
   - Go to: SQL Editor
   - Paste and run:
   ```sql
   CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'Files');
   CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'Files');
   CREATE POLICY "Users can update files" ON storage.objects FOR UPDATE USING (bucket_id = 'Files');
   CREATE POLICY "Users can delete files" ON storage.objects FOR DELETE USING (bucket_id = 'Files');
   ```

3. **Apply Database Migration**
   - In SQL Editor, paste and run:
   ```sql
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_file TEXT;
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_text TEXT;
   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slides_file TEXT;
   CREATE INDEX IF NOT EXISTS idx_profiles_company_info_file ON profiles(company_info_file);
   CREATE INDEX IF NOT EXISTS idx_profiles_slides_file ON profiles(slides_file);
   ```

4. **Get Anon Key**
   - Go to: Settings → API
   - Copy the "anon public" key

### Step 2: Vercel Setup (1 minute)

1. **Add Environment Variable**
   - Go to: https://vercel.com/scott-s-projects-53d26130/autoprep-team-subdomain-deployment/settings/environment-variables
   - Click "Add New"
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: [Paste the anon key from Step 1.4]
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

### Step 3: Deploy (2 minutes)

```bash
# Commit changes
git add -A
git commit -m "feat: migrate file storage to Supabase Storage"

# Push to GitHub (triggers auto-deploy)
git push origin main

# Wait 1-2 minutes for deployment
```

### Step 4: Test (1 minute)

1. Go to: https://team.autoprep.ai/profile/scott-autoprep
2. Scroll to "Upload Company Files"
3. Upload a test file
4. ✅ Success message should appear
5. Check Supabase Storage → Files bucket to verify

## 🎯 That's It!

Your file uploads now use Supabase Storage instead of database storage.

## 📚 Need More Details?

- **Full Setup Guide:** `SUPABASE_STORAGE_SETUP.md`
- **Deployment Instructions:** `DEPLOYMENT_INSTRUCTIONS.md`
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`

## 🆘 Troubleshooting

### "Supabase Storage not configured"
→ Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel and redeploy

### "Failed to upload file: policy violation"
→ Run the storage policy SQL commands in Supabase

### File uploads but URL not in database
→ Run the database migration SQL in Supabase

## 📞 Support

**Email:** scottsumerford@gmail.com

---

**Ready to deploy?** Follow the 4 steps above! ⬆️
