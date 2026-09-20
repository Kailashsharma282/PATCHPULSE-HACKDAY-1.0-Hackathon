# 🚀 PATCHPULSE — Production Deployment Guide
**Hackday 1.0 — Tech for a Better Tomorrow**  
**Participant:** Pochiraju Kailash Ram Markandeya Sharma  
**Team:** `kailashsharma8`  

---

## 🏗️ Architecture Overview

| Component | Platform | Tech Stack | Notes |
| :--- | :--- | :--- | :--- |
| **Backend API** | **Render** | NestJS (Node 20), Prisma ORM | Auto-deploys via `render.yaml` |
| **Database** | **Neon DB** | Serverless PostgreSQL 16 | High availability, connection pooling |
| **Frontend Web** | **Vercel** | React 18, Vite, Tailwind CSS | Monorepo SPA with edge CDN & proxy |
| **CI / CD** | **GitHub Actions** | Ubuntu, Node 20 | Automated linting, test suites, E2E validation |

---

## 1. Setup Neon PostgreSQL Database

1. Sign in or sign up at [Neon.tech](https://neon.tech).
2. Click **Create Project**:
   - **Project name**: `patchpulse-prod`
   - **Postgres version**: `16` (Default)
   - **Region**: Choose the closest region to your Render deployment (e.g., `US East (Ohio)` or `AWS Oregon`).
3. In the Neon Dashboard, copy the **Connection string**:
   ```
   postgresql://neondb_owner:YOUR_PASSWORD@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   *(Keep this string handy for Render configuration)*.

---

## 2. Deploy Backend API to Render

### Option A: Using Render Blueprint (Recommended)
1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect your repository: `https://github.com/Kailashsharma282/PATCHPULSE-HACKDAY-1.0-Hackathon`.
4. Render will detect `render.yaml` automatically.
5. In the Environment Variables prompt:
   - Paste your Neon connection string into `DATABASE_URL`.
   - Set `JWT_SECRET` (or leave empty to let Render auto-generate a 32-byte secret).
6. Click **Apply**. Render will run:
   - `node scripts/prepare-prisma.js` (detects PostgreSQL)
   - `npx prisma generate`
   - `npx prisma db push --accept-data-loss` (creates tables in Neon)
   - `npm run db:seed` (seeds flagship issue #P-024 and demo accounts)
   - `npm --workspace=apps/api run build`
7. When deployed, note your service URL:  
   `https://patchpulse-api.onrender.com`

### Option B: Manual Web Service Setup on Render
- **Name**: `patchpulse-api`
- **Runtime**: `Node`
- **Build Command**: `npm run render:build`
- **Start Command**: `npm run render:start`
- **Health Check Path**: `/api/health`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `PORT`: `10000`
  - `DATABASE_URL`: *(Your Neon PostgreSQL URL)*
  - `JWT_SECRET`: `patchpulse_production_jwt_secret_key_2026_super_secure_token`
  - `AI_MODE`: `mock`

---

## 3. Deploy Frontend to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository: `PATCHPULSE-HACKDAY-1.0-Hackathon`.
4. Vercel automatically detects `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build:web`
   - **Output Directory**: `apps/web/dist`
5. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://patchpulse-api.onrender.com` *(your live Render backend URL)*
6. Click **Deploy**.
7. Your app is live at: `https://patchpulse-hackday-1-0-hackathon.vercel.app` (or custom domain).

---

## 4. Environment Variables Reference

### Backend (Render)
```env
NODE_ENV="production"
PORT=10000
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="YOUR_RANDOM_SECURE_KEY"
JWT_EXPIRES_IN="7d"
AI_MODE="mock"
# Optional (if switching to OpenAI live models):
# OPENAI_API_KEY="sk-..."
# OPENAI_MODEL="gpt-4o"
```

### Frontend (Vercel)
```env
VITE_API_URL="https://patchpulse-api.onrender.com"
```

---

## 5. Post-Deployment Verification

Verify all systems are operational:

1. **Backend Health Diagnostic**:
   ```bash
   curl https://patchpulse-api.onrender.com/api/health
   ```
   *Expected Response:*
   ```json
   {
     "status": "UP",
     "services": {
       "api": { "status": "HEALTHY", "version": "1.0.0" },
       "database": { "status": "CONNECTED", "type": "SQLite/PostgreSQL (Prisma ORM)" },
       "aiEngine": { "status": "OPERATIONAL", "mode": "MOCK_DETERMINISTIC_HIGH_PRECISION" }
     }
   }
   ```

2. **Simulation & Seed Verification**:
   ```bash
   curl https://patchpulse-api.onrender.com/api/demo/state
   ```
   *Should return 200 with step 1 of 13 and Issue #P-024 data.*

3. **Frontend Access**:
   - Open your Vercel URL in your browser.
   - Test login with:
     - Admin: `admin@patchpulse.demo` / `Pass@12345`
     - Operator: `operator@patchpulse.demo` / `Pass@12345`
     - Citizen: `citizen@patchpulse.demo` / `Pass@12345`
   - Test 13-step interactive simulation flow at `/demo`.
