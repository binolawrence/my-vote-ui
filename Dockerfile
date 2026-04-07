# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy all source code and configuration files
COPY . .

# List files to debug
RUN ls -la

# Build the application
RUN npm run build 2>&1

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the production build
RUN npm install -g serve

# Copy the built dist folder from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]

