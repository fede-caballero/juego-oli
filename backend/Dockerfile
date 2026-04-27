FROM node:24-alpine

# better-sqlite3 needs build tools
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Remove build deps to keep image small
RUN apk del python3 make g++

COPY . .

ENV PORT=3456

EXPOSE 3456

CMD ["node", "server.js"]
