# Inter-Agent Communication Guide
**AutoPrep Team - Agent Integration Reference**

---

## 🤖 Agent Information

### This Agent (AutoPrep - App Developer)
- **Agent ID**: `68edd7b0810dda309703fd62`
- **Name**: AutoPrep - App Developer
- **Purpose**: Develop and maintain the AutoPrep Team application
- **Workspace**: scott-sumerfords-workspace
- **Current Task URL**: https://chat.lindy.ai/scott-sumerfords-workspace/lindy/autoprep-app-developer-68edd7b0810dda309703fd62/tasks?task=68f46a6dec875d859ae7f842

---

## 🔗 Connected Lindy Agents

### 1. Pre-sales Report Generator
- **Agent ID**: `68aa4cb7ebbc5f9222a2696e`
- **Purpose**: Generates comprehensive pre-sales reports
- **Trigger**: Called from profile page when user clicks "PDF Pre-sales Report" button
- **Input Format**:
```json
{
  "event_title": "Meeting with Acme Corp",
  "event_description": "Discuss Q4 partnership opportunities",
  "attendee_email": "john@acmecorp.com",
  "company_info": "...",
  "profile_name": "Scott Sumerford"
}
```
- **Output**: PDF report with company research, pain points, talking points
- **API Endpoint**: `POST /api/lindy/presales-report`
- **Token Tracking**: Automatically tracked as `presales_report` operation

### 2. Slides Generation Agent
- **Agent ID**: `68ed392b02927e7ace232732`
- **Purpose**: Creates presentation slides
- **Trigger**: Called from profile page when user clicks "Create Slides" button
- **Input Format**:
```json
{
  "event_title": "Meeting with Acme Corp",
  "event_description": "Discuss Q4 partnership opportunities",
  "attendee_email": "john@acmecorp.com",
  "company_info": "...",
  "slide_template": "...",
  "profile_name": "Scott Sumerford"
}
```
- **Output**: Google Slides or PowerPoint presentation
- **API Endpoint**: `POST /api/lindy/slides`
- **Token Tracking**: Automatically tracked as `slides_generation` operation

---

## 🔐 Authentication & Access

### Lindy API Access
- **API Key**: Stored in `LINDY_API_KEY` environment variable
- **Base URL**: `https://api.lindy.ai/v1`
- **Authentication**: Bearer token in Authorization header

### API Call Example
```typescript
const response = await fetch(
  `https://api.lindy.ai/v1/agents/${agentId}/invoke`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LINDY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  }
);
```

### Integration Code Location
- **File**: `lib/lindy.ts`
- **Function**: `callLindyAgent(agentId: string, input: Record<string, any>)`

---

## 📊 Database Access for Agents

### Connection Information
- **Database**: Supabase PostgreSQL
- **Connection String**: `postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres`
- **Environment Variable**: `POSTGRES_URL`
- **Library**: `postgres` (with `require()`)
- **Documentation**: See `SUPABASE_DATABASE_CONNECTION.md`

### Database Tables Available
1. **profiles** - User profiles with OAuth tokens
2. **calendar_events** - Synced calendar events
3. **token_usage** - AI token consumption tracking
4. **file_uploads** - Uploaded templates and company info

### Example Database Query
```typescript
// eslint-disable-next-line @typescript-eslint/no-require-imports
const postgres = require('postgres');

const sql = postgres(process.env.POSTGRES_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

const profiles = await sql`SELECT * FROM profiles`;
```

---

## 🌐 Application URLs

### Production
- **URL**: https://team.autoprep.ai
- **API Base**: https://team.autoprep.ai/api
- **Status**: ✅ Live and operational

### Development
- **Local**: http://localhost:3000 (when running locally)
- **Lindy Test**: https://light-beans-lick.lindy.site (port 3001)

---

## 📡 API Endpoints for Agent Integration

### Profile Management
```
GET  /api/profiles              # Get all profiles
POST /api/profiles              # Create new profile
GET  /api/profiles/[id]         # Get single profile
PATCH /api/profiles/[id]        # Update profile
```

### Calendar Events
```
GET /api/calendar/[id]          # Get calendar events for profile
                                # Query: ?keyword=string
```

### Token Usage
```
GET /api/tokens/[id]            # Get token usage stats for profile
```

### Lindy Agent Invocation
```
POST /api/lindy/presales-report # Generate pre-sales report
POST /api/lindy/slides          # Generate presentation slides
```

### OAuth
```
GET /api/auth/google/callback   # Google OAuth callback
GET /api/auth/outlook/callback  # Outlook OAuth callback
```

---

## 🔄 Agent Communication Patterns

### Pattern 1: Direct API Call
**Use Case**: Agent needs to invoke another Lindy agent

```typescript
// From within the application
const result = await callLindyAgent(
  '68aa4cb7ebbc5f9222a2696e', // Pre-sales Report Agent
  {
    event_title: 'Meeting with Acme Corp',
    attendee_email: 'john@acmecorp.com',
    // ... other data
  }
);
```

### Pattern 2: Webhook Trigger
**Use Case**: External agent needs to trigger application action

```typescript
// Application exposes webhook endpoint
POST /api/webhooks/agent-callback
{
  "agent_id": "68aa4cb7ebbc5f9222a2696e",
  "result": { /* agent output */ },
  "tokens_used": 1500
}
```

### Pattern 3: Database Polling
**Use Case**: Agent monitors database for new events

```typescript
// Agent queries database periodically
const newEvents = await sql`
  SELECT * FROM calendar_events 
  WHERE created_at > NOW() - INTERVAL '5 minutes'
  AND processed = false
`;
```

### Pattern 4: Event-Driven
**Use Case**: Application emits events that agents subscribe to

```typescript
// Application publishes event
await publishEvent('calendar.event.created', {
  profile_id: 3,
  event_id: 'abc123',
  event_title: 'Meeting with Acme Corp'
});

// Agent subscribes to event type
subscribeToEvent('calendar.event.created', async (data) => {
  // Process event
});
```

---

## 📝 Data Formats & Schemas

### Profile Object
```typescript
interface Profile {
  id: number;
  name: string;
  email: string;
  url_slug: string;
  title?: string;
  google_access_token?: string;
  google_refresh_token?: string;
  outlook_access_token?: string;
  outlook_refresh_token?: string;
  keyword_filter?: string;
  slide_template_url?: string;
  company_info_url?: string;
  created_at: Date;
  updated_at: Date;
}
```

### Calendar Event Object
```typescript
interface CalendarEvent {
  id: number;
  profile_id: number;
  event_id: string;
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  attendees: string[]; // Array of email addresses
  source: 'google' | 'outlook';
  created_at: Date;
}
```

### Token Usage Object
```typescript
interface TokenUsage {
  id: number;
  profile_id: number;
  operation_type: 'agent_run' | 'presales_report' | 'slides_generation';
  tokens_used: number;
  lindy_agent_id?: string;
  event_id?: number;
  created_at: Date;
}
```

---

## 🔧 Agent Development Tools

### Vercel Access
- **Access Token**: `dZ0KTwg5DFwRw4hssw3EqzM9`
- **Project ID**: `prj_VqH4fC394t9m4zvREcJz3dUwDpFC`
- **Project Name**: `autoprep-team-subdomain-deployment`

### GitHub Access
- **Repository**: https://github.com/scottsumerford/AutoPrep-Team
- **Owner**: scottsumerford
- **Branch**: main (auto-deploys to production)

### Deployment Commands
```bash
# Check deployment status
curl -H "Authorization: Bearer dZ0KTwg5DFwRw4hssw3EqzM9" \
  "https://api.vercel.com/v6/deployments?projectId=prj_VqH4fC394t9m4zvREcJz3dUwDpFC&limit=1"

# Trigger redeploy
git push origin main
```

---

## 🎯 Common Agent Tasks

### Task 1: Generate Pre-sales Report
**Trigger**: User clicks "PDF Pre-sales Report" button on event

**Flow**:
1. Frontend calls `POST /api/lindy/presales-report`
2. API retrieves profile and event data from database
3. API calls Pre-sales Report Agent (`68aa4cb7ebbc5f9222a2696e`)
4. Agent generates report using company info and attendee research
5. API tracks token usage in database
6. Frontend displays success message and report link

**Code Location**: `app/api/lindy/presales-report/route.ts`

### Task 2: Generate Presentation Slides
**Trigger**: User clicks "Create Slides" button on event

**Flow**:
1. Frontend calls `POST /api/lindy/slides`
2. API retrieves profile, event, and template data from database
3. API calls Slides Generation Agent (`68ed392b02927e7ace232732`)
4. Agent creates presentation using template and event details
5. API tracks token usage in database
6. Frontend displays success message and slides link

**Code Location**: `app/api/lindy/slides/route.ts`

### Task 3: Sync Calendar Events
**Trigger**: User connects Google/Outlook or clicks "Sync Calendar Now"

**Flow**:
1. Frontend calls `POST /api/calendar/sync`
2. API uses OAuth tokens to fetch calendar events
3. API filters events by keyword if set
4. API saves events to database (with unique constraint)
5. Frontend refreshes event list
6. Events become available for report/slides generation

**Code Location**: `app/api/calendar/sync/route.ts`

---

## 🚨 Error Handling

### Agent Invocation Errors
```typescript
try {
  const result = await callLindyAgent(agentId, input);
} catch (error) {
  console.error('Lindy agent error:', error);
  // Log to database
  await logError({
    type: 'lindy_agent_error',
    agent_id: agentId,
    error_message: error.message,
    input_data: input
  });
  // Return user-friendly error
  return { error: 'Failed to generate report. Please try again.' };
}
```

### Database Connection Errors
```typescript
try {
  const result = await sql`SELECT * FROM profiles`;
} catch (error) {
  console.error('Database error:', error);
  // Fall back to in-memory storage
  return mockProfiles;
}
```

---

## 📚 Documentation References

### Application Documentation
- **CALENDAR_SYNC_FIX_SESSION.md** - Recent calendar sync fix details
- **SUPABASE_DATABASE_CONNECTION.md** - Database connection guide
- **AGENT_CONTEXT.md** - Original build session context
- **AGENT_SETUP.md** - How this agent was created
- **README.md** - Project overview

### External Documentation
- **Lindy API**: https://lindy.ai/docs
- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs

---

## 🔍 Monitoring & Debugging

### Check Agent Status
```bash
# View recent deployments
curl -H "Authorization: Bearer dZ0KTwg5DFwRw4hssw3EqzM9" \
  "https://api.vercel.com/v6/deployments?projectId=prj_VqH4fC394t9m4zvREcJz3dUwDpFC&limit=5"
```

### Check Database Status
```javascript
// Run check_db_schema.js
node check_db_schema.js
```

### View Application Logs
- **Vercel Dashboard**: https://vercel.com/scottsumerford/autoprep-team-subdomain-deployment
- **Browser Console**: Open DevTools on https://team.autoprep.ai
- **API Logs**: Check Vercel function logs

---

## 🎓 Best Practices for Agent Communication

### 1. Always Validate Input
```typescript
if (!input.event_title || !input.attendee_email) {
  throw new Error('Missing required fields');
}
```

### 2. Track Token Usage
```typescript
await logTokenUsage({
  profile_id: profileId,
  operation_type: 'presales_report',
  tokens_used: result.tokens_used,
  lindy_agent_id: agentId
});
```

### 3. Handle Timeouts
```typescript
const timeout = 30000; // 30 seconds
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeout);

try {
  const response = await fetch(url, { signal: controller.signal });
} finally {
  clearTimeout(timeoutId);
}
```

### 4. Provide User Feedback
```typescript
// Show loading state
setLoading(true);

try {
  const result = await generateReport();
  // Show success message
  toast.success('Report generated successfully!');
} catch (error) {
  // Show error message
  toast.error('Failed to generate report. Please try again.');
} finally {
  setLoading(false);
}
```

### 5. Log Everything
```typescript
console.log('📊 Calling Lindy agent:', agentId);
console.log('📝 Input:', input);
console.log('✅ Result:', result);
console.log('🔢 Tokens used:', result.tokens_used);
```

---

## 🔮 Future Agent Integration Plans

### Planned Agents
1. **Email Automation Agent** - Send follow-up emails after meetings
2. **CRM Sync Agent** - Sync data with Salesforce/HubSpot
3. **Meeting Notes Agent** - Transcribe and summarize meetings
4. **Competitive Intelligence Agent** - Monitor competitor activity
5. **Deal Scoring Agent** - Score leads based on engagement

### Integration Architecture
```
┌─────────────────────────────────────────┐
│         AutoPrep Team App               │
│  (Next.js + Supabase + Vercel)         │
└─────────────┬───────────────────────────┘
              │
              ├─── Lindy Agent 1 (Pre-sales Reports)
              ├─── Lindy Agent 2 (Slides Generation)
              ├─── Lindy Agent 3 (Email Automation)
              ├─── Lindy Agent 4 (CRM Sync)
              └─── Lindy Agent 5 (Meeting Notes)
```

---

## ✅ Agent Communication Checklist

When integrating a new agent:

- [ ] Get agent ID from Lindy dashboard
- [ ] Define input/output data format
- [ ] Create API endpoint in application
- [ ] Add error handling and logging
- [ ] Implement token usage tracking
- [ ] Add UI trigger (button/webhook)
- [ ] Test with sample data
- [ ] Document in this guide
- [ ] Update AGENT_CONTEXT.md
- [ ] Deploy to production

---

## 📞 Contact & Support

**Owner**: Scott Sumerford  
**Email**: scottsumerford@gmail.com  
**Workspace**: scott-sumerfords-workspace  
**Repository**: https://github.com/scottsumerford/AutoPrep-Team  
**Production**: https://team.autoprep.ai

---

**Last Updated**: October 19, 2025  
**Status**: ✅ Fully Operational  
**Version**: 1.0
