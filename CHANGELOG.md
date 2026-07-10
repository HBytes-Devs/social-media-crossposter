# Changelog

All notable changes to **Social Media Crossposter (SMC)** are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).  
Versioning follows [Semantic Versioning](https://semver.org/).

## Release channels

| Channel | Meaning | Example |
|---------|---------|---------|
| `alpha` | Internal / unstable | `0.8.0-alpha.1` |
| `beta` | Public testing, feature-complete-ish | `0.9.0-beta.1` |
| `rc` | Release candidate | `1.0.0-rc.1` |
| `stable` | Production-ready | `1.0.0` |

## [Unreleased]

### Added
- **GitHub Pages deploy** — `.github/workflows/pages.yml`, Vite base path, SPA `404.html` fallback

### Changed
- README + DEPLOY docs updated for GitHub Pages URL

---

## [1.0.0-rc.1] - 2026-07-11

### Added
- **Deploy readiness:** backend `Dockerfile`, `render.yaml`, frontend `vercel.json`, GitHub Actions CI
- **docs/DEPLOY.md** — staging/production step-by-step (Render + Vercel)
- **docs/LIMITATIONS.md** — known product gaps for launch
- **docs/MARIA_TEST_CHECKLIST.md** — 37-case QA regression (incl. staging + Reddit)
- Production npm scripts: `build:prod`, `start:prod`, `db:migrate:deploy`, `postinstall`

### Changed
- Health check returns **503** when DB down in production (load balancer friendly)
- README overhaul: env vars, deploy, Maria checklist links
- `.env.example` files document production OAuth redirect pattern

---

## [0.9.0-beta.4] - 2026-07-11

### Added
- **LinkedIn analytics on dashboard** — totals + per-post stats from last 5 published posts
- `LinkedInStatsGrid` shared component (dashboard + post cards)
- Dashboard `?analytics=true` API flag
- **Settings profile edit** — display name via `PATCH /auth/me`

### Changed
- Dashboard: platform breakdown chips, clickable post snippets, accurate 7-day scheduled hint
- Failed posts banner links to `/posts/published?status=FAILED`
- Calendar: error alerts, timezone-safe day labels, month navigation polish
- Calendar day chips show platform + content preview; PARTIAL/FAILED status colors
- Posts page reads `?status=` URL filter

---

## [0.9.0-beta.3] - 2026-07-11

### Added
- **Reddit + multi-platform cross-post** (Phase 3): LinkedIn + Reddit same compose flow
- Auto OAuth redirect back to `/accounts` after connect
- Token auto-refresh before publish (Reddit/LinkedIn expiry)
- Platform compose hints (Twitter 280 chars, Reddit title/subreddit, image limits)
- Per-target publish status row on post cards (SUCCESS / FAILED / PARTIAL)

### Changed
- Accounts page shows OAuth success/error messages
- Reddit fields + platform picker use theme-aware MUI styling
- Composer validates Twitter length and Reddit image limit on submit

---

## [0.9.0-beta.2] - 2026-07-11

### Added
- Failed/partial post **Retry failed** button (`POST /posts/:id/retry`)
- Token expiry banner in app layout + reconnect prompts on Accounts
- Mobile responsive sidebar (hamburger drawer on small screens)
- Per-platform publish error messages on post cards
- Dedicated image upload error + warning alerts in composer

### Changed
- Post card actions stack better on mobile
- Composer uses MUI alerts and responsive grid layout
- Posts action error messages in Roman Urdu

---

## [0.9.0-beta.1] - 2026-07-10

### Added
- Dashboard, calendar, and posts management (all, published, scheduled, drafts, trash)
- Post scheduling with background scheduler
- AI Assist: improve, smart hashtags, localize, smart suggest, auto-correct
- Settings: user-owned AI API keys with custom names (Claude, GPT, MiniMax, etc.)
- Auth UI with multi-language support (en, ur, roman-ur, hi)
- LinkedIn compose preview and image validation
- Password reset flow (backend + frontend)
- July 2026 deadline plan (`docs/JULY_2026_DEADLINE_PLAN.txt`)
- Product versioning manifest (`version.json`) and beta channel tracking

### Fixed
- Schedule post duplication (single submit, atomic scheduler claim)
- Translation partial-match bug in localize pipeline
- MUI icon import (`DeleteOutlined`)

### Changed
- Composer split into form + preview panels
- Posts grouped by platform only on "All" tab

---

## [0.1.0] - 2026-07-09

### Added
- Initial project scaffold (backend + frontend)
- LinkedIn OAuth and publish
- Prisma schema, JWT auth, S3 media upload
- Basic composer and accounts page

---

[0.9.0-beta.1]: https://github.com/Haseebcodejourney/social-media-crossposter/compare/35cf4f9...b48daad
[0.1.0]: https://github.com/Haseebcodejourney/social-media-crossposter/commit/35cf4f9
