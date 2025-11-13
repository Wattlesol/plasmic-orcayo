# Vercel + Docker Configuration for Complete Plasmic Deployment

This approach uses Vercel's Container Runtime to deploy the complete Plasmic application with all services.

## Dockerfile for Complete Plasmic Stack

```dockerfile
# Use Node 21 alpine as the base image
FROM node:21-alpine

# Set working directory
WORKDIR /app

# Install bash and other required tools
RUN apk add --no-cache bash curl python3 make g++

# Copy the entire project
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV WAB_DBHOST=${WAB_DBHOST}
ENV WAB_DBUSER=${WAB_DBUSER}
ENV WAB_DBNAME=${WAB_DBNAME}
ENV WAB_DBPASSWORD=${WAB_DBPASSWORD}
ENV WAB_DBPORT=${WAB_DBPORT}

# Install dependencies
RUN cd platform/wab && yarn install --frozen-lockfile

# Build the application
RUN cd platform/wab && yarn build

# Expose the main port (Vercel will automatically detect this)
EXPOSE 3000

# Create a startup script
RUN echo '#!/bin/bash\n\
cd platform/wab && concurrently \\\n\
  --names frontend,backend,host \\\n\
  "PORT=3000 BACKEND_PORT=3004 PUBLIC_URL=http://localhost:3000 yarn start" \\\n\
  "BACKEND_PORT=3004 PUBLIC_URL=http://localhost:3000 yarn backend" \\\n\
  "HOSTSERVER_PORT=3005 yarn host-server"' > /app/start.sh

RUN chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]
```

## Vercel Configuration for Docker (vercel.json)

```json
{
  "version": 2,
  "name": "plasmic-complete",
  "builds": [
    {
      "src": "Dockerfile",
      "use": "@vercel/docker"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```

## Environment Variables (.env.vercel)

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

## Deploy to Vercel

1. Make sure you have Docker installed locally
2. Connect your repository to Vercel
3. Set the environment variables in the Vercel dashboard
4. Deploy using: `vercel --prod`

## Alternative: Single-Port Solution

If the Docker approach is not suitable, another approach is to modify the application to run all services through a single Express.js server:

```javascript
// server.js - Single entry point for all services
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'platform/wab/build')));

// Proxy API requests to the backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3004',  // This won't work in serverless
  changeOrigin: true,
}));

// Serve other static routes
app.get('/static/host.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'platform/wab/build/static/host.html'));
});

// Catch-all route to serve the main application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'platform/wab/build/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Plasmic app listening at http://localhost:${PORT}`);
});
```

However, this approach still requires a separate backend process running on port 3004, which defeats the purpose.

## Recommended Solution

The Docker approach is the most practical solution for deploying the complete Plasmic application to Vercel, as it allows all services (frontend, backend, host) to run within a single containerized environment that Vercel can manage.

To implement this:

1. Create a new `Dockerfile` in the root of your project
2. Update `vercel.json` to use the Docker builder
3. Set up environment variables in Vercel
4. Deploy to Vercel

This will give you a complete Plasmic deployment with all services running together in a container.