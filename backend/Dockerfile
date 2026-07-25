# SMC Backend — production image (Render, Railway, Fly.io, etc.)
FROM node:22-alpine AS builder

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma/
RUN npm ci

COPY backend/tsconfig.json ./
COPY backend/src ./src/
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist
# product-version.ts resolves join(cwd, "..", "version.json") => /version.json
COPY version.json /version.json
COPY backend/scripts ./scripts

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/v1/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
