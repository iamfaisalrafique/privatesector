FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy package dependency manifests
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy codebase
COPY . .

# Build the client production assets
RUN npm run build

# Prune development dependencies to keep image slim
RUN npm prune --production

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Run the Express production server
CMD ["npm", "start"]
