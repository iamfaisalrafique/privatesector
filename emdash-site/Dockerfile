FROM node:22.18-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code (respecting .dockerignore)
COPY . .

# Build Astro standalone site
RUN npm run build

# Production runtime stage
FROM node:22.18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built standalone server and client assets from builder
COPY --from=builder /app/dist ./dist

EXPOSE 4321

# Health check using node native fetch
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4321/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

USER node

CMD ["node", "./dist/server/entry.mjs"]
