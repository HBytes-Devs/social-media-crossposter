# SMC Known Limitations

Last updated: July 2026 — `1.0.0-rc.1`

This document lists what SMC **does not** do yet, or does only partially. Use for demos, Maria QA, and stakeholder expectations.

---

## Platform support

| Platform | Status | Notes |
|----------|--------|-------|
| **LinkedIn** | ✅ Live | Text + image publish, schedule, analytics (needs API approval) |
| **Reddit** | ✅ Live | Text + image, cross-post with LinkedIn |
| **Facebook** | ⚠️ Code only | OAuth adapter exists; not fully tested in production |
| **Instagram** | ⚠️ Code only | Requires Meta app review; high rejection risk for new apps |
| **X (Twitter)** | ⚠️ Code only | OAuth adapter exists; no setup doc; API tier limits apply |

**July launch scope:** LinkedIn + Reddit reliable. Others are stretch goals.

---

## LinkedIn analytics

- Requires **Community Management API** approval from LinkedIn
- OAuth scope `r_member_postAnalytics` must be added and account reconnected
- Analytics are **live-fetched**, not stored in database
- Rate limits: ~500 calls/day per app, ~100/day per member (see `LINKEDIN_ANALYTICS_SETUP.md`)
- Dashboard summary fetches last 5 posts only (to protect rate limits)

---

## Media & content

- **Images only** — no video upload or publish (planned v2.0)
- Max image count varies by platform (Reddit: 1 image in composer validation)
- S3 required for image posts — no local filesystem fallback in production
- No built-in image editor or crop

---

## Scheduling & publishing

- Scheduler uses **database polling** (default 60s interval), not Redis/BullMQ
- `REDIS_URL` in env is unused in current codebase
- Duplicate schedule posts were fixed — report if regression appears
- Partial publish (one platform succeeds, one fails) shows per-target status + retry

---

## Authentication & security

- Custom JWT auth (no OAuth login for SMC itself)
- Password reset requires SMTP configuration
- reCAPTCHA optional — if unset, some flows may behave differently
- No 2FA, no team/multi-user workspaces
- Tokens encrypted at rest; users must reconnect when OAuth tokens expire

---

## AI Assist

- User brings own API keys (Claude, GPT, MiniMax, custom)
- Keys stored encrypted per user
- No built-in SMC AI billing or quota
- Quality depends on provider and model chosen

---

## Internationalization

- UI supports en, ur, roman-ur, hi
- AI-generated content language is user-selected per post
- Not all error messages are translated

---

## Deployment

- Frontend and backend are **separate deploys** (no monolith)
- CORS allows **single** `FRONTEND_URL` — no multi-domain without code change
- Health check returns **503** when DB disconnected in production
- No bundled monitoring (Sentry), backups, or CDN config in repo

---

## Mobile

- Responsive layout with mobile drawer sidebar (Phase 2)
- Not a native app; composer on very small screens may need scrolling

---

## What “1.0” means for July 2026

✅ Included:

- LinkedIn publish + schedule stable
- Reddit cross-post
- Dashboard, calendar, posts, settings (profile + AI keys)
- Staging deploy documentation and configs

❌ Not required for July 1.0:

- Instagram production approval
- Facebook / Twitter live
- Video posts
- Team accounts / billing
- Full analytics history charts

---

Report new limitations in GitHub issues or Maria QA doc.
