# Social Media Crossposter (SMC)
## Developer Documentation — Version 1.0 (MVP)

**Date:** July 2026  
**Scope:** Text + Images (Videos baad mein)  
**Language:** Roman Urdu (developer ke liye)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Aapka Tech Stack](#2-aapka-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [Platform Integration Guide](#5-platform-integration-guide)
6. [API Design](#6-api-design)
7. [Folder Structure](#7-folder-structure)
8. [Unified Post Flow](#8-unified-post-flow)
9. [Media Handling (AWS S3)](#9-media-handling-aws-s3)
10. [Security & Best Practices](#10-security--best-practices)
11. [Environment Variables](#11-environment-variables)
12. [Development Setup](#12-development-setup)
13. [Testing Strategy](#13-testing-strategy)
14. [Deployment](#14-deployment)

---

## 1. Project Overview

### Goal (Maqsad)

Ek **self-hosted** ya **SaaS** application banana jo software engineers aur tech content creators ko **ek hi interface** se apna post (text + images) **multiple social media platforms** par publish karne de.

### MVP Scope (Pehla Version)

| Feature | Included? |
|---------|-----------|
| Text posts | ✅ Haan |
| Single / Multiple images | ✅ Haan |
| Video posts | ❌ Nahi (v2.0 mein) |
| Account connection (OAuth) | ✅ Haan |
| Post creation & editing | ✅ Haan |
| Scheduling | ✅ Haan |
| Post history | ✅ Haan |
| Basic analytics | ✅ Haan (likes, views jahan API allow kare) |

### Target Platforms (Priority Order)

| Priority | Platform | MVP Phase | Notes |
|----------|----------|-----------|-------|
| 1 | **LinkedIn** | Phase 1 | Tech audience ke liye best — pehle yeh implement karo |
| 2 | **Facebook** (Pages) | Phase 1 | Graph API straightforward hai |
| 3 | **X (Twitter)** | Phase 2 | Media upload + tweet API |
| 4 | **Instagram** (Business/Creator) | Phase 2 | Meta app review + 2-step publish |
| 5 | **Reddit** | Phase 3 | Subreddit rules ka khayal rakho |

### Design Principles

- **Platform Abstraction** — Ek unified `Post` model, har platform ke liye alag adapter
- **Event-Driven** — BullMQ + Redis se async posting, retry, aur failure handling
- **Security First** — Encrypted tokens, minimal OAuth scopes, rate limiting
- **Extensibility** — Naya platform add karna easy ho (interface + adapter pattern)

---

## 2. Aapka Tech Stack

Aap ne yeh stack choose kiya hai — documentation isi ke mutabiq hai:

### Frontend
| Tool | Version | Kaam |
|------|---------|------|
| **React** | 18+ | UI components |
| **Vite** | 5+ | Fast dev server & build |
| **TypeScript** | 5+ | Type safety |
| **Tailwind CSS** | 3+ | Styling |
| **shadcn/ui** | Latest | Ready-made UI components (optional lekin recommended) |
| **React Router** | 6+ | Client-side routing |
| **TanStack Query** | 5+ | API data fetching & caching |
| **Zustand** | 4+ | Lightweight state management |

### Backend
| Tool | Version | Kaam |
|------|---------|------|
| **Node.js** | 20 LTS | Runtime |
| **Express** | 4+ | HTTP API (NestJS optional, lekin Express MVP ke liye faster) |
| **TypeScript** | 5+ | Type safety |
| **Prisma** | 5+ | ORM |
| **PostgreSQL** | 15+ | Main database |
| **BullMQ** | 5+ | Job queue (scheduling + posting) |
| **Redis** | 7+ | Queue backend |
| **Sharp** | Latest | Image resize/optimize |
| **AWS SDK v3** | Latest | S3 uploads |

### Storage
| Tool | Kaam |
|------|------|
| **AWS S3** | Image storage (aap credentials share karenge) |

### Auth (Choose One)
| Option | Recommendation |
|--------|----------------|
| **Clerk** | Fastest MVP — recommended |
| **NextAuth** | Agar custom auth chahiye |
| **Custom JWT** | Full control, zyada kaam |

### DevOps
| Tool | Kaam |
|------|------|
| **Docker + Docker Compose** | Local Postgres + Redis |
| **GitHub Actions** | CI/CD |
| **Railway / Render / VPS** | Hosting |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Dashboard│ │ Composer │ │ Accounts │ │ History/Stats│   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API (HTTPS)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js + Express)                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    API Layer                         │    │
│  │  /auth  /accounts  /posts  /media  /analytics       │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Services Layer                      │    │
│  │  AuthService │ PostService │ SchedulerService       │    │
│  │  MediaService │ PlatformService (adapters)          │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Queue (BullMQ + Redis)                    │    │
│  │  publish-post │ refresh-token │ fetch-analytics      │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────┬──────────────────────┬───────────────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐    ┌────────────────────────────────────┐
│   PostgreSQL     │    │         External Platform APIs      │
│   (Prisma ORM)   │    │  LinkedIn │ Meta │ X │ Reddit      │
└──────────────────┘    └────────────────────────────────────┘
           │
           ▼
┌──────────────────┐
│    AWS S3        │
│  (Image Storage) │
└──────────────────┘
```

### Platform Adapter Pattern

Har platform ke liye ek adapter class jo same interface follow kare:

```typescript
interface PlatformAdapter {
  platform: Platform;
  
  // OAuth
  getAuthUrl(state: string): string;
  handleCallback(code: string): Promise<TokenResult>;
  refreshToken(account: SocialAccount): Promise<TokenResult>;
  
  // Posting
  publishPost(post: UnifiedPost, account: SocialAccount): Promise<PublishResult>;
  
  // Optional
  getAnalytics?(postId: string, account: SocialAccount): Promise<Analytics>;
  
  // Validation
  validateContent(post: UnifiedPost): ValidationResult;
  getLimits(): PlatformLimits;
}
```

Implementations:
- `LinkedInAdapter`
- `FacebookAdapter`
- `InstagramAdapter` (Meta shared auth)
- `TwitterAdapter`
- `RedditAdapter`

---

## 4. Database Schema

### Prisma Schema (`backend/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  avatarUrl String?
  accounts  SocialAccount[]
  posts     Post[]
  media     Media[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SocialAccount {
  id           String    @id @default(cuid())
  userId       String
  platform     Platform
  accountId    String    // Platform-specific user/page ID
  accountName  String?   // Display name (page name, username)
  accessToken  String    // AES-256 encrypted
  refreshToken String?   // AES-256 encrypted
  expiresAt    DateTime?
  scopes       String[]  // Granted OAuth scopes
  metadata     Json?     // Extra platform data
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  publishLogs  PublishLog[]

  @@unique([userId, platform, accountId])
  @@index([userId])
}

model Post {
  id           String      @id @default(cuid())
  userId       String
  content      String      // Unified text content
  title        String?     // Reddit ke liye required
  images       String[]    // S3 URLs
  scheduledFor DateTime?
  publishedAt  DateTime?
  status       PostStatus  @default(DRAFT)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  targets      PostTarget[]
  publishLogs  PublishLog[]

  @@index([userId, status])
  @@index([scheduledFor])
}

model PostTarget {
  id              String        @id @default(cuid())
  postId          String
  socialAccountId String
  platform        Platform
  customContent   String?       // Platform-specific text override
  subreddit       String?       // Reddit only
  status          PublishStatus @default(PENDING)
  platformPostId  String?       // ID returned by platform after publish
  errorMessage    String?
  publishedAt     DateTime?

  post            Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  socialAccount   SocialAccount @relation(fields: [socialAccountId], references: [id])

  @@unique([postId, socialAccountId])
}

model PublishLog {
  id              String   @id @default(cuid())
  postId          String
  socialAccountId String
  action          String   // PUBLISH, RETRY, REFRESH_TOKEN
  status          String   // SUCCESS, FAILED
  requestPayload  Json?
  responsePayload Json?
  errorMessage    String?
  createdAt       DateTime @default(now())

  post            Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  socialAccount   SocialAccount @relation(fields: [socialAccountId], references: [id])
}

model Media {
  id        String   @id @default(cuid())
  userId    String
  s3Key     String   @unique
  s3Url     String
  fileName  String
  mimeType  String
  sizeBytes Int
  width     Int?
  height    Int?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

enum Platform {
  LINKEDIN
  FACEBOOK
  INSTAGRAM
  TWITTER
  REDDIT
}

enum PostStatus {
  DRAFT
  SCHEDULED
  PUBLISHING
  PUBLISHED
  FAILED
  PARTIAL
}

enum PublishStatus {
  PENDING
  PUBLISHING
  SUCCESS
  FAILED
  SKIPPED
}
```

### Key Design Decisions

- **`PostTarget`** — Har post ke liye alag row per platform/account; partial success handle karna easy
- **`PublishLog`** — Debugging aur audit trail ke liye
- **`Media`** — S3 files track karna, duplicate uploads avoid karna
- **Encrypted tokens** — `accessToken` aur `refreshToken` database mein encrypted store honge

---

## 5. Platform Integration Guide

### 5.1 LinkedIn (Priority #1)

| Item | Detail |
|------|--------|
| **API** | LinkedIn Marketing API — Posts API |
| **Auth** | OAuth 2.0 (3-legged) |
| **Scopes** | `openid`, `profile`, `w_member_social`, `r_member_social` |
| **Post Endpoint** | `POST https://api.linkedin.com/rest/posts` |
| **Image Upload** | `POST /rest/images?action=initializeUpload` → upload → use URN in post |
| **Text Limit** | ~3000 characters |
| **Images** | Up to 9 (carousel), JPEG/PNG |
| **Docs** | https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api |

**Flow:**
1. OAuth → access token (60 days, refresh supported)
2. Initialize image upload → get upload URL
3. Upload binary to URL
4. Create post with image URNs + text

---

### 5.2 Facebook (Pages)

| Item | Detail |
|------|--------|
| **API** | Meta Graph API v20+ |
| **Auth** | OAuth 2.0 via Meta |
| **Scopes** | `pages_manage_posts`, `pages_read_engagement`, `pages_show_list` |
| **Post Endpoint** | `POST /{page-id}/feed` or `POST /{page-id}/photos` |
| **Text Limit** | 63,206 characters (practical: keep short) |
| **Images** | Single or album via `/photos` |
| **Docs** | https://developers.facebook.com/docs/graph-api |

**Important:** Personal profile posting limited hai — **Facebook Pages** use karo.

---

### 5.3 Instagram (Business/Creator)

| Item | Detail |
|------|--------|
| **API** | Instagram Graph API (Meta) |
| **Auth** | Same Meta OAuth (Facebook app) |
| **Scopes** | `instagram_basic`, `instagram_content_publish` |
| **Requirements** | Business ya Creator account, Facebook Page linked |
| **Post Flow** | 2-step: (1) Create container (2) Publish container |
| **Rate Limit** | ~25 posts per 24 hours per account |
| **Image Format** | JPEG preferred, aspect ratio 4:5 to 1.91:1 |
| **Docs** | https://developers.facebook.com/docs/instagram-api |

**Flow:**
```
POST /{ig-user-id}/media  →  container ID
POST /{ig-user-id}/media_publish  →  published media ID
```

**Note:** App Review required for `instagram_content_publish` in production.

---

### 5.4 X (Twitter)

| Item | Detail |
|------|--------|
| **API** | Twitter API v2 |
| **Auth** | OAuth 2.0 PKCE |
| **Scopes** | `tweet.read`, `tweet.write`, `users.read`, `offline.access` |
| **Post Endpoint** | `POST /2/tweets` |
| **Media Upload** | `POST /1.1/media/upload.json` (v1.1 endpoint still used) |
| **Text Limit** | 280 characters (Premium: more) |
| **Images** | Up to 4 per tweet |
| **Docs** | https://developer.x.com/en/docs/twitter-api |

**Flow:**
1. Upload each image → get `media_id`
2. Create tweet with `media.media_ids` + text

---

### 5.5 Reddit

| Item | Detail |
|------|--------|
| **API** | Reddit API (OAuth2) |
| **Auth** | OAuth 2.0 |
| **Scopes** | `submit`, `identity`, `read` |
| **Post Endpoint** | `POST /api/submit` |
| **Post Type** | `kind: self` (text) or `kind: link` |
| **Title** | Required (max 300 chars) |
| **Body** | Markdown supported |
| **Images** | Upload via `POST /api/media/asset.json` then embed in post |
| **Docs** | https://www.reddit.com/dev/api |

**Important:**
- Har subreddit ki apni rules hain — spam se bacho
- Rate limits strict hain
- User ko subreddit select karna hoga UI mein

---

### Platform Content Limits Summary

| Platform | Text Limit | Max Images | Special |
|----------|-----------|------------|---------|
| LinkedIn | ~3000 | 9 | Professional tone |
| Facebook | ~63000 | Multiple | Page required |
| Instagram | 2200 (caption) | 10 (carousel) | Business account |
| X/Twitter | 280 | 4 | Short & punchy |
| Reddit | Unlimited body | 1-20 (gallery) | Title required, subreddit |

---

## 6. API Design

### Base URL
```
Development: http://localhost:3001/api/v1
Production:  https://api.yourdomain.com/v1
```

### Authentication
```
Authorization: Bearer <jwt_token>
```

### Endpoints

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | New user signup |
| POST | `/auth/login` | Login, get JWT |
| GET | `/auth/me` | Current user profile |

#### Social Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accounts` | List connected accounts |
| GET | `/accounts/:platform/connect` | Start OAuth flow |
| GET | `/accounts/:platform/callback` | OAuth callback |
| DELETE | `/accounts/:id` | Disconnect account |
| POST | `/accounts/:id/refresh` | Manual token refresh |

#### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | List posts (filter by status) |
| POST | `/posts` | Create draft post |
| GET | `/posts/:id` | Get post details |
| PATCH | `/posts/:id` | Update draft/scheduled post |
| DELETE | `/posts/:id` | Delete post |
| POST | `/posts/:id/publish` | Publish immediately |
| POST | `/posts/:id/schedule` | Schedule for later |
| GET | `/posts/:id/logs` | Publish logs per platform |

#### Media
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/media/upload` | Upload image to S3 |
| GET | `/media` | List user's media |
| DELETE | `/media/:id` | Delete from S3 + DB |

#### Analytics (MVP Basic)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/overview` | Dashboard stats |
| GET | `/analytics/posts/:id` | Per-post engagement |

### Example: Create & Publish Post

**Request:**
```json
POST /api/v1/posts
{
  "content": "Just shipped a new feature! 🚀 #webdev #typescript",
  "title": "New Feature Launch",
  "images": [
    "https://your-bucket.s3.amazonaws.com/media/abc123.jpg"
  ],
  "targets": [
    { "socialAccountId": "clx123", "platform": "LINKEDIN" },
    { "socialAccountId": "clx456", "platform": "TWITTER" },
    { 
      "socialAccountId": "clx789", 
      "platform": "REDDIT",
      "subreddit": "webdev",
      "customContent": "What do you think about this approach?"
    }
  ],
  "scheduledFor": null
}
```

**Response:**
```json
{
  "id": "post_abc",
  "status": "PUBLISHING",
  "targets": [
    { "platform": "LINKEDIN", "status": "PENDING" },
    { "platform": "TWITTER", "status": "PENDING" },
    { "platform": "REDDIT", "status": "PENDING" }
  ]
}
```

---

## 7. Folder Structure

```
social-media-crossposter/
├── docs/
│   ├── DEVELOPER_DOCUMENTATION.md   ← Yeh file
│   └── ROADMAP.md
├── backend/
│   ├── src/
│   │   ├── index.ts                 # Entry point
│   │   ├── app.ts                   # Express app setup
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── database.ts
│   │   │   └── s3.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── rateLimit.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── accounts.routes.ts
│   │   │   ├── posts.routes.ts
│   │   │   └── media.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── post.service.ts
│   │   │   ├── media.service.ts
│   │   │   ├── scheduler.service.ts
│   │   │   └── encryption.service.ts
│   │   ├── platforms/
│   │   │   ├── platform.interface.ts
│   │   │   ├── platform.factory.ts
│   │   │   ├── linkedin/
│   │   │   │   ├── linkedin.adapter.ts
│   │   │   │   └── linkedin.types.ts
│   │   │   ├── facebook/
│   │   │   ├── instagram/
│   │   │   ├── twitter/
│   │   │   └── reddit/
│   │   ├── queue/
│   │   │   ├── queue.config.ts
│   │   │   ├── publish.worker.ts
│   │   │   └── scheduler.worker.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── validators.ts
│   │   └── types/
│   │       └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/
│   │   │   ├── client.ts            # Axios/fetch wrapper
│   │   │   ├── posts.api.ts
│   │   │   ├── accounts.api.ts
│   │   │   └── media.api.ts
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Header.tsx
│   │   │   ├── posts/
│   │   │   │   ├── PostComposer.tsx
│   │   │   │   ├── PostPreview.tsx
│   │   │   │   └── PlatformSelector.tsx
│   │   │   └── accounts/
│   │   │       └── ConnectAccount.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Compose.tsx
│   │   │   ├── Accounts.tsx
│   │   │   ├── History.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/
│   │   │   ├── usePosts.ts
│   │   │   └── useAccounts.ts
│   │   ├── store/
│   │   │   └── authStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── lib/
│   │       └── utils.ts
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml               # Postgres + Redis
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
└── README.md
```

---

## 8. Unified Post Flow

```
User composes post (Frontend)
        │
        ▼
Upload images → S3 (get URLs)
        │
        ▼
POST /api/v1/posts (with targets)
        │
        ▼
Backend validates content per platform
        │
        ├── Invalid? → Return errors to user
        │
        ▼
Save Post + PostTargets to DB (status: DRAFT or SCHEDULED)
        │
        ├── scheduledFor set? → Add to scheduler queue
        │
        └── immediate? → Add to publish queue
                │
                ▼
        BullMQ Worker picks job
                │
                ▼
        For each PostTarget (parallel with concurrency limit):
                │
                ├── Get SocialAccount + decrypt token
                ├── Check token expiry → refresh if needed
                ├── Transform content (platform limits)
                ├── Resize images if needed (Sharp)
                ├── Call PlatformAdapter.publishPost()
                ├── Log result in PublishLog
                └── Update PostTarget status
                │
                ▼
        Update overall Post status:
        - All success → PUBLISHED
        - Some failed → PARTIAL
        - All failed → FAILED
                │
                ▼
        Frontend polls / websocket updates status
```

### Retry Strategy

| Attempt | Delay | Action |
|---------|-------|--------|
| 1 | Immediate | First try |
| 2 | 30 seconds | Retry (transient error) |
| 3 | 2 minutes | Retry |
| Fail | — | Mark FAILED, notify user |

Retry only on: network errors, 429 rate limit, 5xx server errors.  
No retry on: 401 (refresh token first), 400 (bad content), 403 (permission).

---

## 9. Media Handling (AWS S3)

### Upload Flow

1. Frontend sends image to `POST /media/upload` (multipart/form-data)
2. Backend validates: type (JPEG/PNG/WebP), size (max 10MB), dimensions
3. Sharp se optimize/resize (platform ke liye variants bana sakte ho)
4. Upload to S3: `s3://your-bucket/media/{userId}/{uuid}.{ext}`
5. Return public/signed URL
6. Save `Media` record in DB

### S3 Bucket Structure

```
your-bucket/
└── media/
    └── {userId}/
        ├── {uuid}.jpg          # Original
        ├── {uuid}_linkedin.jpg # 1200x627 (optional variant)
        ├── {uuid}_ig.jpg       # 1080x1080 (optional variant)
        └── {uuid}_thumb.jpg    # 400x400 thumbnail
```

### Required S3 Config

```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_PUBLIC_URL=https://your-bucket.s3.amazonaws.com
```

### CORS (S3 Bucket Policy)

Bucket par CORS enable karo taake frontend directly upload kar sake (optional — backend proxy bhi chalega).

---

## 10. Security & Best Practices

### Token Security
- **AES-256-GCM** encryption for `accessToken` and `refreshToken`
- Encryption key environment variable mein (`TOKEN_ENCRYPTION_KEY`)
- Kabhi bhi tokens logs mein mat likho

### OAuth
- State parameter CSRF protection ke liye
- Minimal scopes request karo
- Token refresh automatic (cron job ya pre-publish check)

### API Security
- JWT expiry: 24 hours (refresh token: 30 days)
- Rate limiting: 100 req/min per user
- Input validation: Zod schemas
- CORS: sirf frontend domain allow karo

### Image Security
- File type validation (magic bytes, not just extension)
- Max file size: 10MB
- Virus scan (optional, production mein)

### Compliance
- Har platform ki Terms of Service follow karo
- User consent OAuth screens par clear rakho
- Data deletion endpoint (GDPR): user delete → tokens + posts + S3 files remove

---

## 11. Environment Variables

### Backend `.env.example`

```env
# Server
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://smc:password@localhost:5432/smc_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT / Auth
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=24h
TOKEN_ENCRYPTION_KEY=your-32-byte-hex-encryption-key

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=
AWS_S3_PUBLIC_URL=

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REDIRECT_URI=http://localhost:3001/api/v1/accounts/linkedin/callback

# Meta (Facebook + Instagram)
META_APP_ID=
META_APP_SECRET=
META_REDIRECT_URI=http://localhost:3001/api/v1/accounts/facebook/callback

# X (Twitter) OAuth
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_REDIRECT_URI=http://localhost:3001/api/v1/accounts/twitter/callback

# Reddit OAuth
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_REDIRECT_URI=http://localhost:3001/api/v1/accounts/reddit/callback
REDDIT_USER_AGENT=SocialMediaCrossposter/1.0 by YourUsername

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env.example`

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

---

## 12. Development Setup

### Prerequisites
- Node.js 20+
- Docker Desktop
- Git

### Steps

```bash
# 1. Clone repo
git clone <your-repo>
cd social-media-crossposter

# 2. Start database & redis
docker-compose up -d

# 3. Backend setup
cd backend
cp .env.example .env
# .env mein apni values daalo
npm install
npx prisma migrate dev
npm run dev          # http://localhost:3001

# 4. Frontend setup (naya terminal)
cd frontend
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```

### Docker Compose (`docker-compose.yml`)

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: smc
      POSTGRES_PASSWORD: password
      POSTGRES_DB: smc_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## 13. Testing Strategy

| Level | Tool | Kya Test Karein |
|-------|------|-----------------|
| Unit | Jest / Vitest | Services, adapters (mocked APIs), validators |
| Integration | Supertest | API routes + DB |
| E2E | Playwright (optional) | Full compose → publish flow |
| Manual | Postman | OAuth flows, real platform posting (test accounts) |

### Test Accounts
Har platform par **developer/test accounts** banao — production accounts par test mat karo.

---

## 14. Deployment

### Recommended: Railway or Render

```
Backend  → Railway (Node.js service)
Frontend → Vercel or Netlify (static Vite build)
Postgres → Railway managed DB
Redis    → Railway managed Redis
S3       → AWS (already have)
```

### Production Checklist
- [ ] HTTPS everywhere
- [ ] Environment variables set in hosting dashboard
- [ ] OAuth redirect URIs updated to production URLs
- [ ] S3 bucket CORS + public read policy
- [ ] Database backups enabled
- [ ] Error monitoring (Sentry)
- [ ] Platform app review submitted (Meta, LinkedIn)

---

## Quick Reference

| Topic | Decision |
|-------|----------|
| Backend first? | **Haan** — integrations sab se mushkil hain |
| Pehla platform | **LinkedIn** |
| Auth | Clerk ya custom JWT |
| Queue | BullMQ + Redis |
| Images | AWS S3 + Sharp |
| Frontend | React + Vite + Tailwind |

---

*Documentation version 1.0 — July 2026*  
*Agla step: `ROADMAP.md` dekho development phases ke liye.*
