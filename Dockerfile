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

# Install production dependencies for emdash-site
COPY emdash-site/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts and assets
COPY --from=builder /app/emdash-site/dist ./dist
COPY --from=builder /app/emdash-site/seed ./seed
COPY --from=builder /app/emdash-site/data.db* ./
COPY --from=builder /app/public /app/public
COPY --from=builder /app/server /app/server

# Expose Coolify container port
EXPOSE 5000

# Health check using node native fetch
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "./dist/server/entry.mjs"]
