#!/bin/bash

# Script to demonstrate the CMS Integration API
# This script shows how to generate tokens for CMS users without session authentication

echo "=============================================="
echo "CMS INTEGRATION API DEMONSTRATION"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "platform/wab/scripts/generate-jwt.ts" ]; then
  echo "Error: This script must be run from the plasmic-orcayo root directory"
  echo "Run: cd /path/to/plasmic-orcayo && ./demo-cms-integration.sh"
  exit 1
fi

echo "CMS Integration Endpoint: http://localhost:3004/api/v1/cms-integration/generate-token"
echo ""
echo "To use this endpoint from your CMS, make a request like this:"
echo ""
echo "curl -X POST http://localhost:3004/api/v1/cms-integration/generate-token \"
echo "  -H \"Content-Type: application/json\" \"
echo "  -H \"X-API-Key: your_cms_integration_api_key\" \"
echo "  -d '{\"userId\":\"[USER_ID]\",\"email\":\"[USER_EMAIL]\",\"firstName\":\"[FIRST_NAME]\",\"lastName\":\"[LAST_NAME]\"}'"
echo ""
echo "Example (you'll need to set CMS_INTEGRATION_API_KEY in your environment first):"
echo ""
echo "export CMS_INTEGRATION_API_KEY=\"your-secret-api-key\""
echo "cd platform/wab"
echo "yarn dev"
echo ""
echo "Then from your CMS backend, make this call:"
echo ""
echo "const response = await fetch('http://localhost:3004/api/v1/cms-integration/generate-token', {"
echo "  method: 'POST',"
echo "  headers: {"
echo "    'Content-Type': 'application/json',"
echo "    'X-API-Key': process.env.CMS_INTEGRATION_API_KEY"
echo "  },"
echo "  body: JSON.stringify({"
echo "    userId: 'user_id_from_your_cms',"
echo "    email: 'user@example.com',"
echo "    firstName: 'John',"
echo "    lastName: 'Doe'"
echo "  })"
echo "});"
echo ""
echo "const { token } = await response.json();"
echo "const plasmicUrl = `http://localhost:3003?token=\${token}`;"
echo ""
echo "This URL can then be used in your web view or redirect."
echo ""
echo "=============================================="
echo "SECURITY NOTE:"
echo "- Use a strong, unique API key"
echo "- Store the API key securely in environment variables"
echo "- Consider rate limiting for this endpoint"
echo "- Use HTTPS in production"
echo "=============================================="