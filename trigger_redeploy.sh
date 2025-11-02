#!/bin/bash

TOKEN="dZ0KTwg5DFwRw4hssw3EqzM9"

# Get the latest deployment
DEPLOYMENT=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=prj_VqH4fC394t9m4zvREcJz3dUwDpFC&limit=1")

DEPLOYMENT_ID=$(echo "$DEPLOYMENT" | jq -r '.deployments[0].uid')

echo "Latest deployment ID: $DEPLOYMENT_ID"
echo "Triggering redeploy..."

# Trigger redeploy
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v13/deployments/$DEPLOYMENT_ID/redeploy"

echo ""
echo "✅ Redeployment triggered!"
