# Common base stage
FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
RUN apk add --no-cache netcat-openbsd
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage for production assets
FROM base AS builder
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:24-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["npm", "start"]