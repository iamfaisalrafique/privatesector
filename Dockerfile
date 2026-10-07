FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install dependencies for emdash-site
COPY emdash-site/package*.json ./emdash-site/
WORKDIR /app/emdash-site
RUN npm ci

# Copy full repository source
WORKDIR /app
COPY . .

# Build Astro standalone site
WORKDIR /app/emdash-site
RUN npm run build

# Production runtime stage
FROM node:22-bookworm-slim AS runner

WORKDIR /app/emdash-site

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000

# Install curl for Coolify container healthcheck monitoring
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Install production dependencies for emdash-site
COPY emdash-site/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts and assets
COPY --from=builder /app/emdash-site/dist ./dist
COPY --from=builder /app/emdash-site/seed ./seed
COPY --from=builder /app/public /app/public

# Expose Coolify container port
EXPOSE 5000

# Health check using curl (satisfies Coolify container healthcheck requirement)
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:5000/api/health || exit 1

CMD ["node", "./dist/server/entry.mjs"]
