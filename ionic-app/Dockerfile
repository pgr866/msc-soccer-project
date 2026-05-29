# Common base stage
FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 8100
CMD ["npm", "start"]

# Build stage for production assets
FROM base AS builder
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production stage
FROM nginx:1.31-alpine AS production
COPY --from=builder /app/www /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8100
CMD ["nginx", "-g", "daemon off;"]