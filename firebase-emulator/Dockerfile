FROM node:24-alpine
WORKDIR /app
RUN apk add --no-cache openjdk21-jre
RUN npm install -g firebase-tools
RUN chown -R node:node /app
USER node
COPY firebase.json .
COPY storage.rules .
EXPOSE 4000 9099 8088 9199
CMD firebase emulators:start --project=msc-soccer-project --import=./firebase-export/msc-soccer-project --export-on-exit