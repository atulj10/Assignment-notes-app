FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma
RUN npm ci
RUN npx prisma generate

FROM node:20-alpine
WORKDIR /app/backend
COPY --from=builder /app/backend/node_modules ./node_modules
COPY backend/ .
EXPOSE 3000
CMD ["node", "src/server.js"]
