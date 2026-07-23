# SMC Deployment Guide

Step-by-step guide for staging and production. Target stack:

| Component | Recommended host |
|-----------|------------------|
| Backend API | Render, Railway, or Fly.io |
| Frontend SPA | Vercel or Netlify |
| PostgreSQL | Managed DB (Render Postgres, Neon, Supabase, RDS) |
| Media storage | AWS S3 (separate bucket for staging vs production) |

Full env reference: `backend/.env.example`, `frontend/.env.example`.

Contabo VPS (Docker, IP-first): [CONTABO_DOCKER.md](CONTABO_DOCKER.md)

---

## Prerequisites

1. GitHub repo pushed (`master` or `testing/maria`)
2. AWS S3 bucket with public read for uploaded images (or CloudFront)
3. OAuth apps for LinkedIn + Reddit (minimum for July launch)
4. Optional: reCAPTCHA v3 keys for login/forgot-password
5. Optional: SMTP for password reset emails

---

## 1. PostgreSQL

Create a managed PostgreSQL 15+ database. Copy the connection string:

```
DATABASE_URL=postgresql://user:pass@host:5432/smc_db?sslmode=require
```

Migrations run automatically on container start (`prisma migrate deploy` in Dockerfile / `start:prod`).

Local dev (Docker):

```bash
docker-compose up -d
# Uses port 5433 on host — see docker-compose.yml
```

---

## 2. Backend deploy (Render example)

### Option A — Blueprint (`render.yaml`)

1. Render Dashboard → **New** → **Blueprint**
2. Connect repo, select `render.yaml`
3. Fill secret env vars (LinkedIn, Reddit, S3, `API_BASE_URL`, `FRONTEND_URL`)
4. Deploy

### Option B — Docker Web Service

1. **New Web Service** → connect repo
2. **Root directory:** `backend`
3. **Runtime:** Docker (uses `backend/Dockerfile`)
4. **Health check path:** `/api/v1/health`
5. Set environment variables (see table below)

### Option C — Node without Docker

Build command:

```bash
npm ci && npm run build:prod
```

Start command:

```bash
npm run start:prod
```

### Required backend env (production)

| Variable | Example | Notes |
|----------|---------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `3001` | Host may inject `PORT` — ensure `env.ts` reads it |
| `API_BASE_URL` | `https://smc-api.onrender.com` | Public URL, no trailing slash |
| `FRONTEND_URL` | `https://smc.vercel.app` | Exact origin for CORS |
| `DATABASE_URL` | `postgresql://...` | From managed Postgres |
| `JWT_SECRET` | 32+ random chars | **Rotate for prod** |
| `TOKEN_ENCRYPTION_KEY` | 32+ random chars | **Rotate for prod** |
| `AWS_*` | S3 credentials | Required for image posts |
| `LINKEDIN_*` | OAuth + redirect | See OAuth section |
| `REDDIT_*` | OAuth + redirect | See OAuth section |

After deploy, verify:

```bash
curl https://<API_HOST>/api/v1/health
# status: "ok", database: "connected"
```

---

## 3. Frontend deploy (GitHub Pages) — recommended

**Live URL:** `https://haseebcodejourney.github.io/social-media-crossposter/`

Workflow: `.github/workflows/pages.yml` — auto-deploy on `master` push when `frontend/` changes.

### One-time GitHub setup

1. Repo → **Settings** → **Pages**
2. **Source:** GitHub Actions (not “Deploy from branch”)
3. **Settings** → **Secrets and variables** → **Actions** → **Variables**:
   - `VITE_API_BASE_URL` = `https://<API_HOST>/api/v1` (your Render/Railway backend)
   - `VITE_RECAPTCHA_SITE_KEY` = optional

4. Backend `FRONTEND_URL` must match Pages origin (CORS):

```
FRONTEND_URL=https://haseebcodejourney.github.io
```

GitHub Pages project sites use path `/social-media-crossposter/` — Vite `base` and React Router `basename` are set automatically in CI.

### Manual local build (test before push)

```bash
cd frontend
VITE_API_BASE_URL=https://<API_HOST>/api/v1 npm run build:pages
npx vite preview --base /social-media-crossposter/
```

### Notes

- GitHub Pages is **static only** — backend must be hosted separately (Render, etc.)
- `404.html` copy enables SPA refresh on deep links (`/posts`, `/compose`, etc.)
- reCAPTCHA admin mein domain add karo: `haseebcodejourney.github.io`

---

## 4. Frontend deploy (Vercel) — alternative

1. Import GitHub repo in Vercel
2. **Root directory:** `frontend`
3. **Framework:** Vite (auto-detected)
4. **Build env:**

```
VITE_API_BASE_URL=https://<API_HOST>/api/v1
VITE_RECAPTCHA_SITE_KEY=<your-site-key>
```

5. Deploy — `vercel.json` handles SPA routing (`/* → index.html`)

Preview URL works immediately; add domain in Vercel settings for production.

---

## 5. OAuth redirect URLs (production)

Register these in each platform developer console (`API_BASE_URL` = your backend host):

| Platform | Redirect URI |
|----------|--------------|
| LinkedIn | `https://<API_HOST>/api/v1/accounts/linkedin/callback` |
| Reddit | `https://<API_HOST>/api/v1/accounts/reddit/callback` |
| Facebook | `https://<API_HOST>/api/v1/accounts/facebook/callback` |
| Instagram | `https://<API_HOST>/api/v1/accounts/instagram/callback` |
| X/Twitter | `https://<API_HOST>/api/v1/accounts/twitter/callback` |

Set matching env vars:

```
LINKEDIN_REDIRECT_URI=https://<API_HOST>/api/v1/accounts/linkedin/callback
REDDIT_REDIRECT_URI=https://<API_HOST>/api/v1/accounts/reddit/callback
```

After OAuth, users redirect to:

```
https://<FRONTEND_HOST>/accounts?connected=linkedin
```

**Important:** Update `FRONTEND_URL` and all redirect URIs when changing domains. Users must **reconnect** accounts after domain change.

Platform setup guides:

- [LinkedIn](LINKEDIN_SETUP.md)
- [Reddit](REDDIT_SETUP.md)
- [Instagram / Meta](INSTAGRAM_SETUP.md)
- [LinkedIn Analytics](LINKEDIN_ANALYTICS_SETUP.md)

---

## 6. AWS S3

1. Create bucket (e.g. `smc-staging-media`)
2. IAM user with `s3:PutObject`, `s3:GetObject` on bucket
3. Configure public read for object URLs (or CloudFront)
4. Set CORS if browser uploads directly (SMC uploads via backend)

```
AWS_REGION=eu-north-1
AWS_S3_BUCKET=smc-staging-media
AWS_S3_PUBLIC_URL=https://smc-staging-media.s3.eu-north-1.amazonaws.com
AWS_S3_ROOT_PREFIX=smc
```

---

## 7. reCAPTCHA (optional but recommended)

1. Create reCAPTCHA v3 keys at https://www.google.com/recaptcha/admin
2. Add domains: `localhost`, staging URL, production URL
3. Backend: `RECAPTCHA_SECRET_KEY`
4. Frontend: `VITE_RECAPTCHA_SITE_KEY`

---

## 8. SMTP (password reset)

If unset, forgot-password may fail silently or skip email. Gmail example:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASS=<app-password>
SMTP_FROM="SMC <you@gmail.com>"
```

---

## 9. Post-deploy smoke test

```text
1. Open frontend URL → Register / Login
2. Accounts → Connect LinkedIn → success message
3. Accounts → Connect Reddit (if configured)
4. Compose → text post → Publish → Posts / Published
5. Compose → image post → Publish
6. Schedule post → Posts / Scheduled (exactly ONE entry)
7. Dashboard → counts + LinkedIn analytics card
8. Calendar → scheduled post visible
9. Settings → profile name + AI key → Compose AI Assist
```

Full QA: [MARIA_TEST_CHECKLIST.md](MARIA_TEST_CHECKLIST.md)

---

## 10. CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push to `master` / `testing/maria`:

- Backend: `npm ci` → `prisma generate` → `tsc` → `build`
- Frontend: `npm ci` → `vite build`

---

## 11. Version tags

Staging RC:

```bash
git tag v1.0.0-rc.1
git push origin v1.0.0-rc.1
```

Stable launch:

```bash
git tag v1.0.0
git push origin v1.0.0
```

See [VERSIONING.md](VERSIONING.md).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error | `FRONTEND_URL` must exactly match browser origin |
| OAuth redirect mismatch | Redirect URI in portal must match `*_REDIRECT_URI` env |
| Health 503 | DB down or `DATABASE_URL` wrong; check SSL mode |
| Image upload 503 | Missing AWS env vars |
| Analytics empty | LinkedIn Community Management API + scope not approved |
| SPA 404 on refresh | Ensure `vercel.json` rewrites exist |

Known product limits: [LIMITATIONS.md](LIMITATIONS.md)
