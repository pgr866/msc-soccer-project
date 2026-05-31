FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3333
CMD ["npm", "run", "start"]
# docker build -t stencil . && docker run -p 3333:3333 -v "$(pwd):/app" -v /app/node_modules --name stencil-app stencil