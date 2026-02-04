

# ============================================
# Stage 1: Build
# ============================================
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Konfigurasi npm agar stabil
RUN npm config set registry https://registry.npmmirror.com \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 2 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000

# Install all dependencies (including devDependencies for build)
RUN npm ci
# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-slim AS production

WORKDIR /app

# Install system dependencies for native modules and dumb-init
RUN apt-get update && apt-get install -y \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy entrypoint scripts
COPY entrypoint.sh /app/entrypoint.sh
COPY entrypoint.worker.sh /app/entrypoint.worker.sh
RUN chmod +x /app/entrypoint.sh /app/entrypoint.worker.sh

# Create non-root user for security
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nestjs && \
    chown -R nestjs:nodejs /app

USER nestjs

# Expose application port
EXPOSE 8080

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Default command (can be overridden in docker-compose)
CMD ["/app/entrypoint.sh"]
