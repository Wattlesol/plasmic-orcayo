# Docker Deployment Guide for Plasmic

This document explains how to set up and run the Plasmic application with Docker in both local development and production environments.

## Prerequisites

- Docker Engine (v20.10.0 or later)
- Docker Compose (v2.0.0 or later)
- Node.js v21.5.0 (for both local development and production)

## Configuration Files

The project includes two Docker Compose configurations:

1. `docker-compose.local.yml` - For local development with PostgreSQL
2. `docker-compose.prod.yml` - For production deployment connecting to remote database

## Local Development Setup

### Running the Application Locally

1. Make sure you have the required environment variables in your `.env` file:

```
DATABASE_URI=postgresql://wab:SEKRET@142.44.136.233:5432/plasmic-db
WAB_DBNAME=plasmic-db
WAB_DBPASSWORD=SEKRET
NODE_ENV=development
```

2. Start the services using Docker Compose:

```bash
# Build and start all services in the background
docker-compose -f docker-compose.local.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.local.yml up --build -d
```

3. Access the application:
   - Web App Builder: http://localhost:3003
   - Backend API: http://localhost:3004
   - Additional services: http://localhost:3005

### Stopping the Local Development Environment

```bash
# Stop all services
docker-compose -f docker-compose.local.yml down

# Stop and remove volumes (this will delete your database data)
docker-compose -f docker-compose.local.yml down -v
```

## Production Deployment Setup

### Pre-deployment Configuration

1. Update the database configuration in `docker-compose.prod.yml`:

```yaml
environment:
  - DATABASE_URI=postgresql://wab:YOUR_PASSWORD@your-remote-db-host:5432/plasmic-db
  - WAB_DBHOST=your-remote-db-host
  - WAB_DBPORT=5432
  - WAB_DBUSER=wab
  - WAB_DBPASSWORD=YOUR_PASSWORD
  - WAB_DBNAME=plasmic-db
  - PUBLIC_URL=http://your-production-domain.com
  - SESSION_SECRET=your-production-session-secret-key
```

2. Ensure your remote database is accessible and has the required schema.

### Deploying to Production

```bash
# Build and start the application
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

### Managing Production Deployment

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale the application (if needed)
docker-compose -f docker-compose.prod.yml up --scale app=2

# Run migrations manually (if needed)
docker-compose -f docker-compose.prod.yml exec plasmic-app sh -c "cd /app/platform/wab && yarn typeorm migration:run"

# Stop the application
docker-compose -f docker-compose.prod.yml down

# Update the application (rebuild and restart)
docker-compose -f docker-compose.prod.yml up --build -d
```

## Running Migrations

### Local Development

Migrations are automatically run when the application starts up. If you need to run them manually:

```bash
# Run in the container
docker-compose -f docker-compose.local.yml exec plasmic-wab sh -c "cd /plasmic/platform/wab && yarn typeorm migration:run"
```

### Production

Migrations are automatically run when the application starts up. For manual execution:

```bash
# Run in the container
docker-compose -f docker-compose.prod.yml exec app sh -c "cd /app/platform/wab && yarn typeorm migration:run"
```

## Environment Variables

### Local Development Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `DATABASE_URL` | Database connection URL | `postgresql://wab:SEKRET@plasmic-db:5432/wab` |
| `WAB_DBHOST` | Database host | `plasmic-db` |
| `WAB_DBUSER` | Database user | `wab` |
| `WAB_DBPASSWORD` | Database password | `SEKRET` |
| `WAB_DBNAME` | Database name | `wab` |

### Production Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URI` | Database connection URL | `postgresql://wab:SEKRET@your-remote-db-host:5432/plasmic-db` |
| `WAB_DBHOST` | Database host | `your-remote-db-host` |
| `WAB_DBPORT` | Database port | `5432` |
| `WAB_DBUSER` | Database user | `wab` |
| `WAB_DBPASSWORD` | Database password | `SEKRET` |
| `WAB_DBNAME` | Database name | `plasmic-db` |
| `PUBLIC_URL` | Public URL for the application | `http://your-production-domain.com` |
| `SESSION_SECRET` | Secret key for session encryption | `your-production-session-secret-key` |
| `PLASMIC_DEPLOYMENT_ENV` | Deployment environment | `production` |

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify that the database host, port, and credentials are correct
   - Check that the database server is accessible from the application container

2. **Port Already in Use**
   - Make sure ports 3003-3005 are not being used by other applications
   - Check with: `lsof -i :3003`, `lsof -i :3004`, `lsof -i :3005`

3. **Node Modules Issues**
   - Named volumes are used to preserve node_modules from the container
   - If you encounter module errors, try clearing the volumes: `docker-compose -f docker-compose.local.yml down -v`

### Useful Commands

```bash
# Check Docker Compose status
docker-compose -f docker-compose.local.yml ps
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.local.yml logs plasmic-wab
docker-compose -f docker-compose.prod.yml logs plasmic-app

# Execute commands inside containers
docker-compose -f docker-compose.local.yml exec plasmic-wab sh
docker-compose -f docker-compose.prod.yml exec plasmic-app sh

# Build without starting services
docker-compose -f docker-compose.local.yml build
docker-compose -f docker-compose.prod.yml build
```

## Notes

- The local development setup includes a PostgreSQL database service for convenience
- The production setup is designed to connect to a remote database, so it doesn't include a PostgreSQL service
- Both configurations use volumes to persist data and improve build performance
- The Dockerfiles use multi-stage builds to optimize image size and security
- The production configuration uses Node v21.5.0 as requested