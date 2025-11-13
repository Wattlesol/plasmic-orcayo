# Use Node 21 alpine as the base image
FROM node:21-alpine

# Set working directory
WORKDIR /app

# Install bash and other required tools
RUN apk add --no-cache bash curl python3 make g++

# Copy the entire project
COPY . .

# Install global dependencies
RUN npm install -g concurrently

# Set environment variables
ENV NODE_ENV=production

# Install dependencies
RUN cd platform/wab && yarn install --frozen-lockfile

# Build the application
RUN cd platform/wab && yarn build

# Install dependencies for all platform packages
RUN cd platform/sub && yarn install && yarn build
RUN cd platform/live-frame && yarn install && yarn build
RUN cd platform/react-web-bundle && yarn install && yarn build
RUN cd platform/canvas-packages && yarn install && yarn build
RUN cd platform/loader-html-hydrate && yarn install && yarn build

# Expose the main port (Vercel will route requests appropriately)
EXPOSE 3000
EXPOSE 3004
EXPOSE 3005

# Create a startup script that runs all services
RUN echo '#!/bin/bash\n\
cd platform/wab && \\\n\
echo "Starting all Plasmic services..." && \\\n\
echo "Backend service will run on port 3004" && \\\n\
echo "Frontend service will run on port 3000" && \\\n\
echo "Host service will run on port 3005" && \\\n\
concurrently \\\n\
  --names "frontend,backend,host" \\\n\
  --prefix name \\\n\
  --kill-others-on-fail \\\n\
  "PORT=3000 BACKEND_PORT=3004 PUBLIC_URL=http://localhost:3000 yarn start" \\\n\
  "PORT=3004 CODEGEN_HOST=http://localhost:3000 BACKEND_PORT=3004 REACT_APP_DEV_PROXY=http://localhost:3000 yarn backend" \\\n\
  "HOSTSERVER_PORT=3005 PORT=3005 yarn host-server"' > /app/start.sh

RUN chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]