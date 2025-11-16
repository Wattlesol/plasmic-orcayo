# Improved Plasmic Deployment Guide

This document explains how to set up and run the Plasmic application with Docker in both local development and production environments using the improved deployment process.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Deployment Commands](#deployment-commands)
5. [Environment Management](#environment-management)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker Engine (v20.10.0 or later)
- Docker Compose (v2.0.0 or later)
- Node.js v21.5.0 (for local development) - Node v22 for production (due to dependency compatibility)
- OpenSSL (for generating secure keys)

## Quick Start

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd plasmic-orcayo
```

2. Run the setup command:
```bash
./deploy-plasmic.sh setup
```

3. Start the local development environment:
```bash
./deploy-plasmic.sh start local
```

4. Access the application:
   - Web App Builder: http://localhost:3003
   - Backend API: http://localhost:3004
   - Additional services: http://localhost:3005

### Production Deployment

1. Set up environment variables in your system or .env file:
```bash
export DATABASE_URL=postgresql://user:password@host:port/dbname
export SESSION_SECRET=your_secure_session_secret
export CMS_INTEGRATION_API_KEY=your_secure_api_key
export PUBLIC_URL=https://yourdomain.com
```

2. Start the production environment:
```bash
./deploy-plasmic.sh start prod
```

## Configuration

### Environment Variables

The application uses environment variables for configuration. For local development, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then update the values in `.env` to match your setup.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption
- `CMS_INTEGRATION_API_KEY`: API key for CMS integrations
- `NODE_ENV`: Set to `development` or `production`
- `PUBLIC_URL`: Public URL of your application

### Docker Compose Files

- `docker-compose.local.yml`: For local development with PostgreSQL and Redis
- `docker-compose.prod.yml`: For production deployment (connects to external database)

## Deployment Commands

The deployment script provides several commands to manage your Plasmic instance:

### Setup

Set up the environment files and dependencies:
```bash
./deploy-plasmic.sh setup
```

### Start Services

Start services in local or production mode:
```bash
# Local development
./deploy-plasmic.sh start local

# Production
./deploy-plasmic.sh start prod
```

### Stop Services

Stop services in local or production mode:
```bash
# Local development
./deploy-plasmic.sh stop local

# Production
./deploy-plasmic.sh stop prod
```

### Restart Services

Restart services in local or production mode:
```bash
# Local development
./deploy-plasmic.sh restart local

# Production
./deploy-plasmic.sh restart prod
```

### Run Database Migrations

Run database migrations in local or production mode:
```bash
# Local development
./deploy-plasmic.sh migrate local

# Production
./deploy-plasmic.sh migrate prod
```

### Seed Database (Local Only)

Populate the database with default data for local development:
```bash
./deploy-plasmic.sh seed
```

### View Logs

View service logs in local or production mode:
```bash
# Local development
./deploy-plasmic.sh logs local

# Production
./deploy-plasmic.sh logs prod
```

### Check Status

View service status in local or production mode:
```bash
# Local development
./deploy-plasmic.sh status local

# Production
./deploy-plasmic.sh status prod
```

## Environment Management

### Local Development Environment

The local environment includes:
- PostgreSQL database with automatic migration and seeding
- Redis for session storage and caching
- Plasmic application services
- Automatic file watching for development

### Production Environment

The production environment includes:
- Plasmic application services with resource limits
- Nginx reverse proxy with SSL support
- Connects to external database and Redis services
- Optimized for performance and security

## Advanced Configuration

### Database Setup

For production, you need to set up your own PostgreSQL database and configure the connection details in your environment variables.

### SSL Configuration

For production SSL setup, mount your SSL certificates to the nginx container at `/etc/ssl/private/` with files named `cert.pem` and `key.pem`.

### Redis Configuration

Redis is used for session storage and caching. The local environment includes a Redis service, but in production, you should use an external Redis service for better performance and reliability. Configure the connection details in the `REDIS_URL` environment variable.

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Make sure ports 3003-3005, 5433, and 6379 are not being used by other applications
   - Check with: `lsof -i :3003`, `lsof -i :3004`, `lsof -i :3005`, `lsof -i :5433`, `lsof -i :6379`

2. **Docker Build Errors**
   - Check available disk space
   - Try clearing Docker build cache: `docker builder prune`
   - Ensure you have enough memory allocated to Docker

3. **Database Connection Issues**
   - Verify database connection parameters in your environment variables
   - Check that the database server is accessible from the application container

### Useful Commands

```bash
# Check Docker system status
docker system df

# Clean up unused Docker resources
docker system prune

# View detailed logs for specific service
docker-compose -f docker-compose.local.yml logs app

# Execute commands inside containers
docker-compose -f docker-compose.local.yml exec app sh

# Monitor container resource usage
docker stats
```

### Getting Help

If you encounter issues not covered in this guide:
1. Check the container logs using `./deploy-plasmic.sh logs local` or `./deploy-plasmic.sh logs prod`
2. Review the Docker Compose configuration files
3. Verify your environment variables are correctly set

## Security Considerations

1. Always use strong, unique values for `SESSION_SECRET` and `CMS_INTEGRATION_API_KEY`
2. Never commit `.env` files to version control
3. Use SSL/HTTPS in production
4. Regularly update Docker images and dependencies
5. Limit access to administrative endpoints
6. Implement proper backup strategy for your database