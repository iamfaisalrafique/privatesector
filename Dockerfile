FROM node:22-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install dependencies (npm ci is preferred for reproducible builds)
RUN npm ci

# Bundle app source
COPY . .

# Build Vite frontend
RUN npm run build

# Expose port (Coolify uses the PORT env var)
ENV PORT=5000
EXPOSE 5000

# Start the Express server
CMD [ "npm", "start" ]
