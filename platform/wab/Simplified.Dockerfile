# Simplified single-stage Dockerfile for WAB application
# Designed for easy deployment of just the WAB application

FROM node:22-alpine

# Install necessary system dependencies
RUN apk add --no-cache \
    bash \
    git \
    curl \
    python3 \
    py3-pip \
    postgresql-client \
    build-base \
    g++ \
    make \
    jq

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S plasmic -u 1001

WORKDIR /app

# Copy package files
COPY --chown=plasmic:nodejs package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --network-timeout 100000

# Copy application code
COPY --chown=plasmic:nodejs . .

# Ensure tsconfig.json is available for tsconfig-paths
# The tsconfig.json should already be in the root directory (/app) where the app runs
RUN if [ ! -f /app/tsconfig.json ]; then echo "WARNING: tsconfig.json not found!"; fi

# Build steps specific to WAB
RUN CYPRESS_INSTALL_BINARY=0 yarn install --frozen-lockfile --network-timeout 300000 --prefer-offline

# Additional setup
RUN mkdir -p build dev-build && \
    yarn add bcrypt --build-from-source && \
    yarn cache clean

# Change ownership to non-root user
USER plasmic

# Expose ports
EXPOSE 3003 3004 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3004/api/health || exit 1

# Start the application
CMD ["sh", "-c", "yarn backend"]