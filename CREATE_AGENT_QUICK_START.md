# 🚀 Quick Start: Create Your AutoPrep Team Developer Agent

Follow these simple steps to create a reusable agent that can manage your AutoPrep Team repository.

---

## Step 1: Go to Lindy Dashboard

Visit: **https://lindy.ai/dashboard**

---

## Step 2: Create New Agent

Click **"Create Agent"** or **"New Agent"**

---

## Step 3: Basic Info

**Agent Name**: `AutoPrep Team Developer`

**Description**: `Manages the AutoPrep Team Dashboard repository. Can add features, fix bugs, and deploy changes.`

---

## Step 4: Copy This Prompt

Go to **AGENT_SETUP.md** in the repository and copy the entire "Agent Instructions" section (it's the large code block starting with "You are the AutoPrep Team Developer agent...")

Paste it into the agent's instructions field.

---

## Step 5: Enable Tools

Make sure these tools are enabled:
- ✅ Terminal/Command Line
- ✅ Browser
- ✅ File System Access

---

## Step 6: Set Trigger

**Trigger Type**: Manual (you'll call it when needed)

---

## Step 7: Save & Test

1. Click **"Save"** or **"Create Agent"**
2. Test with: `"Show me the AutoPrep Team project structure"`

---

## 🎯 How to Use Your New Agent

Once created, you can call it with commands like:

### Add Features
```
"Update AutoPrep-Team: Add a dark mode toggle to the homepage"
```

### Fix Bugs
```
"Update AutoPrep-Team: Fix the calendar sync not working for Outlook"
```

### Add New Lindy Agents
```
"Update AutoPrep-Team: Add a new Lindy agent for email summaries with ID: abc123"
```

### Update Documentation
```
"Update AutoPrep-Team: Add instructions for setting up local development"
```

### General Updates
```
"Update AutoPrep-Team: [describe what you want]"
```

---

## 📚 Reference Documents

Your agent will have access to these documents in the repository:

- **AGENT_CONTEXT.md** - Complete project context and history
- **PROJECT_SUMMARY.md** - Full feature list
- **README.md** - Project overview
- **DEPLOYMENT_GUIDE.md** - Deployment instructions

---

## 🔑 Important: GitHub Token

The agent needs your GitHub Personal Access Token to push changes. 

**Where to add it**: In the agent instructions, replace `YOUR_GITHUB_TOKEN_HERE` with your actual token: `YOUR_GITHUB_TOKEN_HERE`

⚠️ **Security Note**: Only add the token in the Lindy agent interface, not in any files that get committed to GitHub.

---

## ✅ What Your Agent Can Do

- ✅ Pull latest code from GitHub
- ✅ Make code changes (add features, fix bugs)
- ✅ Test changes locally
- ✅ Commit with descriptive messages
- ✅ Push to GitHub (auto-deploys to Vercel)
- ✅ Update documentation
- ✅ Add new Lindy agent integrations
- ✅ Modify database schema
- ✅ Create new API endpoints
- ✅ Add UI components

---

## 🎉 That's It!

Your agent is now ready to manage your AutoPrep Team Dashboard. Just call it whenever you need updates!

---

**Original Build Session**: https://chat.lindy.ai/scott-sumerfords-workspace/lindy/lindy-chat-68421cb7c22d7402e81f5fc9/tasks?task=68ed9adf6bbe680952f3a44a

**Repository**: https://github.com/scottsumerford/AutoPrep-Team

**Production URL**: https://team.autoprep.ai
