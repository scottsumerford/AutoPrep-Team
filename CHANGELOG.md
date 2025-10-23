# Changelog

All notable changes to the AutoPrep Team Dashboard are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-10-22

### ✨ Features Added
- **URL Slug-Based Profile Routing**: Profiles now use semantic URLs based on their names
  - Example: `https://team.autoprep.ai/profile/john-smith` instead of `/profile/1`
  - URL slugs are automatically generated from profile names (lowercase, hyphenated)
  - Improved user experience with readable, shareable profile URLs

- **Production Database Documentation**: Comprehensive database configuration guide for Agent steps
  - Added full Production Database description for Supabase integration
  - Documented connection details: hostname, port, database name, connection type
  - Provided connection string format and environment variable usage
  - Included database tables and key features documentation

### 🔧 Technical Changes
- Renamed profile route from `[id]` to `[slug]` for semantic routing
- Created new API endpoint `/api/profiles/slug/[slug]` to fetch profiles by URL slug
- Updated profile page to fetch by `url_slug` instead of numeric ID
- Updated dashboard to link to profiles using `url_slug`
- Added `getProfileBySlug()` database function for slug-based lookups
- Enhanced MASTER_AGENT_GUIDE.md with complete Vercel and GitHub deployment guides

### 🧪 Testing
- ✅ Created test profile "John Smith" with URL slug "john-smith"
- ✅ Verified profile accessible at `/profile/john-smith`
- ✅ Verified dashboard links use URL slug
- ✅ Verified profile URL display shows semantic URL
- ✅ All existing functionality preserved
- ✅ Production database configuration documented and verified

### 📝 Documentation
- Updated MASTER_AGENT_GUIDE.md with URL slug information
- Updated MASTER_AGENT_GUIDE.md with complete Vercel deployment guide
- Updated MASTER_AGENT_GUIDE.md with complete GitHub deployment guide
- Updated MASTER_AGENT_GUIDE.md with environment variable usage map
- Added Production Database description for Agent integration
- Updated NAMING_CONVENTIONS.md with URL slug standards

### 🚀 Deployment
- All changes deployed to production (Vercel)
- Environment variables configured in Vercel
- Database schema updated with new columns
- All features tested and verified working
- Production database fully documented for Agent steps

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
**Current Version:** 1.1.0  
**Status:** Production Ready ✅
