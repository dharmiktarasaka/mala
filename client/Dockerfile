# Stage 1: Build the static web bundle using Expo
FROM node:20-alpine AS builder

WORKDIR /app

# Accept API URL as build argument for static baking
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_SOCKET_URL

ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}
ENV EXPO_PUBLIC_SOCKET_URL=${EXPO_PUBLIC_SOCKET_URL}

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .

# Export web production bundle into ./dist
RUN pnpm exec expo export --platform web

# Stage 2: Serve static files using high-performance Nginx Alpine
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]

