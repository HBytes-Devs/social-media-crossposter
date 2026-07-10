# Social Media Crossposter (SMC)

Ek hi jagah se apna tech content **LinkedIn, Facebook, Instagram, X (Twitter), aur Reddit** par publish karo — text + images ke saath.

## Status

**Version:** `0.9.0-beta.1` (Beta) — active development  
See [CHANGELOG.md](CHANGELOG.md) and [Versioning guide](docs/VERSIONING.md).

🟢 **Backend** — Express + TypeScript + Prisma  
🟢 **Frontend** — React + Vite + MUI  
🟡 **Platforms** — LinkedIn live; others in progress

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma |
| Queue | BullMQ + Redis |
| Storage | AWS S3 |
| Auth | JWT (custom) |

## Documentation

| File | Description |
|------|-------------|
| [Developer Documentation](docs/DEVELOPER_DOCUMENTATION.md) | Complete technical docs (Roman Urdu) |
| [Roadmap](docs/ROADMAP.md) | Phase-by-phase development plan |
| [Versioning](docs/VERSIONING.md) | Beta → stable release tracking |
| [Changelog](../CHANGELOG.md) | What changed in each release |

## MVP Scope

- ✅ Text + Image posts
- ✅ 5 platforms (LinkedIn, Facebook, Instagram, X, Reddit)
- ✅ Account connection (OAuth)
- ✅ Scheduling
- ✅ Post history
- ❌ Video (v2.0)

## Quick Start (Jab code ready ho)

```bash
# Database + Redis
docker-compose up -d

# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

## Development Order

1. **Backend first** — OAuth + platform APIs
2. **LinkedIn first** — sab se easy aur valuable
3. **Frontend** — jab basic APIs kaam karein

---

*July 2026 — Built for software engineers who want efficient multi-platform posting.*
