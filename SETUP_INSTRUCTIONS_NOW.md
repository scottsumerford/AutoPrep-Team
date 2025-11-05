# 🚀 Setup Instructions - Do This Now

## Step 1: Create Supabase Storage Bucket (2 minutes)

1. Open: https://supabase.com/dashboard
2. Select your AutoPrep project
3. Click **Storage** in left sidebar
4. Click **New bucket**
5. Enter name: `Files`
6. Check ✅ **Public bucket**
7. Click **Create bucket**

---

## Step 2: Apply Storage Policies & Database Migration (2 minutes)

1. In Supabase, click **SQL Editor** in left sidebar
2. Click **New query**
3. Copy and paste this ENTIRE SQL block:

```sql
-- Storage policies for Files bucket
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'Files');

CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'Files');

CREATE POLICY "Users can update files" ON storage.objects 
FOR UPDATE USING (bucket_id = 'Files');

CREATE POLICY "Users can delete files" ON storage.objects 
FOR DELETE USING (bucket_id = 'Files');

-- Database migration - add new columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_file TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_info_text TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slides_file TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_company_info_file ON profiles(company_info_file);
CREATE INDEX IF NOT EXISTS idx_profiles_slides_file ON profiles(slides_file);

-- Add comments
COMMENT ON COLUMN profiles.company_info_file IS 'URL to company info file in Supabase Storage';
COMMENT ON COLUMN profiles.company_info_text IS 'Text-based company information';
COMMENT ON COLUMN profiles.slides_file IS 'URL to slide template file in Supabase Storage';
```

4. Click **Run** (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

---

## Step 3: Get Supabase Anon Key (1 minute)

1. In Supabase, click **Settings** (gear icon at bottom of left sidebar)
2. Click **API**
3. Scroll to "Project API keys" section
4. Find the **anon** **public** key (NOT the service_role key)
5. Click the copy icon to copy it
6. It will look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

**SAVE THIS KEY** - you'll need it in the next step!

---

## Step 4: Add Environment Variable to Vercel (1 minute)

1. Open: https://vercel.com/scott-s-projects-53d26130/autoprep-team-subdomain-deployment/settings/environment-variables

2. Click **Add New**

3. Fill in:
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** [Paste the key you copied in Step 3]
   - **Environments:** Check ALL THREE boxes:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. Click **Save**

---

## ✅ Done!

Once you complete these 4 steps, tell me "Prerequisites complete" and I'll:
1. Commit the code changes
2. Deploy to testing environment
3. Test the file upload functionality
4. Verify everything works

---

## 🆘 Need Help?

If you get stuck on any step, let me know which step and I'll help you through it!
