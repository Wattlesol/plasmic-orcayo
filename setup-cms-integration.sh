#!/bin/bash

# Script to set up CMS integration and generate login URLs for Plasmic users
# This script helps you configure the CMS integration and create user tokens

echo "=============================================="
echo "PLASMIC CMS INTEGRATION SETUP"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "platform/wab/scripts/generate-jwt.ts" ]; then
  echo "Error: This script must be run from the plasmic-orcayo root directory"
  echo "Run: cd /path/to/plasmic-orcayo && ./setup-cms-integration.sh"
  exit 1
fi

echo "Setting up CMS Integration Environment..."
echo ""

# Check if .env file exists, if not create a template
if [ ! -f ".env" ]; then
  echo "# Plasmic CMS Integration Environment Variables" > .env
  echo "# Generate a secure API key for CMS integration" >> .env
  API_KEY=$(openssl rand -hex 32)
  echo "CMS_INTEGRATION_API_KEY=$API_KEY" >> .env
  echo "# Add other environment variables as needed" >> .env
  echo "# PLASMIC_ENCRYPTION_KEY=fake" >> .env
  echo "Created .env file with CMS integration API key"
fi

# Read the API key from environment
if [ -f ".env" ]; then
  source .env
fi

API_KEY=${CMS_INTEGRATION_API_KEY:-$(openssl rand -hex 32)}

if [ -z "$CMS_INTEGRATION_API_KEY" ]; then
  echo "CMS_INTEGRATION_API_KEY not found in environment"
  echo "Generated a new API key: $API_KEY"
  echo "Setting CMS_INTEGRATION_API_KEY=$API_KEY in .env"
  sed -i.bak "s|^CMS_INTEGRATION_API_KEY=.*|CMS_INTEGRATION_API_KEY=$API_KEY|" .env 2>/dev/null || echo "CMS_INTEGRATION_API_KEY=$API_KEY" >> .env
  export CMS_INTEGRATION_API_KEY=$API_KEY
fi

echo ""
echo "CMS Integration API Key: $CMS_INTEGRATION_API_KEY"
echo ""

# Check if the dev server is running
if ! curl -s http://localhost:3004/api/v1/auth/csrf > /dev/null 2>&1; then
  echo "⚠️  Warning: Plasmic dev server may not be running"
  echo "Start it with: cd platform/wab && yarn dev"
  echo ""
  read -p "Do you want to start the dev server now? (y/n): " start_server
  if [[ $start_server == "y" || $start_server == "Y" ]]; then
    echo "Starting Plasmic dev server in background..."
    (cd platform/wab && yarn dev > /tmp/plasmic-dev.log 2>&1 &) 
    sleep 5  # Wait for server to start
  fi
else
  echo "✅ Plasmic dev server is running"
fi

echo ""
echo "=============================================="
echo "CMS INTEGRATION ENDPOINTS"
echo "=============================================="
echo "POST /api/v1/cms-integration/generate-token - Generate JWT tokens for CMS users"
echo "POST /api/v1/cms-integration/verify-user - Verify if users exist (requires session auth)"
echo "GET  /api/v1/cms-integration/current-user - Get current user info (requires JWT auth)"
echo ""

echo "=============================================="
echo "HOW TO USE FROM YOUR CMS:"
echo "=============================================="
echo "# In your CMS backend, call this endpoint:"
echo "curl -X POST http://localhost:3004/api/v1/cms-integration/generate-token \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"X-API-Key: $CMS_INTEGRATION_API_KEY\" \\"
echo "  -d '{\"userId\":\"[USER_ID]\",\"email\":\"[USER_EMAIL]\",\"firstName\":\"[FIRST_NAME]\",\"lastName\":\"[LAST_NAME]\"}'"
echo ""

echo "=============================================="
echo "TEST THE CMS INTEGRATION:"
echo "=============================================="
echo "# After starting your dev server, test with:"
echo "# curl -X POST http://localhost:3004/api/v1/cms-integration/generate-token \\"
echo "#   -H \"Content-Type: application/json\" \\"
echo "#   -H \"X-API-Key: $CMS_INTEGRATION_API_KEY\" \\"
echo "#   -d '{\"userId\":\"29f3f127-fba3-4785-b625-9d6b7755c5e0\",\"email\":\"admin@admin.example.com\",\"firstName\":\"Plasmic\",\"lastName\":\"Admin\"}'"
echo ""

echo "=============================================="
echo "WEB VIEW EMBEDDING:"
echo "=============================================="
echo "# Use the generated token in your web view:"
echo "# <iframe src='http://localhost:3003?token=[GENERATED_TOKEN]' ...></iframe>"
echo ""
echo "Done! Your CMS integration is configured."