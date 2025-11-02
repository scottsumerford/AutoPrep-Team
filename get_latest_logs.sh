#!/bin/bash

TOKEN="dZ0KTwg5DFwRw4hssw3EqzM9"
DEPLOYMENT_ID="dpl_9QZtr17eB3Rw5cFg4M4GhPeJvSLt"

echo "Fetching build logs for deployment: $DEPLOYMENT_ID"
echo "=================================================="
echo ""

curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v2/deployments/$DEPLOYMENT_ID/events" | \
  jq -r '.[] | select(.type == "stderr" or .type == "stdout" or .type == "error") | .payload.text' | \
  tail -50

