# 🕉️ MALA – Secure Digital Mala Counting, Transfer & Social Community Platform

> A production-oriented mobile and server application combining the trust and ledger precision of a digital banking app, the mindfulness of a spiritual meditation companion, and the connectedness of a modern devotee community.

---

## 🏛️ Project Architecture Overview

The codebase is organized into two independent, clean directories:

```
c:\code\mala app\
├── server/                     # Backend API, WebSocket Gateway & Double-Entry Ledger
│   ├── prisma/
│   │   ├── schema.prisma       # 25+ Normalized PostgreSQL tables & constraints
│   │   └── seed.ts             # Seeds initial users (User A, B, C & Admin)
│   ├── src/
│   │   ├── common/             # DTOs, Guards, Roles, Interceptors, Filters
│   │   ├── prisma/             # Prisma ORM Database Service
│   │   └── modules/
│   │       ├── auth/           # JWT, Refresh Tokens, Passwords, Mobile OTP
│   │       ├── users/          # Devotee Profiles, Isolation & Privacy controls
│   │       ├── ledger/         # Authoritative Double-Entry Banking Engine
│   │       ├── wallet/         # Real-time balances, Transfers, Receipts & QR codes
│   │       ├── counter/        # Digital Mala Counter, Targets, Streaks & Sadhana stats
│   │       ├── friends/        # Mutual Friends, Requests, Suggestions, Block lists
│   │       ├── feed/           # Social Community Posts, Categories, Likes & Comments
│   │       ├── chat/           # 1-to-1 Satsang Chat with WebSocket Real-Time Gateway
│   │       ├── notifications/  # Notification center & Expo Push token registry
│   │       ├── achievements/   # Backend Gamification & Milestone Badges
│   │       ├── subscriptions/  # Free vs Premium Devotee Membership & IAP verification
│   │       └── admin/          # Admin Governance, User Moderation & Ledger Reconciliation
│   ├── test/                   # Comprehensive E2E User Isolation & Ledger Transfer tests
│   ├── Dockerfile
│   └── package.json
│
├── client/                     # React Native Expo Mobile Application
│   ├── app/                    # Expo Router file-based navigation
│   │   ├── _layout.tsx         # Root provider (Theme, TanStack Query, Auth)
│   │   ├── (auth)/             # Onboarding carousel, Login & Registration
│   │   ├── (tabs)/             # 5 Core Bottom Tabs
│   │   │   ├── index.tsx       # Home Dashboard (Greetings, Daily target, Wallet card, Quotes)
│   │   │   ├── counter.tsx     # Digital Mala Counter (11, 21, 51, 108, 1008 targets)
│   │   │   ├── wallet.tsx      # Digital Wallet (Balance, QR receive, Ledger history)
│   │   │   ├── community.tsx   # Social Feed (Post creation, Category pills, Likes)
│   │   │   └── profile.tsx     # Devotee Profile (Privacy toggles, Language switcher)
│   │   ├── transfer/send.tsx   # Send Mala flow (Verify preview, Confirmation, Receipt)
│   │   ├── chat/               # Satsang Chat (Conversation list & 1-to-1 Room)
│   │   ├── friends/index.tsx   # Devotee Friends & Requests management
│   │   ├── notifications/      # In-App Notification Center
│   │   ├── subscription/       # Devotee Premium upgrade & feature benefits
│   │   └── admin/index.tsx     # Web & Mobile Admin Governance Portal
│   ├── src/
│   │   ├── api/client.ts       # Axios client with auto Bearer tokens & Sockets
│   │   ├── components/         # BeadCounter, WalletBalanceCard, PostCard, TransactionItem
│   │   ├── store/              # Zustand stores (authStore, counterStore, themeStore)
│   │   ├── theme/colors.ts     # Deep Saffron, Warm Cream, Soft Gold, Natural Green
│   │   └── i18n/translations.ts# Multi-language support (English, Hindi, Gujarati)
│   └── package.json
│
└── docker-compose.yml          # Production PostgreSQL 16 + Redis 7 + NestJS container stack
```

---

## 🔒 1. Banking-Style Double-Entry Ledger System

Implemented in [`server/src/modules/ledger/ledger.service.ts`](file:///c:/code/mala%20app/server/src/modules/ledger/ledger.service.ts):
- **Atomic Concurrency Control**: Transfers run within `prisma.$transaction` with balance validation and pessimistic row checks.
- **Strict Invariant**: Every transfer creates matching `DEBIT` (sender) and `CREDIT` (recipient) entries. `debitEntry.amount == creditEntry.amount`.
- **Idempotency**: Every transfer supports an optional `idempotencyKey` preventing duplicate requests from mobile network retries.
- **Negative Balance & Overdraft Prevention**: Automatically checks `senderWallet.balance >= transferAmount`.
- **User Isolation**: User C cannot view or tamper with transactions between User A and User B.
- **Reconciliation Engine**: Admin endpoint reconciles stored wallet balances against historical ledger entries:
  $$\text{Authoritative Balance} = \sum \text{Credits} - \sum \text{Debits}$$

---

## 🔑 2. Pre-Seeded Test Accounts

| Devotee Account | Username | Password | Role | Starting Wallet | Practice Sadhana |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **User A (Arjun)** | `user_a` | `Password@123` | `USER` | **100 Mala** | 1,080 Mala / 12d Streak |
| **User B (Bhakti)** | `user_b` | `Password@123` | `USER` | **50 Mala** | 2,160 Mala / 18d Streak |
| **User C (Chetan)** | `user_c` | `Password@123` | `USER` | **0 Mala** | 27 Mala / 2d Streak |
| **Platform Admin** | `admin_devotee` | `AdminPass@108` | `ADMIN` | **System Vault** | Platform Guardian |

> **Convenience Feature**: The mobile login screen includes **1-Click Test Devotee Profiles** for instant switching between User A, User B, User C, and Admin.

---

## 🚀 3. Getting Started & Running Locally

### Backend Setup (`server/`)
```bash
# 1. Navigate to backend directory
cd server

# 2. Generate Prisma client & database schema
pnpm prisma:generate

# 3. Seed test devotees (when PostgreSQL is active)
pnpm prisma:seed

# 4. Start NestJS in development mode
pnpm start:dev
```
- **API Base URL**: `http://localhost:3000/api/v1`
- **Interactive OpenAPI / Swagger Documentation**: `http://localhost:3000/api/docs`

### Frontend Mobile App Setup (`client/`)
```bash
# 1. Navigate to mobile app directory
cd client

# 2. Start Expo Metro bundler
pnpm start

# Or run directly on Web / Android / iOS:
pnpm web
pnpm android
pnpm ios
```

---

## 🧪 4. Automated Test Verification

All test suites have been verified and pass with a 100% success rate:

```bash
# Run unit tests (Counter logic, Ledger balancing, User isolation checks)
cd server
pnpm test

# Run E2E test suite (User A to User B 10 Mala transfer, reverse transfer, fraud prevention)
pnpm test:e2e
```

**Test Coverage Highlights:**
1. ✅ **Double-entry invariant check**: `DEBIT == CREDIT == 10`.
2. ✅ **Balance transitions**: User A drops 100 ➔ 90, User B rises 50 ➔ 60.
3. ✅ **Reverse transfer**: User B sends 5 back: B ➔ 55, A ➔ 95.
4. ✅ **Strict User Isolation**: User C request for User A/B transaction returns `403 Forbidden`.
5. ✅ **Overdraft prevention**: User C (0 Mala) attempting to transfer 1 Mala is rejected with `400 Bad Request`.
6. ✅ **Unauthenticated guard**: Protected endpoints return `401 Unauthorized`.
7. ✅ **Idempotency verification**: Repeated transaction keys return existing receipt without duplicate balance deductions.

---

## 🚢 5. Production Deployment

The entire platform is fully configured and ready for production deployment across Cloud VPS, Docker, Vercel/Netlify, and Mobile App Stores (Google Play Store & Apple App Store).

See the comprehensive [**Production Deployment Guide (DEPLOYMENT.md)**](./DEPLOYMENT.md) for full instructions.

### Quick Start: 1-Command VPS / Docker Deployment
```bash
# Automated deployment with health checks
chmod +x scripts/*.sh server/*.sh
./scripts/deploy.sh
```

Or run Docker Compose:
```bash
docker compose up -d --build
```

### Services Included in Production Compose:
- **`frontend`**: High-performance Nginx Alpine web container serving static React Native Web assets (`http://localhost`).
- **`backend`**: Production NestJS API & WebSocket container (`http://localhost:3000`).
- **`postgres`**: Authoritative PostgreSQL 16 database with persistent storage.
- **`redis`**: Redis 7 cache & Pub/Sub broker with AOF persistence.
- **`db-backup`**: Automated daily cron backups of the double-entry ledger.

### Mobile App Publishing (Google Play & Apple App Store)
```bash
cd client
# Build Android App Bundle (.aab) for Google Play Console:
eas build -p android --profile production

# Build iOS IPA for TestFlight & Apple App Store:
eas build -p ios --profile production
```

#   m a l a  
 