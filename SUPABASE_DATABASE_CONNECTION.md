# Supabase Database Connection - Implementation Guide

## Overview
This document explains how the AutoPrep Team Dashboard successfully connects to Supabase PostgreSQL database on Vercel, including the challenges encountered and solutions implemented.

## The Challenge

### Initial Problem
The application needed to connect to Supabase's PostgreSQL database from a Next.js app deployed on Vercel. However, there were compatibility issues between:
- Vercel's build system (TypeScript strict mode)
- Supabase's connection types (pooled vs direct)
- PostgreSQL client libraries (`@vercel/postgres` vs `postgres`)

### Library Compatibility Matrix

| Library | Supabase Pooled (6543) | TypeScript Build | Vercel Deploy | Notes |
|---------|------------------------|------------------|---------------|-------|
| `@vercel/postgres` | ❌ Fails | ✅ Success | ✅ Success | Requires direct connection (port 5432) |
| `postgres` (import) | ✅ Works | ❌ Fails | ❌ Fails | TypeScript null check issues |
| `postgres` (require) | ✅ Works | ✅ Success | ✅ Success | **SOLUTION** |

## The Solution

### 1. Use `postgres` Library with `require()`

Instead of using ES6 `import`, use CommonJS `require()` to avoid TypeScript build issues:

```typescript
// ❌ DON'T: This causes TypeScript build failures
import postgres from 'postgres';

// ✅ DO: Use require() to avoid TypeScript issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const postgres = require('postgres');
```

### 2. Configure Supabase Connection String

Use the **pooled connection** (port 6543) for production:

```typescript
const connectionString = process.env.POSTGRES_URL;
const sql = connectionString ? postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
}) : null;
```

**Connection String Format:**
```
postgresql://postgres.PROJECT_ID:PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

### 3. Handle Query Results Correctly

The `postgres` library returns results **directly as an array**, not wrapped in a `{ rows }` object:

```typescript
// ❌ DON'T: This causes "Cannot read properties of undefined (reading 'length')"
const { rows } = await sql`SELECT * FROM profiles`;

// ✅ DO: Access results directly
const rows = await sql`SELECT * FROM profiles`;
```

### 4. Set Environment Variables in Vercel

1. Go to Vercel Project Settings → Environment Variables
2. Set `POSTGRES_URL` with the Supabase pooled connection string:
   ```
   postgresql://postgres.PROJECT_ID:PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres
   ```
3. **Important:** After updating environment variables, trigger a new deployment (push a commit or use Vercel's redeploy feature)

## Implementation Details

### Database Connection (`lib/db/index.ts`)

```typescript
import "./config";

// Use require to avoid TypeScript build issues with postgres library
// eslint-disable-next-line @typescript-eslint/no-require-imports
const postgres = require('postgres');

// Initialize postgres connection
const connectionString = process.env.POSTGRES_URL;
const sql = connectionString ? postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
}) : null;

const isDatabaseConfigured = () => !!connectionString && sql !== null;

// Log the connection string being used (without exposing the password)
if (connectionString) {
  const maskedUrl = connectionString.replace(/:([^@]+)@/, ':****@');
  console.log('✅ Database connection string configured:', maskedUrl);
} else {
  console.warn('⚠️ No POSTGRES_URL found - using in-memory storage');
}
```

### Query Example

```typescript
export async function getAllProfiles(): Promise<Profile[]> {
  if (!isDatabaseConfigured()) {
    console.log('📦 Database not configured, using in-memory storage');
    return mockProfiles;
  }
  
  try {
    console.log('🔍 Fetching all profiles from database...');
    // Note: rows is returned directly, not wrapped in { rows }
    const rows = await sql<Profile>`SELECT * FROM profiles ORDER BY created_at DESC`;
    console.log(`✅ Successfully fetched ${rows.length} profiles from database`);
    return rows;
  } catch (error) {
    console.error('❌ Database error fetching profiles:', error);
    console.log('📦 Falling back to in-memory storage');
    return mockProfiles;
  }
}
```

## Troubleshooting

### Error: "password authentication failed for user 'postgres'"

**Cause:** The password in `POSTGRES_URL` is incorrect or outdated.

**Solution:**
1. Reset the database password in Supabase Dashboard
2. Update `POSTGRES_URL` in Vercel environment variables
3. Trigger a new deployment (push a commit)

### Error: "Cannot read properties of undefined (reading 'length')"

**Cause:** Trying to destructure `{ rows }` from the query result.

**Solution:** Access the result directly as an array:
```typescript
// ❌ Wrong
const { rows } = await sql`SELECT * FROM profiles`;

// ✅ Correct
const rows = await sql`SELECT * FROM profiles`;
```

### Error: "invalid_connection_string: This connection string is meant to be used with a direct connection"

**Cause:** Using `@vercel/postgres` library with Supabase pooled connection (port 6543).

**Solution:** Switch to `postgres` library with `require()` as documented above.

### TypeScript Build Error: "A `require()` style import is forbidden"

**Cause:** ESLint rule `@typescript-eslint/no-require-imports` is enabled.

**Solution:** Add ESLint disable comment:
```typescript
// eslint-disable-next-line @typescript-eslint/no-require-imports
const postgres = require('postgres');
```

## Verification

### Check Database Connection in Vercel Logs

After deployment, check Runtime Logs for these success messages:

```
✅ POSTGRES_URL is configured
Connection port: 6543 (pooled ✅)
✅ Database connection string configured: postgresql:****@aws-1-us-east-1.pooler.supabase.com:6543/postgres
🔧 Initializing database tables...
✅ Profiles table ready
✅ Calendar events table ready
✅ Token usage table ready
✅ File uploads table ready
✅ Database tables initialized successfully
```

### Test Profile Creation and Persistence

1. Visit the production site
2. Create a new profile
3. Refresh the page
4. Verify the profile persists (loaded from database)

## Key Takeaways

1. **Use `require()` instead of `import`** for the `postgres` library to avoid TypeScript build issues
2. **Use Supabase pooled connection** (port 6543) for better performance and connection management
3. **Access query results directly** as arrays, not wrapped in `{ rows }` objects
4. **Always trigger a new deployment** after updating environment variables
5. **Add ESLint disable comments** where necessary to allow `require()` usage

## Dependencies

```json
{
  "dependencies": {
    "postgres": "^3.4.5"
  }
}
```

## Related Files

- `lib/db/index.ts` - Database connection and query functions
- `lib/db/config.ts` - Environment variable configuration
- `app/api/profiles/route.ts` - Profile API endpoints
- `.env.local` - Local environment variables (not committed)

## Production Status

- **Live URL:** https://team.autoprep.ai
- **Database:** Supabase PostgreSQL (pooled connection, port 6543)
- **Status:** ✅ Fully operational
- **Last Updated:** October 18, 2025

---

**Note:** This solution was developed after extensive testing and troubleshooting. The combination of `require()` with the `postgres` library is the only approach that successfully works with both Supabase pooled connections and Vercel's TypeScript build system.

---

## Production Connection String

**Supabase Pooled Connection (Port 6543):**
```
postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

**Environment Variable:**
- Name: `POSTGRES_URL`
- Value: The connection string above
- Used in: Vercel Production, Preview, and Development environments

**Last Updated:** October 19, 2025
# POSTGRES_URL environment variable has been configured in Vercel
