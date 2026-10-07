FROM node:22-slim

# Create app directory
WORKDIR /usr/src/app

# Install curl for container health check
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# Build Vite frontend into dist/
RUN npm run build

# Expose port (Coolify uses the PORT env var)
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:5000/api/health || exit 1

# Start the Express server
CMD [ "npm", "start" ]
