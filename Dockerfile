# Multi-stage production Dockerfile for PATCHPULSE
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# Dependencies
FROM base AS dependencies
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/
COPY prisma ./prisma/
RUN npm install

# Build
FROM dependencies AS builder
COPY . .
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm --workspace=packages/shared run build
RUN npm --workspace=apps/api run build
RUN npm --workspace=apps/web run build

# Production Runner
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "apps/api/dist/main"]
