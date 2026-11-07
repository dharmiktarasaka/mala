# 🚀 MALA Backend - Render Deployment Guide

Your backend is now **100% prepared and ready to deploy on [Render.com](https://render.com)**.

---

## ⚡ Option 1: Automatic 1-Click Blueprint (Recommended)

Because we created [`render.yaml`](./render.yaml), Render can automatically detect and configure your service with zero manual typing:

1. **Push your code to GitHub / GitLab**.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** &rarr; Select **Blueprint**.
4. Connect your `mala-app` repository.
5. Render reads `render.yaml` automatically and configures:
   - **Service Name**: `mala-backend`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `pnpm install --no-frozen-lockfile && pnpm run build`
   - **Start Command**: `pnpm run start:prod`
   - **Health Check Path**: `/api/v1/health`
   - Auto-generated cryptographic `JWT_SECRET` and `JWT_REFRESH_SECRET`
6. Click **Apply**. Render will build and deploy your live API!

---

## 🛠️ Option 2: Manual Web Service Setup (If not using Blueprint)

If you prefer to create a Web Service manually in Render:

1. In Render Dashboard, click **New +** &rarr; **Web Service**.
2. Connect your Git repository.
3. Configure the following fields:

| Setting | Value |
| :--- | :--- |
| **Name** | `mala-backend` |
| **Region** | Choose closest to you (e.g. `Singapore` or `Oregon` or `Frankfurt`) |
| **Branch** | `main` (or your active branch) |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `pnpm install --no-frozen-lockfile && pnpm run build` |
| **Start Command** | `pnpm run start:prod` |
| **Instance Type** | Free |

4. Scroll down to **Advanced** &rarr; **Health Check Path**:
   - Set to: `/api/v1/health`

5. In the **Environment Variables** section, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Port assigned by Render |
| `CORS_ORIGIN` | `*` | Or your frontend URL (e.g. `https://your-app.vercel.app`) |
| `JWT_SECRET` | *(Click "Generate" or type a 32+ char secret)* | Secret for auth tokens |
| `JWT_REFRESH_SECRET` | *(Click "Generate" or type a 32+ char secret)* | Secret for refresh tokens |
| `JWT_EXPIRES_IN` | `15m` | Token expiry |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token expiry |

6. Click **Create Web Service**.

---

## 🗄️ Optional: Connecting Databases

The backend includes an automatic fallback system, so it starts and works even without an external database configured. When you are ready to connect a cloud database:

### A. PostgreSQL (Authoritative Ledger)
- You can create a free PostgreSQL on **Render** (New + &rarr; PostgreSQL) or **Supabase** / **Neon**.
- Add the environment variable:
  ```env
  DATABASE_URL=postgresql://user:password@host:5432/mala_db?sslmode=require
  ```

### B. MongoDB Atlas (Cloud Cluster)
- In [MongoDB Atlas](https://cloud.mongodb.com), go to **Network Access** &rarr; Add `0.0.0.0/0` (Allow access from anywhere).
- Add the environment variable:
  ```env
  MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/mala_db?retryWrites=true&w=majority
  ```

---

## 🌐 Verifying Your Deployed Backend

Once Render finishes building, you will receive your live URL (e.g. `https://mala-backend.onrender.com`):

- **Health Check**: `https://mala-backend.onrender.com/api/v1/health`
- **Swagger Documentation**: `https://mala-backend.onrender.com/api/docs`
- **Devotee Registration**: `POST https://mala-backend.onrender.com/api/v1/auth/register`
- **Devotee Login**: `POST https://mala-backend.onrender.com/api/v1/auth/login`

