# Stage 1: Build the NestJS application and generate Prisma client
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma engine binary compilation
RUN apk add --no-cache openssl

# Install pnpm package manager
RUN npm install -g pnpm

# Copy package manifests and Prisma schema first for efficient Docker layer caching
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies for build
RUN pnpm install --frozen-lockfile || pnpm install

# Copy application source code
COPY . .

# Generate Prisma Client and compile TypeScript to production JS
RUN pnpm prisma:generate
RUN pnpm build

# Stage 2: Production runtime image
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl wget

ENV NODE_ENV=production
ENV PORT=3000

RUN npm install -g pnpm

# Copy package manifests and production dependencies
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

RUN pnpm install --prod --ignore-scripts || pnpm install --prod

# Copy Prisma engines and artifacts from builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Run container as non-root user for security
RUN chown -R node:node /app
USER node

EXPOSE 3000

# Docker healthcheck using the /api/v1/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
