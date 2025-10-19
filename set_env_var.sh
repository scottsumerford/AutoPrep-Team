#!/bin/bash

# Vercel API token
TOKEN="dZ0KTwg5DFwRw4hssw3EqzM9"

# Get project ID first
PROJECT_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v9/projects/autoprep-team-subdomain-deployment" | \
  jq -r '.id')

echo "Project ID: $PROJECT_ID"

# Set POSTGRES_URL for all environments
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "POSTGRES_URL",
    "value": "postgresql://postgres.kmswrzzlirdfnzzbnrpo:imAVAKBD6QwffO2z@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
    "type": "encrypted",
    "target": ["production", "preview", "development"]
  }' \
  "https://api.vercel.com/v10/projects/$PROJECT_ID/env"

echo ""
echo "✅ Environment variable set successfully!"
