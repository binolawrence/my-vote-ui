# Dependencies stage
FROM node:18-alpine AS dependencies

WORKDIR /build

COPY package*.json ./

RUN npm ci

# Build stage
FROM dependencies AS build

WORKDIR /build

# Copy all source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run production build
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /build/dist ./dist

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["serve", "-s", "dist", "-l", "3000"]

