# ‌Multi-stage production Dockerfile for Plasmic application
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
    && chown -R plasmic:nodejs /app \
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

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=plasmic:nodejs /app /app

# Change ownership to non-root user
USER plasmic

# Expose ports
EXPOSE 3003 3004 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3004/api/health || exit 1

# Use dumb-init to handle PID 1 properly
ENTRYPOINT ["dumb-init", "--"]

# Default command to start the application - in the simplified Docker context, 
# the application code is directly in /app, not in /app/platform/wab
# Environment variables need to be provided at runtime
CMD ["sh", "-c", "yarn backend"]