# SMC Development Roadmap
## Social Media Crossposter — Phase-by-Phase Plan

**Date:** July 2026  
**Stack:** React + Vite + Tailwind | Node.js + Express | PostgreSQL | Redis | AWS S3  
**Language:** Roman Urdu

---

## Overview (Khulasa)

Yeh roadmap **backend-first** approach follow karti hai — pehle integrations stable karo, phir frontend polish karo. Har phase ke end par ek **working milestone** hoga jo test kar sakte ho.

**Total Estimated Time (MVP):** 8–12 weeks (part-time) | 4–6 weeks (full-time)

---

## Phase 0: Project Setup (Week 1)
**Goal:** Development environment ready ho, koi feature nahi — sirf foundation.

### Tasks

| # | Task | Details | Done? |
|---|------|---------|-------|
| 0.1 | Git repo initialize | `social-media-crossposter` repo, `.gitignore` | ☐ |
| 0.2 | Monorepo structure | `backend/` + `frontend/` folders | ☐ |
| 0.3 | Docker Compose | PostgreSQL 15 + Redis 7 | ☐ |
| 0.4 | Backend scaffold | Express + TypeScript + tsconfig | ☐ |
| 0.5 | Prisma setup | Schema file, initial migration | ☐ |
| 0.6 | Frontend scaffold | Vite + React + TypeScript + Tailwind | ☐ |
| 0.7 | ESLint + Prettier | Dono projects mein | ☐ |
| 0.8 | `.env.example` files | Backend aur frontend dono | ☐ |
| 0.9 | Basic health endpoint | `GET /api/v1/health` → `{ status: "ok" }` | ☐ |
| 0.10 | README | Setup instructions | ☐ |

### Milestone
✅ `docker-compose up` + backend `npm run dev` + frontend `npm run dev` — teeno chal rahe hain.

### Commands (Reference)
```bash
# Backend
cd backend && npm init -y
npm install express cors helmet dotenv zod
npm install -D typescript @types/node @types/express ts-node nodemon
npx prisma init

# Frontend
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install && npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## Phase 1: Auth + Database Core (Week 2)
**Goal:** Users register/login kar saken, JWT auth kaam kare.

### Tasks

| # | Task | Details | Done? |
|---|------|---------|-------|
| 1.1 | User model | Prisma migrate | ☐ |
| 1.2 | Register endpoint | `POST /auth/register` — email, password, name | ☐ |
| 1.3 | Login endpoint | `POST /auth/login` → JWT token | ☐ |
| 1.4 | Auth middleware | JWT verify on protected routes | ☐ |
| 1.5 | Password hashing | bcrypt | ☐ |
| 1.6 | Get profile | `GET /auth/me` | ☐ |
| 1.7 | Frontend: Login page | Form + API call + token storage | ☐ |
| 1.8 | Frontend: Register page | Form + redirect to dashboard | ☐ |
| 1.9 | Frontend: Auth guard | Protected routes, redirect if not logged in | ☐ |
| 1.10 | Frontend: Basic layout | Sidebar + header shell | ☐ |

### Milestone
✅ User signup → login → dashboard dikhe (empty). Postman se bhi test ho.

---

## Phase 2: AWS S3 Media Upload (Week 2–3)
**Goal:** Images upload ho S3 par, URLs database mein save hon.

> **Note:** Aap S3 credentials jald share karenge — tab `.env` configure karna.

### Tasks

| # | Task | Details | Done? |
|---|------|---------|-------|
| 2.1 | S3 client config | AWS SDK v3, env vars | ☐ |
| 2.2 | Media model | Prisma migrate | ☐ |
| 2.3 | Upload endpoint | `POST /media/upload` multipart | ☐ |
| 2.4 | Image validation | Type, size (max 10MB), dimensions | ☐ |
| 2.5 | Sharp integration | Auto-resize/compress | ☐ |
| 2.6 | List media | `GET /media` | ☐ |
| 2.7 | Delete media | `DELETE /media/:id` (S3 + DB) | ☐ |
| 2.8 | Frontend: Image uploader | Drag-drop, preview, progress bar | ☐ |
| 2.9 | Frontend: Media library | Uploaded images ki list | ☐ |

### Milestone
✅ Frontend se image upload → S3 URL mile → media library mein dikhe.

### S3 Setup Checklist (Jab credentials milen)
- [ ] Bucket create karo
- [ ] IAM user with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`
- [ ] Bucket CORS policy (agar direct upload chahiye)
- [ ] Public read ya signed URLs decide karo

---

## Phase 3: LinkedIn Integration (Week 3–4) ⭐ PRIORITY
**Goal:** LinkedIn account connect karo aur text + image post publish karo.

### Tasks

| # | Task | Details | Done? |
|---|------|---------|-------|
| 3.1 | LinkedIn Developer App | https://developer.linkedin.com par app banao | ☐ |
| 3.2 | Platform interface | `PlatformAdapter` TypeScript interface | ☐ |
| 3.3 | LinkedIn adapter | OAuth + post + image upload | ☐ |
| 3.4 | Token encryption | AES-256-GCM service | ☐ |
| 3.5 | SocialAccount model | Prisma migrate | ☐ |
| 3.6 | Connect flow | `GET /accounts/linkedin/connect` → OAuth redirect | ☐ |
| 3.7 | Callback handler | `GET /accounts/linkedin/callback` → save encrypted token | ☐ |
| 3.8 | List accounts | `GET /accounts` | ☐ |
| 3.9 | Disconnect | `DELETE /accounts/:id` | ☐ |
| 3.10 | Post model + PostTarget | Prisma migrate | ☐ |
| 3.11 | Create post API | `POST /posts` (draft) | ☐ |
| 3.12 | Publish to LinkedIn | Direct call (queue baad mein) | ☐ |
| 3.13 | PublishLog | Success/failure logging | ☐ |
| 3.14 | Frontend: Connect LinkedIn button | OAuth popup/redirect | ☐ |
| 3.15 | Frontend: Accounts page | Connected accounts list | ☐ |
| 3.16 | Frontend: Basic composer | Text + image select + LinkedIn publish | ☐ |

### Milestone
✅ **Pehla real cross-platform moment:** LinkedIn par post publish ho with image!

### LinkedIn App Setup
1. https://developer.linkedin.com → Create App
2. Products add karo: "Share on LinkedIn", "Sign In with LinkedIn"
3. Redirect URL: `http://localhost:3001/api/v1/accounts/linkedin/callback`
4. Scopes: `openid`, `profile`, `w_member_social`, `r_member_social`

---

## Phase 4: Queue + Scheduling (Week 4–5)
**Goal:** Posts background mein publish hon, schedule support ho.

### Tasks

| # | Task | Details | Done? |
|---|------|---------|-------|
| 4.1 | BullMQ setup | Redis connection, queue config | ☐ |
| 4.2 | Publish worker | Job consume → call platform adapter | ☐ |
| 4.3 | Retry logic | 3 attempts, exponential backoff | ☐ |
| 4.4 | Schedule endpoint | `POST /posts/:id/schedule` | ☐ |
| 4.5 | Scheduler worker | Cron check → due posts ko queue mein daalo | ☐ |
| 4.6 | Post status updates | PUBLISHING → PUBLISHED / PARTIAL / FAILED | ☐ |
| 4.7 | Token refresh job | Expiring tokens auto-refresh | ☐ |
| 4.8 | Frontend: Schedule picker | Date/time selector | ☐ |
| 4.9 | Frontend: Post status badges | Draft, Scheduled, Published, Failed | ☐ |
| 4.10 | Frontend: History page | Past posts with status per platform | ☐ |

### Milestone
✅ Post schedule karo → time par automatically publish ho.

---

## Phase 5: Facebook Integration (Week 5–6)
**Goal:** Facebook Pages par post publish karo.

### Tasks

| # | Task | Details | Done? |
|---|------|---------|-------|
| 5.1 | Meta Developer App | https://developers.facebook.com | ☐ |
| 5.2 | Facebook adapter | Page listing + feed post + photo upload | ☐ |
| 5.3 | OAuth flow | Meta OAuth (shared with Instagram later) | ☐ |
| 5.4 | Page selection | User ko apni pages list dikhao, select kare | ☐ |
| 5.5 | Multi-platform publish | Ek post → LinkedIn + Facebook dono | ☐ |
| 5.6 | Frontend: Platform selector | Checkboxes per connected account | ☐ |
| 5.7 | Frontend: Facebook connect | OAuth button | ☐ |
| 5.8 | Frontend: Page picker | Dropdown for Facebook pages | ☐ |

### Milestone
✅ Ek post LinkedIn + Facebook dono par ek saath publish ho.

---

## Phase 6: X (Twitter) Integration (Week 6–7)
**Goal:** Tweets with images publish karo.

### Tasks

| # | Task | Details | Done? |
|---|------|---------|-------|
| 6.1 | X Developer Account | https://developer.x.com — app create | ☐ |
| 6.2 | Twitter adapter | OAuth 2.0 PKCE + media upload + tweet | ☐ |
| 6.3 | Character limit validation | 280 chars warning in composer | ☐ |
| 6.4 | Content transformer | Auto-truncate ya warning for X | ☐ |
| 6.5 | Frontend: Character counter | Per-platform limits dikhao | ☐ |
| 6.6 | Frontend: X connect button | OAuth flow | ☐ |

### Milestone
✅ 3 platforms: LinkedIn + Facebook + X — ek click se teen jagah post.

---

## Phase 7: Instagram Integration (Week 7–8)
**Goal:** Instagram Business account par image post publish karo.

### Tasks

| # | Task | Details | Done? |
|---|------|---------|-------|
| 7.1 | Instagram permissions | `instagram_content_publish` scope | ☐ |
| 7.2 | Instagram adapter | 2-step: container → publish | ☐ |
| 7.3 | Image aspect ratio check | IG requirements (4:5 to 1.91:1) | ☐ |
| 7.4 | Auto-crop/resize | Sharp se IG-compatible image | ☐ |
| 7.5 | Rate limit handling | 25 posts/24h tracking | ☐ |
| 7.6 | Frontend: IG preview | Square/vertical preview | ☐ |
| 7.7 | Meta App Review | Production ke liye submit karo | ☐ |

### Milestone
✅ Instagram par image + caption post ho.

> **Warning:** Instagram ke liye Meta App Review lagta hai production mein. Development mein test users se kaam chalega.

---

## Phase 8: Reddit Integration (Week 8–9)
**Goal:** Subreddit mein text + image post submit karo.

### Tasks

| # | Task | Details | Done? |
|---|------|---------|-------|
| 8.1 | Reddit app | https://www.reddit.com/prefs/apps | ☐ |
| 8.2 | Reddit adapter | OAuth + submit + media upload | ☐ |
| 8.3 | Subreddit selector | UI mein subreddit name input | ☐ |
| 8.4 | Title field | Reddit ke liye required title | ☐ |
| 8.5 | Custom content per platform | PostTarget.customContent support | ☐ |
| 8.6 | Frontend: Reddit-specific fields | Title + subreddit inputs | ☐ |
| 8.7 | Frontend: Per-platform preview | Different preview per platform | ☐ |

### Milestone
✅ **MVP Complete:** 5 platforms par post publish ho sakta hai!

---

## Phase 9: Polish + Analytics (Week 9–10)
**Goal:** MVP ko production-ready banao.

### Tasks

| # | Task | Details | Done? |
|---|------|---------|-------|
| 9.1 | Basic analytics | Pull likes/comments jahan API allow kare | ☐ |
| 9.2 | Dashboard stats | Total posts, success rate, connected accounts | ☐ |
| 9.3 | Error notifications | Failed posts ki detail UI mein | ☐ |
| 9.4 | Post retry button | Failed platform par manually retry | ☐ |
| 9.5 | Rate limiting | API rate limits | ☐ |
| 9.6 | Input validation | Zod schemas everywhere | ☐ |
| 9.7 | Loading states | Skeleton loaders, spinners | ☐ |
| 9.8 | Responsive design | Mobile-friendly UI | ☐ |
| 9.9 | Dark mode (optional) | Tailwind dark: classes | ☐ |
| 9.10 | API error handling | User-friendly error messages | ☐ |

### Milestone
✅ App polished hai, daily use ke liye ready.

---

## Phase 10: Deployment (Week 10–11)
**Goal:** Production mein live ho.

### Tasks

| # | Task | Details | Done? |
|---|------|---------|-------|
| 10.1 | GitHub Actions CI | Lint + test on push | ☐ |
| 10.2 | Backend deploy | Railway / Render | ☐ |
| 10.3 | Frontend deploy | Vercel / Netlify | ☐ |
| 10.4 | Production DB | Managed PostgreSQL | ☐ |
| 10.5 | Production Redis | Managed Redis | ☐ |
| 10.6 | OAuth redirect URIs | Production URLs update | ☐ |
| 10.7 | S3 production bucket | Separate from dev | ☐ |
| 10.8 | Domain + HTTPS | Custom domain setup | ☐ |
| 10.9 | Sentry / error monitoring | Error tracking | ☐ |
| 10.10 | Platform app reviews | Meta, LinkedIn production approval | ☐ |

### Milestone
✅ **Live URL** par app accessible hai!

---

## Visual Timeline

```
Week 1    ████ Phase 0: Setup
Week 2    ████ Phase 1: Auth
Week 2-3  ████ Phase 2: S3 Media
Week 3-4  ████████ Phase 3: LinkedIn ⭐
Week 4-5  ████ Phase 4: Queue/Schedule
Week 5-6  ████ Phase 5: Facebook
Week 6-7  ████ Phase 6: X/Twitter
Week 7-8  ████ Phase 7: Instagram
Week 8-9  ████ Phase 8: Reddit
Week 9-10 ████ Phase 9: Polish
Week 10-11████ Phase 10: Deploy
          ─────────────────────────────
          MVP LAUNCH 🚀
```

---

## Kya Pehle Karna Hai? (Action Items Abhi)

Agar aaj se start karna hai, yeh order follow karo:

### Step 1 — Aaj (Phase 0)
1. Project folders banao (`backend/`, `frontend/`, `docs/`)
2. Docker Compose chalao
3. Backend + Frontend scaffold karo
4. Health endpoint test karo

### Step 2 — Is Hafte (Phase 1 + 2)
1. Auth system complete karo
2. S3 credentials milte hi media upload implement karo

### Step 3 — Agle Hafte (Phase 3) ⭐
1. LinkedIn Developer App banao
2. LinkedIn OAuth + posting implement karo
3. **Pehla real post LinkedIn par karo!**

---

## Future Versions (MVP ke Baad)

### v1.1 (Month 3)
- [ ] Platform-specific content editor (har platform ke liye alag text)
- [ ] AI content suggestions (Claude/GPT API)
- [ ] Post templates (tech tip, project launch, etc.)
- [ ] Bulk scheduling (calendar view)

### v1.2 (Month 4)
- [ ] Threads (Meta) integration
- [ ] Bluesky / Mastodon
- [ ] Team workspaces (multiple users)
- [ ] Discord webhook posting

### v2.0 (Month 5–6)
- [ ] Video support (YouTube, TikTok)
- [ ] Advanced analytics dashboard
- [ ] A/B testing per platform
- [ ] SaaS billing (Stripe)
- [ ] Self-hosted Docker image

---

## Risk Register (Ahem Khatray)

| Risk | Impact | Solution |
|------|--------|----------|
| Meta App Review reject | Instagram/Facebook block | Pehle LinkedIn + X se start, Meta baad mein |
| X API pricing changes | Cost badh sakta hai | Free tier limits check karo, alternatives rakho |
| Token expiry | Posts fail honge | Auto-refresh + user notification |
| Reddit spam ban | Account suspend | Rate limits, genuine content, subreddit rules follow |
| S3 costs | Storage badh sakta hai | Image compression, lifecycle policies |
| Platform API changes | Integration toot sakti hai | Adapter pattern se isolate rakho |

---

## Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Platforms connected | 3+ (LinkedIn, Facebook, X minimum) |
| Post success rate | > 95% |
| Publish time | < 30 seconds (all platforms) |
| Scheduled post accuracy | ± 1 minute |
| Uptime | > 99% |

---

*Roadmap version 1.0 — July 2026*  
*Developer Documentation: `DEVELOPER_DOCUMENTATION.md`*
