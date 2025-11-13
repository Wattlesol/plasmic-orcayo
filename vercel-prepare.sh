#!/bin/bash

# Vercel deployment configuration for Plasmic
# This script helps set up the proper environment for Vercel deployment

echo "Preparing Plasmic for Vercel deployment..."

# Check if we're in the correct directory
if [ ! -f "platform/wab/package.json" ]; then
  echo "Error: Not in the correct project directory"
  exit 1
fi

# Show Vercel deployment information
echo "
===============================================
Vercel Deployment Configuration for Plasmic
===============================================

This project is now configured for Vercel deployment with the following:

1. Frontend build (from 'platform/wab/build') will be deployed to Vercel
2. API endpoints will return 404 (backend needs separate deployment)
3. Static assets are properly configured

===============================================
"

# Verify build exists
if [ ! -d "platform/wab/build" ]; then
  echo "Warning: Build directory doesn't exist yet. Run 'cd platform/wab && yarn build' first."
else
  echo "✓ Build directory exists with $(find platform/wab/build -type f | wc -l) files"
fi

# Show vercel.json configuration
echo "
Current Vercel Configuration:
"
cat vercel.json

echo "
===============================================
Environment Configuration:
"
cat .env.vercel

echo "
===============================================
Deployment Instructions:
1. Set environment variables in Vercel dashboard based on .env.vercel:
   - NEXT_PUBLIC_PUBLIC_URL (frontend URL)
   - NEXT_PUBLIC_BACKEND_URL (backend service URL)
   - WAB_DBHOST, WAB_DBUSER, WAB_DBNAME, WAB_DBPASSWORD (database config)
2. The backend service must be deployed separately
3. Database needs to be configured separately
===============================================

Testing Locally:
- Full application: cd platform/wab && yarn dev
- Static frontend only: npx serve platform/wab/build
- Vercel simulation: vercel dev (after installing Vercel CLI)
===============================================
"