#!/bin/bash

# Script to generate login URLs for Plasmic users
# This script creates a login URL with a JWT token that allows automatic authentication

echo "=============================================="
echo "PLASMIC LOGIN URL GENERATOR"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "platform/wab/scripts/generate-jwt.ts" ]; then
  echo "Error: This script must be run from the plasmic-orcayo root directory"
  echo "Run: cd /path/to/plasmic-orcayo && ./generate-login-url.sh"
  exit 1
fi

# Check if the dev server is running
if ! curl -s http://localhost:3003 > /dev/null 2>&1; then
  echo "⚠️  Warning: Plasmic dev server may not be running"
  echo "Make sure to start it with: cd platform/wab && yarn dev"
  echo ""
fi

echo "Available login options:"
echo "1) Admin user (admin@admin.example.com)"
echo "2) Custom user (requires user ID)"
echo ""

read -p "Select option (1 or 2): " option

case $option in
  1)
    echo ""
    echo "Generating login URL for admin user..."
    cd platform/wab && yarn tsx scripts/generate-jwt.ts
    ;;
  2)
    echo ""
    read -p "Enter user ID: " user_id
    read -p "Enter email: " email
    read -p "Enter first name: " first_name
    read -p "Enter last name: " last_name
    
    # Create a temporary script for custom user
    cat > /tmp/plasmic_custom_login.ts << EOF
import jwt from 'jsonwebtoken';
import { getEncryptionKey } from './src/wab/server/secrets';

// Generate a JWT token for a custom user
const customUser = {
  userId: '$user_id',
  email: '$email',
  firstName: '$first_name',
  lastName: '$last_name',
};

const token = jwt.sign(
  {
    ...customUser,
    iat: Math.floor(Date.now() / 1000), // Issued at time
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // Expires in 7 days
  },
  getEncryptionKey(),
  {
    algorithm: 'HS256',
  }
);

console.log('Custom JWT Token:', token);
console.log('Login URL: http://localhost:3003?token=' + token);
console.log('Use this token by adding ?token=YOUR_TOKEN to URLs or as Authorization: Bearer YOUR_TOKEN header');
EOF

    cd platform/wab && yarn tsx /tmp/plasmic_custom_login.ts
    
    # Clean up
    rm -f /tmp/plasmic_custom_login.ts
    ;;
  *)
    echo "Invalid option. Please run again and select 1 or 2."
    exit 1
    ;;
esac

echo ""
echo "=============================================="
echo "HOW TO USE THE LOGIN URL:"
echo "1. Make sure your Plasmic dev server is running on ports 3003-3005"
echo "2. Copy the Login URL above and paste it in your browser"
echo "3. The user will be automatically logged in"
echo ""
echo "The JWT token is valid for 7 days."
echo "=============================================="