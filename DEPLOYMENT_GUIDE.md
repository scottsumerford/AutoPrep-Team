# AutoPrep Team - Deployment Guide

## ✅ CRITICAL: Always Test Build Locally Before Pushing

**NEVER push code to GitHub without testing the build locally first!**

### Pre-Deployment Checklist

1. **Run the build locally:**
   ```bash
   bun run build
   ```

2. **Check for errors:**
   - TypeScript type errors
   - ESLint errors
   - Missing imports/exports
   - Type mismatches

3. **Common Issues to Watch For:**
   - ❌ Using `any` types (violates @typescript-eslint/no-explicit-any)
   - ❌ Missing function exports in lib/db/index.ts
   - ❌ Incorrect function signatures (wrong number of parameters)
   - ❌ Date objects in SQL queries (must convert to ISO strings)
   - ❌ Explicit type annotations in forEach callbacks (use type inference)

4. **Fix ALL errors before committing:**
   - Don't push partial fixes
   - Test the build after each fix
   - Only push when `bun run build` succeeds with no errors

### Deployment Process

1. **Test locally:** `bun run build`
2. **Commit changes:** `git add -A && git commit -m "message"`
3. **Push to GitHub:** `git push origin main`
4. **Vercel auto-deploys:** Wait 1-2 minutes for deployment
5. **Verify deployment:** Check https://team.autoprep.ai

### Database Connection Notes

- **Environment Variable:** `POSTGRES_URL` (set in Vercel)
- **Connection Type:** Pooled connection (port 6543)
- **Hostname:** `aws-0-us-east-1.pooler.supabase.com`
- **Fallback:** Mock data if database not configured

### Recent Fixes Applied

1. ✅ Fixed `trackTokenUsage` → `logTokenUsage` function rename
2. ✅ Added `getTotalTokensByType` function
3. ✅ Replaced `any` types with proper TypeScript types
4. ✅ Fixed calendar API route parameter mismatch
5. ✅ Converted Date objects to ISO strings in SQL queries
6. ✅ Removed explicit type annotation from forEach callback

### Success Criteria

- ✅ `bun run build` completes with exit code 0
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ All routes compile successfully
- ✅ Static pages generate without errors

---

**Remember:** One successful local build = One successful Vercel deployment
