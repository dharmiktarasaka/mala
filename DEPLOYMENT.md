# 🕉️ MALA Platform - Production Deployment Guide

This document provides complete instructions for deploying the **MALA** platform to production across modern cloud providers, VPS servers, and mobile app stores (Google Play & Apple App Store).

---

## 🏗️ Architecture Overview

| Tier | Technology | Port / URL | Deployment Targets |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | Expo 51 (React Native Web) + Nginx Alpine | `80` / `443` | Docker Compose, Vercel, Netlify, Cloudflare Pages |
| **Mobile Apps** | React Native, Expo Router, NativeWind | Native | Google Play Store (`.aab`), Apple App Store (`.ipa`) via EAS |
| **Backend API** | NestJS 10, TypeScript, Socket.IO | `3000` | Docker, AWS ECS Fargate, Railway, Render, Fly.io |
| **Database** | PostgreSQL 16 (Double-Entry Ledger) | `5432` | AWS RDS, Supabase, Neon, Docker Volume |
| **Cache & Pub/Sub** | Redis 7 Alpine | `6379` | AWS ElastiCache, Redis Cloud, Upstash, Docker Volume |
| **Object Storage** | S3-Compatible Storage | HTTPS | AWS S3, Cloudflare R2, MinIO |

---

## 🚀 Option 1: 1-Click VPS / Server Deployment (Docker Compose)

Ideal for **DigitalOcean, AWS EC2, Hetzner, Linode, or any Ubuntu/Debian Linux VPS**.

### 1. Prerequisites on Server
Install Docker and Docker Compose v2:
```bash
# Ubuntu / Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Clone and Configure
```bash
git clone https://github.com/your-username/mala-app.git /opt/mala-app
cd /opt/mala-app

# Copy production environment template
cp server/.env.production.example .env
```

Edit `.env` with your production domains and secure secrets:
```bash
nano .env
```
Key variables to customize:
- `POSTGRES_PASSWORD`: Use a strong 32+ character password.
- `JWT_SECRET` & `JWT_REFRESH_SECRET`: Generate using `openssl rand -base64 64`.
- `CORS_ORIGIN`: Your public frontend domain (e.g. `https://mala.app`).
- `EXPO_PUBLIC_API_URL`: Backend URL (e.g. `https://api.mala.app/api/v1`).
- `EXPO_PUBLIC_SOCKET_URL`: Backend socket URL (e.g. `https://api.mala.app`).

### 3. Deploy
Run the automated deployment script:
```bash
chmod +x scripts/*.sh server/*.sh
./scripts/deploy.sh
```

Or run Docker Compose directly:
```bash
docker compose up -d --build
```

### 4. Verify Services
```bash
# Check container health status
docker compose ps

# Backend health check
curl -I http://localhost:3000/api/v1/health

# Web frontend check
curl -I http://localhost/healthz
```

### 5. Automated HTTPS / SSL (Nginx & Let's Encrypt)
On your VPS host, install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d mala.app -d api.mala.app
```

---

## ☁️ Option 2: Cloud PaaS Deployment (Railway / Render / Fly.io)

For fully managed auto-scaling infrastructure:

### Backend Deployment (Railway or Render)
1. **Database**: Create a **PostgreSQL** instance and a **Redis** instance.
2. **Backend Web Service**:
   - Link repository, root directory: `server`.
   - Build command: `pnpm install && pnpm prisma:generate && pnpm build` (or use Dockerfile: `server/Dockerfile`).
   - Start command: `node dist/src/main.js`
   - Set Environment Variables:
     - `PORT`: `3000`
     - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
     - `REDIS_URL`: `${{Redis.REDIS_URL}}`
     - `JWT_SECRET`: `<generated-secret>`
     - `JWT_REFRESH_SECRET`: `<generated-refresh-secret>`
     - `CORS_ORIGIN`: `https://app.mala.app`
3. **Health Check Path**: `/api/v1/health`

### Web Frontend Deployment (Vercel or Netlify)
1. **Import Repository**:
   - Root Directory: `client`
   - Framework Preset: `Other`
   - Build Command: `pnpm exec expo export --platform web` (pre-configured in `client/vercel.json` and `client/netlify.toml`)
   - Output Directory: `dist`
2. **Environment Variables**:
   - `EXPO_PUBLIC_API_URL`: `https://your-api-domain.com/api/v1`
   - `EXPO_PUBLIC_SOCKET_URL`: `https://your-api-domain.com`

---

## 📱 Option 3: Mobile App Publishing (Google Play & Apple App Store)

Using **EAS (Expo Application Services)**:

### 1. Install EAS CLI & Login
```bash
cd client
npm install -g eas-cli
eas login
```

### 2. Configure Project
```bash
eas build:configure
```
*(The repository already includes production profiles in `client/eas.json`)*.

### 3. Build for Android (Google Play Store)
```bash
# Build internal testing APK (download directly onto Android phones):
eas build -p android --profile preview

# Build production Android App Bundle (.aab) for Google Play Console:
eas build -p android --profile production
```

### 4. Build for iOS (Apple App Store / TestFlight)
```bash
# Build production IPA for TestFlight and App Store:
eas build -p ios --profile production
```

### 5. Submit to App Stores
```bash
# Submit to Google Play
eas submit -p android

# Submit to Apple App Store
eas submit -p ios
```

---

## 💾 Database Backups & Maintenance

### 1. Automated Backups
The `docker-compose.yml` includes an automated `db-backup` service that:
- Runs daily at midnight (`@daily`).
- Stores compressed SQL dumps in the `backup_data` volume.
- Automatically keeps 14 daily, 4 weekly, and 6 monthly backups.

### 2. Manual Backup
```bash
./scripts/backup-database.sh
```

### 3. Database Restore
```bash
./scripts/restore-database.sh ./backups/mala_backup_20261105_120000.sql.gz
```

### 4. Running Migrations Manually
```bash
cd server
npx prisma migrate deploy
```

---

## 📊 Monitoring & Health Checks

- **Health Endpoint**: `GET /api/v1/health`
  - Returns `200 OK`
  - Checks database connection status
  - Reports server uptime and heap memory usage
- **OpenAPI / Swagger Documentation**: `GET /api/docs`
- **Docker Logs**:
  ```bash
  docker compose logs -f backend
  docker compose logs -f frontend
  ```

