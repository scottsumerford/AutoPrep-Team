#!/bin/bash

# Create a test DOCX file
echo "Creating test file..."
echo "Test content" > test.txt

# Test the upload endpoint
echo "Testing upload endpoint..."
curl -X POST https://team.autoprep.ai/api/files/upload \
  -F "file=@test.txt" \
  -F "profileId=1" \
  -F "fileType=company_info" \
  -v 2>&1 | grep -A 20 "< HTTP"

rm test.txt
