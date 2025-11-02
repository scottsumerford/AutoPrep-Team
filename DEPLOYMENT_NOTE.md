# Deployment Note - October 22, 2025

## Database Configuration Fix

Added POSTGRES_URL environment variable to Vercel:
- Connection: Supabase pooled connection (port 6543)
- Database: postgres
- Host: aws-1-us-east-1.pooler.supabase.com

This enables calendar events to be persisted to the database instead of in-memory storage.

## Changes
- Environment variable POSTGRES_URL added to Vercel
- Calendar sync will now save events to Supabase database
- Events will persist across page refreshes

## Testing
- Profile page loads correctly
- Calendar authentication buttons display
- Calendar events will now be saved to database
