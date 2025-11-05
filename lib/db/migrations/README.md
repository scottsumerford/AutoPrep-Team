# Database Migrations

## How to Apply Migrations

### Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of the migration file
4. Paste and execute

### Using psql Command Line

```bash
# Set your Supabase connection string
export SUPABASE_URL="postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

# Apply migration
psql $SUPABASE_URL -f lib/db/migrations/add_file_columns.sql
```

## Migration: add_file_columns.sql

**Purpose:** Add file storage columns to profiles table for Supabase Storage integration

**Columns Added:**
- `company_info_file` (TEXT) - URL to company information file in Supabase Storage
- `company_info_text` (TEXT) - Company information entered as text
- `slides_file` (TEXT) - URL to slide template file in Supabase Storage

**Indexes Added:**
- `idx_profiles_company_info_file` - Index on company_info_file column
- `idx_profiles_slides_file` - Index on slides_file column

**Status:** Ready to apply
