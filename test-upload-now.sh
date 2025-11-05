#!/bin/bash

echo "Creating test DOCX file..."
echo "Test Company Information" > test-company-info.txt

echo ""
echo "Testing file upload to production..."
echo ""

curl -X POST https://team.autoprep.ai/api/files/upload \
  -F "file=@test-company-info.txt" \
  -F "profileId=1" \
  -F "fileType=company_info" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>&1 | tail -20

rm test-company-info.txt

echo ""
echo "If you see a success message above, the fix worked!"
echo "Now try uploading your DOCX file at: https://team.autoprep.ai/profile/scott-autoprep"
