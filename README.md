# Social Media Crossposter (SMC)

Ek hi jagah se tech content **LinkedIn, Reddit**, aur (roadmap par) Facebook, Instagram, X par publish karo — text + images ke saath.

## Status

**Version:** `1.0.0-rc.1` (Release Candidate — staging deploy)  
See [CHANGELOG.md](CHANGELOG.md) · [Versioning](docs/VERSIONING.md)

| Area | Status |
|------|--------|
| Backend API | Express + TypeScript + Prisma |
| Frontend | React + Vite + MUI |
| LinkedIn | Live — publish, schedule, analytics |
| Reddit | Live — cross-post with LinkedIn |
| Facebook / Instagram / X | Adapters in code; production pending |

## Quick start (local)

```bash
# 1. Database (Postgres on host port 5433)
docker-compose up -d

# 2. Backend
cd backend
cp .env.example .env    # fill secrets
npm install
npm run db:migrate
npm run dev             # http://localhost:3001

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

Health check: `GET http://localhost:3001/api/v1/health`

## Environment variables

| File | Purpose |
|------|---------|
| [backend/.env.example](backend/.env.example) | API, DB, JWT, S3, OAuth, SMTP |
| [frontend/.env.example](frontend/.env.example) | `VITE_API_BASE_URL`, reCAPTCHA |

**Production:** set `VITE_API_BASE_URL=https://<api-host>/api/v1` at Vercel build time.

## Deploy (staging / production)

Full guide: **[docs/DEPLOY.md](docs/DEPLOY.md)**

| Component | Config |
|-----------|--------|
| Backend | [backend/Dockerfile](backend/Dockerfile), [render.yaml](render.yaml) |
| Frontend | [frontend/vercel.json](frontend/vercel.json) |
| CI | [.github/workflows/ci.yml](.github/workflows/ci.yml) |

**OAuth redirect pattern (production):**

```
https://<API_HOST>/api/v1/accounts/{linkedin|reddit|facebook|instagram|twitter}/callback
```

Set `FRONTEND_URL` to your Vercel URL for CORS and post-OAuth redirects.

## Maria QA

Branch: **`testing/maria`**

Checklist: **[docs/MARIA_TEST_CHECKLIST.md](docs/MARIA_TEST_CHECKLIST.md)** (37 cases)

## Documentation

| Doc | Description |
|-----|-------------|
| [DEPLOY.md](docs/DEPLOY.md) | Staging/production deploy steps |
| [LIMITATIONS.md](docs/LIMITATIONS.md) | Known gaps & scope |
| [MARIA_TEST_CHECKLIST.md](docs/MARIA_TEST_CHECKLIST.md) | QA regression |
| [DEVELOPER_DOCUMENTATION.md](docs/DEVELOPER_DOCUMENTATION.md) | Full technical reference |
| [LINKEDIN_SETUP.md](docs/LINKEDIN_SETUP.md) | LinkedIn OAuth |
| [REDDIT_SETUP.md](docs/REDDIT_SETUP.md) | Reddit OAuth |
| [JULY_2026_DEADLINE_PLAN.txt](docs/JULY_2026_DEADLINE_PLAN.txt) | Launch plan |

## Production build

```bash
# Backend
cd backend && npm run build:prod && npm run start:prod

# Frontend
cd frontend && npm run build
# Serve dist/ via Vercel/Netlify
```

## MVP scope

- ✅ Text + image posts
- ✅ LinkedIn + Reddit OAuth & publish
- ✅ Multi-platform cross-post
- ✅ Scheduling + calendar + dashboard
- ✅ AI Assist (bring your own API key)
- ✅ i18n (en, ur, roman-ur, hi)
- ❌ Video (v2.0)
- ❌ Instagram production (Meta review)

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript, MUI, Redux |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma |
| Storage | AWS S3 |
| Auth | JWT (custom) |

---

*July 2026 — Built for software engineers who want efficient multi-platform posting.*
