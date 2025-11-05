# 🔑 How to Get Your Supabase Anon Key

## Step-by-Step Instructions

### 1. Go to Supabase Dashboard
Open this URL in your browser:
https://supabase.com/dashboard

### 2. Select Your Project
- You should see your project listed
- Click on your AutoPrep project (the one with your database)

### 3. Navigate to API Settings
- On the left sidebar, click **Settings** (gear icon at bottom)
- Then click **API**

### 4. Find the Anon Key
You'll see a section called "Project API keys" with two keys:

- **anon** **public** key ← This is what you need!
- **service_role** key (don't use this one)

### 5. Copy the Anon Key
- Click the copy icon next to the **anon public** key
- It will look something like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttc3dyenpsa...
```

(It's a long string starting with "eyJ")

### 6. Use It in Vercel
Now go to Vercel and add this as the value for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Visual Guide

```
Supabase Dashboard
  ↓
Settings (gear icon)
  ↓
API
  ↓
Project API keys
  ↓
anon public ← Copy this one!
```

---

## What This Key Does

The anon key allows your application to:
- Upload files to Supabase Storage
- Read files from Supabase Storage
- Access public data

It's safe to use in your frontend code (that's why it's called "public").

---

## Need Help?

If you can't find it, send me a screenshot of your Supabase dashboard and I'll help you locate it!
