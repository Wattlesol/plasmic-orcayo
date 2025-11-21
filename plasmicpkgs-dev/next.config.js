const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
    NEXT_PUBLIC_PROJECT_TOKEN: process.env.NEXT_PUBLIC_PROJECT_TOKEN,
  },
  webpack: (config, { isServer }) => {
    // Add support for loading .env from parent directory
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Disable problematic webpack cache to fix "Unable to snapshot resolve dependencies" error
    if (config.cache) {
      config.cache = false;
    }
    
    return config;
 },
 
 // Disable Next.js cache to fix snapshot issues
 generateBuildId: async () => {
   // Use a random build ID to prevent caching issues during development
   return Date.now().toString();
 },
};

module.exports = nextConfig;

