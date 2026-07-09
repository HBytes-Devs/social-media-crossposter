# Social Media Crossposter (SMC)

Ek hi jagah se apna tech content **LinkedIn, Facebook, Instagram, X (Twitter), aur Reddit** par publish karo — text + images ke saath.

## Status

🟢 **Backend Setup Done** — Express + TypeScript + Prisma scaffold ready.  
🟡 **Database** — PostgreSQL abhi connect nahi (Docker skip). Baad mein setup karenge.

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
