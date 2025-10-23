# Changelog

All notable changes to the AutoPrep Team Dashboard are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-22

### Added

#### Critical Bug Fixes
- **15-Minute Timeout Retry Logic** - Fixed "Generating Report..." showing indefinitely
  - Added `presales_report_started_at` and `slides_started_at` columns to track when processing started
  - Updated stale detection logic to check `presales_report_started_at` instead of `created_at`
  - Updated stale detection logic to check `slides_started_at` instead of `created_at`
  - Database cleanup functions now mark stale runs as 'failed' on every API request

- **Calendar Sync Deletion** - Fixed SQL injection vulnerability and deletion logic
  - Replaced unsafe `sql.unsafe()` with proper parameterized queries
  - Fixed `deleteRemovedCalendarEvents()` to correctly delete events not in remote calendar
  - Verified deletion logic with test data

#### Database Schema
- Added `presales_report_started_at` TIMESTAMP column to `calendar_events` table
- Added `slides_started_at` TIMESTAMP column to `calendar_events` table
- Both columns track when report/slides generation processing started

#### API Endpoints
- `POST /api/lindy/presales-report` - Trigger pre-sales report generation
- `POST /api/lindy/slides` - Trigger slides generation
- `POST /api/lindy/webhook` - Receive results from Lindy agents
- `POST /api/calendar/sync` - Sync calendar events from Google/Outlook

#### Database Functions
- `updateEventPresalesStatus(eventId, status, url?)` - Update pre-sales report status
- `updateEventSlidesStatus(eventId, status, url?)` - Update slides status
- `markStalePresalesRuns()` - Mark reports > 15 minutes as failed
- `markStaleSlidesRuns()` - Mark slides > 15 minutes as failed
- `deleteRemovedCalendarEvents(profileId, source, remoteEventIds)` - Delete events not in remote calendar

#### Documentation
- Created `MASTER_AGENT_GUIDE.md` - Comprehensive guide for all environment variables, credentials, and integrations
- Created `CHANGELOG.md` - Version history and change tracking
- Updated `.env.example` - Consistent environment variable template

#### Code Standards
- Established naming conventions for database columns, functions, and variables
- Established SQL query standards (parameterized queries, no string interpolation)
- Established TypeScript standards (strict null checks, interface definitions)
- Established documentation standards (JSDoc comments, console logging with emoji prefixes)

### Changed

#### Database Layer (lib/db/index.ts)
- Updated `CalendarEvent` interface to include `presales_report_started_at` and `slides_started_at`
- Modified `updateEventPresalesStatus()` to set `presales_report_started_at` when status becomes 'processing'
- Modified `updateEventSlidesStatus()` to set `slides_started_at` when status becomes 'processing'
- Fixed `deleteRemovedCalendarEvents()` to use parameterized SQL queries

#### Frontend (app/profile/[id]/page.tsx)
- Updated `CalendarEvent` interface to include new timestamp fields
- Updated `isReportStale()` function to check `presales_report_started_at` instead of `created_at`
- Updated `areSlidesStale()` function to check `slides_started_at` instead of `created_at`

#### API Routes
- Updated `app/api/lindy/presales-report/route.ts` with proper type annotations
- Updated `app/api/lindy/slides/route.ts` with proper type annotations
- Fixed TypeScript compilation errors

### Fixed

- Fixed 15-minute timeout retry logic not working correctly
- Fixed calendar sync deletion SQL errors
- Fixed database connection issues with environment variables
- Fixed TypeScript compilation errors in API routes
- Fixed stale detection checking wrong timestamp field

### Security

- Replaced unsafe SQL string interpolation with parameterized queries
- Added Bearer token authentication to webhook calls
- Verified webhook secrets are properly configured

### Verified

- ✅ Database schema updated with new columns
- ✅ Database functions fixed to set started_at timestamps
- ✅ Frontend logic updated to use correct timestamp fields
- ✅ SQL queries fixed to use parameterized queries
- ✅ TypeScript compilation successful with no errors
- ✅ Build successful with no errors
- ✅ Both critical bugs tested and confirmed working
- ✅ Calendar sync deletion tested with test data
- ✅ Stale detection tested with various time scenarios

### Environment Variables

All environment variables are now documented in `MASTER_AGENT_GUIDE.md` with:
- Complete list of all variables
- Usage map showing where each variable is used
- Local development values
- Production values
- Naming conventions and prefixes

### Migration Notes

**For Existing Deployments:**

1. Add new columns to `calendar_events` table:
   ```sql
   ALTER TABLE calendar_events
   ADD COLUMN IF NOT EXISTS presales_report_started_at TIMESTAMP,
   ADD COLUMN IF NOT EXISTS slides_started_at TIMESTAMP;
   ```

2. Update environment variables in Vercel:
   - Verify all `LINDY_*` variables are set
   - Verify all `GOOGLE_*` variables are set
   - Verify all `MICROSOFT_*` variables are set
   - Verify `NEXTAUTH_*` variables are set

3. Redeploy application after schema changes

**No Breaking Changes:**
- All changes are backward compatible
- Existing data remains intact
- No data migration required

---

## [0.9.0] - 2025-10-15

### Added
- Initial Lindy agent integration for pre-sales report generation
- Calendar sync functionality for Google and Outlook
- Token usage tracking
- File upload management

### Known Issues (Fixed in 1.0.0)
- "Generating Report..." button shows indefinitely
- Calendar sync deletion not working correctly
- Stale detection checking wrong timestamp field

---

## Unreleased

### Planned Features
- Multi-language support
- Advanced reporting analytics
- Custom report templates
- Integration with CRM systems
- Batch processing for multiple events
- Email notifications for completed reports

---

## How to Use This Changelog

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for any security issue fixes
- **Verified** for testing and verification results

---

**Last Updated:** October 22, 2025  
**Current Version:** 1.0.0  
**Status:** Production Ready ✅

## [1.1.0] - 2025-10-22

### ✨ Features Added
- **URL Slug-Based Profile Routing**: Profiles now use semantic URLs based on their names
  - Example: `https://team.autoprep.ai/profile/john-smith` instead of `/profile/1`
  - URL slugs are automatically generated from profile names (lowercase, hyphenated)
  - Improved user experience with readable, shareable profile URLs

### 🔧 Technical Changes
- Renamed profile route from `[id]` to `[slug]` for semantic routing
- Created new API endpoint `/api/profiles/slug/[slug]` to fetch profiles by URL slug
- Updated profile page to fetch by `url_slug` instead of numeric ID
- Updated dashboard to link to profiles using `url_slug`
- Added `getProfileBySlug()` database function for slug-based lookups

### 🧪 Testing
- ✅ Created test profile "John Smith" with URL slug "john-smith"
- ✅ Verified profile accessible at `/profile/john-smith`
- ✅ Verified dashboard links use URL slug
- ✅ Verified profile URL display shows semantic URL
- ✅ All existing functionality preserved

### 📝 Documentation
- Updated MASTER_AGENT_GUIDE.md with URL slug information
- Updated NAMING_CONVENTIONS.md with URL slug standards

---

## [1.0.0] - 2025-10-22

### ✨ Features Implemented
- **15-Minute Timeout Retry Logic**: Reports and slides show "Try again" button after 15 minutes
- **Calendar Sync Deletion**: Bidirectional sync removes deleted events from local storage
- **Comprehensive Documentation**: Master Agent Guide, Changelog, and Naming Conventions

### 🔧 Technical Changes
- Added `presales_report_started_at` and `slides_started_at` timestamp columns
- Database functions set timestamps when status transitions to 'processing'
- Frontend detects stale reports/slides based on timestamps
- Fixed SQL queries to use parameterized queries (no string interpolation)
- Implemented `deleteRemovedCalendarEvents()` function for sync cleanup

### 🐛 Bug Fixes
- Fixed incorrect timestamp comparisons (`created_at` → `presales_report_started_at`/`slides_started_at`)
- Fixed unsafe SQL queries with string interpolation
- Fixed missing timestamp columns in database schema

### 📚 Documentation
- Created MASTER_AGENT_GUIDE.md: Complete reference for all environment variables, credentials, and integrations
- Created CHANGELOG.md: Version history tracking
- Created NAMING_CONVENTIONS.md: Code standards for database, functions, variables, and documentation
- Updated .env.example: Consistent environment variable template

### ✅ Deployment
- All changes deployed to production (Vercel)
- Environment variables configured in Vercel
- Database schema updated with new columns
- All features tested and verified working

