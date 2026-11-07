# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency specifications and Prisma schema
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install

# Copy source code and config
COPY . .

# Generate Prisma Client & compile TypeScript
RUN npx prisma generate
RUN pnpm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package specs & schema
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install production dependencies
RUN pnpm install --prod
RUN npx prisma generate

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Create storage directory for standalone mode
RUN mkdir -p /app/data

EXPOSE 10000

CMD ["node", "dist/src/main"]
