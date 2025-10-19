#!/bin/bash

TOKEN="dZ0KTwg5DFwRw4hssw3EqzM9"
PROJECT_ID="prj_VqH4fC394t9m4zvREcJz3dUwDpFC"

echo "Fetching existing environment variables..."
ENV_VARS=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID/env")

echo "$ENV_VARS" | jq '.envs[] | select(.key == "POSTGRES_URL") | {id: .id, key: .key, target: .target, createdAt: .createdAt}'

# Get the ID of the POSTGRES_URL variable
ENV_ID=$(echo "$ENV_VARS" | jq -r '.envs[] | select(.key == "POSTGRES_URL") | .id' | head -1)

if [ -n "$ENV_ID" ]; then
  echo ""
  echo "Found POSTGRES_URL with ID: $ENV_ID"
  echo "Updating the value..."
  
  # Delete the old one
  curl -X DELETE \
    -H "Authorization: Bearer $TOKEN" \
    "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$ENV_ID"
  
  echo ""
  echo "Deleted old variable. Creating new one..."
  
  # Create new one
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
  echo "✅ POSTGRES_URL updated successfully!"
else
  echo "❌ POSTGRES_URL not found"
fi
