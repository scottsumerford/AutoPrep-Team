#!/bin/bash

TOKEN="dZ0KTwg5DFwRw4hssw3EqzM9"

# Get the latest deployment
DEPLOYMENT=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=prj_VqH4fC394t9m4zvREcJz3dUwDpFC&limit=1")

DEPLOYMENT_ID=$(echo "$DEPLOYMENT" | jq -r '.deployments[0].uid')
DEPLOYMENT_STATE=$(echo "$DEPLOYMENT" | jq -r '.deployments[0].state')
DEPLOYMENT_READY=$(echo "$DEPLOYMENT" | jq -r '.deployments[0].ready')

echo "Latest deployment:"
echo "  ID: $DEPLOYMENT_ID"
echo "  State: $DEPLOYMENT_STATE"
echo "  Ready: $DEPLOYMENT_READY"
echo ""

if [ "$DEPLOYMENT_STATE" = "READY" ]; then
  echo "✅ Deployment is ready!"
else
  echo "⏳ Deployment is still in progress..."
fi
