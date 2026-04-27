FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=3456
ENV JWT_SECRET=cambiar-este-secret-en-produccion

EXPOSE 3456

CMD ["node", "server.js"]
