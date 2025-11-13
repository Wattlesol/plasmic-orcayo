# Plasmic Vercel Deployment Guide

This repository contains a modified version of Plasmic optimized for Vercel deployment using Docker.

## Architecture Overview

Plasmic traditionally runs as a multi-service application:
- Frontend: Serves the web application (port 3003)
- Backend: Handles API requests and database operations (port 3004)
- Host server: Serves static assets (port 3005)

## Vercel Deployment Strategy

The complete Plasmic application is deployed using Vercel's Docker support, which allows all services to run within a single containerized environment.

For a complete Plasmic deployment, you'll need:

1. **Complete Application on Vercel**: All services (frontend, backend, host) running in a Docker container
2. **Database**: Separate PostgreSQL database (hosted separately)

## Vercel Configuration

The deployment uses:
- `Dockerfile`: Contains the complete application setup
- `vercel.json`: Configured to use Docker builder
- Environment variables from `.env.vercel`

## Setting Up the Complete Deployment

### 1. Prepare Environment Variables
Set these environment variables in your Vercel project dashboard:

```bash
# Database configuration
WAB_DBHOST="your-db-host.com"
WAB_DBUSER="wab"
WAB_DBNAME="plasmic-db"
WAB_DBPASSWORD="your-secure-password"
WAB_DBPORT="5432"

# JWT Secret for CMS integration
JWT_SECRET="your-super-secret-jwt-key"

# Other required environment variables
NODE_ENV="production"
PORT="3000"
BACKEND_PORT="3004"
HOSTSERVER_PORT="3005"

# Public URLs
NEXT_PUBLIC_PUBLIC_URL="https://your-plasmic-app.vercel.app"
REACT_APP_PUBLIC_URL="https://your-plasmic-app.vercel.app"
PUBLIC_URL="https://your-plasmic-app.vercel.app"
```

### 2. Deploy to Vercel
```bash
vercel --prod
```

## Local Testing Options

### Option 1: Full Development Setup (Complete Application)
To test the complete application with all services running locally:

```bash
cd platform/wab
yarn dev
```

This will start all three services:
- Frontend: http://localhost:3003 
- Backend: http://localhost:3004
- Host server: http://localhost:3005

### Option 2: Docker-based Testing
To test the Docker build locally:

```bash
# Build the Docker image
docker build -t plasmic-vercel .

# Run the Docker container
docker run -p 3000:3000 -p 3004:3004 -p 3005:3005 -e WAB_DBHOST=your-db-host... plasmic-vercel
```

### Option 3: Using Vercel CLI for Local Testing
You can also use the Vercel CLI to test locally with Docker:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Test locally with Vercel CLI:
```bash
vercel dev
```

This will use your Docker configuration to run the app locally in a Vercel-like environment.

## Environment Configuration for Testing

### For Local Development
When running `yarn dev`, you can use these environment variables in a `.env` file in the `platform/wab` directory:

```
# For local development with all services
NEXT_PUBLIC_PUBLIC_URL="http://localhost:3003"
REACT_APP_PUBLIC_URL="http://localhost:3003"
PUBLIC_URL="http://localhost:3003"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3004"
REACT_APP_BACKEND_URL="http://localhost:3004"
BACKEND_URL="http://localhost:3004"
WAB_DBHOST="127.0.0.1"
WAB_DBUSER="wab"
WAB_DBNAME="wab"
WAB_DBPASSWORD="SEKRET"
WAB_DBPORT="5432"
```

### For Production Deployment
Use the variables defined in `.env.vercel` with your actual production URLs and database configuration.

## Docker Deployment Details

The Docker approach allows the complete Plasmic application to run in a single container:
- All services (frontend, backend, host) run simultaneously
- Dependencies are properly installed for all platform packages
- Uses concurrently to manage all processes
- Proper ports are exposed for Vercel routing

## Development

To run the full application locally:

```bash
cd platform/wab
yarn dev
```

This will start all services (frontend, backend, and host server) on their respective ports.

## Production Deployment

For a fully functional production Plasmic instance on Vercel:

1. **Container**: Deploy using the Docker configuration in this repository
2. **Database**: PostgreSQL database hosted separately (AWS RDS, GCP Cloud SQL, etc.)
3. **Environment**: Set all required environment variables in Vercel dashboard

This approach gives you the complete Plasmic functionality with all services properly integrated.