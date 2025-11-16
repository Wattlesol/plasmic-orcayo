# Multi-stage production Dockerfile for Plasmic application
# Using Node v22 as required for production environment

# === Build Stage ===
FROM node:22-alpine AS builder

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
    jq \
    openjdk11-jre-headless \
    && mkdir -p /app/platform/wab/node_modules \
    && chmod -R 755 /app

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install root dependencies
RUN yarn install --frozen-lockfile --prefer-offline --network-timeout 100000

# Copy the rest of the application
COPY . .

# Skip Cypress installation during Docker build as it causes network issues in production builds
# Clean Yarn cache first to avoid corruption issues
RUN yarn cache clean --force && CYPRESS_INSTALL_BINARY=0 yarn install --frozen-lockfile --network-timeout 300000 --prefer-offline

# Final setup steps
RUN mkdir -p build dev-build && \
    yarn add -W bcrypt --build-from-source && \
    yarn cache clean

# === Production Stage ===
FROM node:22-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    bash \
    curl \
    postgresql-client \
    dumb-init \
    git

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S plasmic -u 1001

# Create directory structure to match docker-compose expectations
RUN mkdir -p /app/platform/wab

WORKDIR /app

# Copy only the required files to /app/platform/wab to match docker-compose command
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/yarn.lock /app/yarn.lock
COPY --from=builder /app/wait-for-it.sh /wait-for-it.sh
COPY --from=builder /app/test-db-connection.js /app/test-db-connection.js
COPY --from=builder /app/run-migrations.ts /app/run-migrations.ts
COPY --from=builder /app/data-source.ts /app/data-source.ts  # Need to create this

# Copy node_modules
COPY --from=builder /app/node_modules /app/node_modules

# Copy source code to the proper location
COPY --from=builder /app/src /app/src
COPY --from=builder /app/public /app/public
COPY --from=builder /app/assets /app/assets
COPY --from=builder /app/tsconfig*.json /app/
COPY --from=builder /app/*.ts /app/
COPY --from=builder /app/*.js /app/
COPY --from=builder /app/*.json /app/
COPY --from=builder /app/*.lock /app/

# Install TypeORM and other required packages globally
RUN yarn global add typeorm pg reflect-metadata

# Create directory structure for platform/wab
RUN mkdir -p /app/platform/wab && \
    ln -s /app/* /app/platform/wab/ 2>/dev/null || true

# Make wait-for-it script executable
RUN chmod +x /wait-for-it.sh

# Change ownership to non-root user
USER plasmic

# Expose ports
EXPOSE 3003 3004 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3004/api/health || exit 1

# Use dumb-init to handle PID 1 properly
ENTRYPOINT ["dumb-init", "--"]

# Default command to start the application with database connection check and migrations
CMD ["sh", "-c", "cd /app/platform/wab && ls && yarn install && echo 'Running database connectivity test...' && node test-db-connection.js && echo 'Database is ready!' && yarn run-ts -- run-migrations.ts && echo 'Migrations completed successfully!' && yarn backend"]