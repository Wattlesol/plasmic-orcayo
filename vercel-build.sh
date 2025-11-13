#!/bin/bash

# Vercel build script for Plasmic
set -e

echo "Setting up Plasmic for Vercel deployment..."

# Navigate to the platform/wab directory
cd platform/wab

# Install dependencies
yarn install

# Build the application with proper environment variables for Vercel
echo "Building the Plasmic frontend for Vercel..."

# Set public URL based on Vercel environment
PUBLIC_URL=${NEXT_PUBLIC_PUBLIC_URL:-"https://localhost:3000"}

# Build the frontend
yarn build

echo "Build completed successfully!"

# Verification step
if [ -d "build" ]; then
    echo "Build directory exists with $(ls -1 build | wc -l) files"
    echo "Build assets ready for Vercel deployment"
else
    echo "ERROR: Build directory does not exist"
    exit 1
fi