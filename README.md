# Social Media Crossposter (SMC)

**Maintained by [HBytes Devs](https://github.com/HBytes-Devs)** — compose once, publish to LinkedIn, Reddit, and more from a single dashboard.

| | |
|---|---|
| **Repository** | [HBytes-Devs/social-media-crossposter](https://github.com/HBytes-Devs/social-media-crossposter) |
| **Discussions** | [Q&A, ideas, announcements](https://github.com/HBytes-Devs/social-media-crossposter/discussions) |
| **Contributing** | [CONTRIBUTING.md](CONTRIBUTING.md) |
| **Contact** | [haseebcodejourney@gmail.com](mailto:haseebcodejourney@gmail.com) |

---

## Overview

Social Media Crossposter lets you write a post once and publish it to multiple platforms with text and images. Scheduling, analytics, AI-assisted writing, and billing tiers are built in.

**Version:** `1.0.0-rc.1` (Release Candidate)

| Area | Status |
|------|--------|
| Backend API | Express + TypeScript + Prisma |
| Frontend | React + Vite + MUI |
| LinkedIn | Live — publish, schedule, analytics |
| Reddit | Live — cross-post with LinkedIn |
| Facebook / Instagram / X | Adapters in code; production pending |

---

## Prerequisites

Install these before you begin:

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | 22.x (LTS) | Backend & frontend |
| [npm](https://www.npmjs.com/) | 10+ | Package manager |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest | PostgreSQL & Redis |
| [Git](https://git-scm.com/) | Latest | Clone the repository |

Optional for full features:

- AWS S3 credentials (media uploads)
- LinkedIn / Reddit OAuth apps (platform publishing)
- Google reCAPTCHA v3 keys (login & registration)
- SMTP credentials (password reset emails)

---

## Clone the repository

```bash
git clone https://github.com/HBytes-Devs/social-media-crossposter.git
cd social-media-crossposter
```

If you already cloned from the old personal URL, update your remote:

```bash
git remote set-url origin https://github.com/HBytes-Devs/social-media-crossposter.git
```

---

## Local setup

### 1. Start the database

From the project root:

```bash
docker compose up -d
```

This starts:

- **PostgreSQL** on `localhost:5433` (user `smc`, password `password`, database `smc_db`)
- **Redis** on `localhost:6379`

Verify containers are running:

```bash
docker compose ps
```

### 2. Configure and run the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set at minimum:

- `JWT_SECRET` — long random string (32+ characters)
- `TOKEN_ENCRYPTION_KEY` — 32-byte hex key
- `RECAPTCHA_SECRET_KEY` — if testing login in the browser
- OAuth / S3 / SMTP keys as needed (see [backend/.env.example](backend/.env.example))

Install dependencies, run migrations, and start the API:

```bash
npm install
npm run db:migrate
npm run dev
```

The API runs at **http://localhost:3001**.

Health check:

```bash
curl http://localhost:3001/api/v1/health
```

### 3. Configure and run the frontend

Open a **new terminal** from the project root:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app runs at **http://localhost:5173**.

The default `VITE_API_BASE_URL=/api/v1` uses the Vite dev proxy to the backend — no change needed for local development.

### 4. Sign in

Use the team demo account (must already exist in your database):

| Field | Value |
|-------|-------|
| **Email** | `haseebcodejourney@gmail.com` |
| **Password** | Ask the project maintainer at [haseebcodejourney@gmail.com](mailto:haseebcodejourney@gmail.com) |

Open **http://localhost:5173**, sign in, then connect platforms under **Accounts**.

If the account does not exist yet, register via the UI or ask a maintainer to provision access.

---

## Common commands

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload |
| `npm run build` | TypeScript compile |
| `npm run test` | Run unit tests |
| `npm run lint` | Type-check |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build (`tsc` + Vite) |
| `npm run test` | Run unit tests |
| `npm run lint` | Lint with oxlint |
| `npm run preview` | Preview production build locally |

### Docker (project root)

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start Postgres + Redis |
| `docker compose down` | Stop containers |
| `docker compose logs -f` | Stream container logs |

---

## Environment variables

| File | Purpose |
|------|---------|
| [backend/.env.example](backend/.env.example) | API, database, JWT, S3, OAuth, SMTP, Stripe, AI |
| [frontend/.env.example](frontend/.env.example) | API URL, reCAPTCHA site key, base path |

Never commit `.env` files. Secrets stay on your machine or in your hosting provider.

---

## Project structure

```
social-media-crossposter/
├── backend/          # Express API, Prisma, platform adapters
├── frontend/         # React SPA (Vite + MUI)
├── docs/             # Setup guides, deploy, QA checklists
├── .github/          # CI/CD workflows, issue templates
└── docker-compose.yml
```

---

## Deployment

See **[docs/DEPLOY.md](docs/DEPLOY.md)** for staging and production.

| Component | Config |
|-----------|--------|
| Backend | [backend/Dockerfile](backend/Dockerfile), [render.yaml](render.yaml) |
| Frontend (GitHub Pages) | [.github/workflows/pages.yml](.github/workflows/pages.yml) |
| Frontend (Vercel) | [frontend/vercel.json](frontend/vercel.json) |
| CI | [.github/workflows/ci.yml](.github/workflows/ci.yml) |

Set GitHub repository variables for Pages builds:

- `VITE_API_BASE_URL` — e.g. `https://your-api.onrender.com/api/v1`
- `VITE_RECAPTCHA_SITE_KEY` — reCAPTCHA site key

---

## Documentation

| Document | Description |
|----------|-------------|
| [DEPLOY.md](docs/DEPLOY.md) | Staging & production deploy |
| [DEVELOPER_DOCUMENTATION.md](docs/DEVELOPER_DOCUMENTATION.md) | Full technical reference |
| [LINKEDIN_SETUP.md](docs/LINKEDIN_SETUP.md) | LinkedIn OAuth |
| [REDDIT_SETUP.md](docs/REDDIT_SETUP.md) | Reddit OAuth |
| [LIMITATIONS.md](docs/LIMITATIONS.md) | Known gaps & scope |
| [MARIA_TEST_CHECKLIST.md](docs/MARIA_TEST_CHECKLIST.md) | QA regression checklist |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

---

## Features (MVP)

- Text and image posts
- LinkedIn and Reddit OAuth and publishing
- Multi-platform cross-posting
- Scheduling, calendar, and dashboard
- AI Assist (bring your own API key)
- Internationalization (English, Urdu, Roman Urdu, Hindi)
- Subscription billing (Stripe)

**Planned for later:** video posts, Instagram production (Meta review)

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript, MUI, Redux |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma |
| Storage | AWS S3 |
| Auth | JWT |

---

## Getting help

- **Questions & ideas** → [GitHub Discussions](https://github.com/HBytes-Devs/social-media-crossposter/discussions)
- **Bugs & tasks** → [GitHub Issues](https://github.com/HBytes-Devs/social-media-crossposter/issues)
- **Email** → [haseebcodejourney@gmail.com](mailto:haseebcodejourney@gmail.com)

---

*Built by HBytes Devs for engineers who want efficient multi-platform posting.*
