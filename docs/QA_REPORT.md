# QA Test Report — SMC v1.0.0-rc.1

**Date:** 2026-07-11  
**Environment:** Local (Windows) — Backend `http://localhost:3001`, Frontend `http://localhost:5173`  
**Engineer role:** Quality Engineering (automated + manual checklist)

---

## Executive summary

| Phase | Status | Result |
|-------|--------|--------|
| 1. Static analysis (lint / typecheck) | **PASS** | Backend `tsc --noEmit` clean; frontend oxlint warnings only (non-blocking) |
| 2. Unit tests | **PASS** | Backend 30/30 · Frontend 14/14 |
| 3. Integration tests (API) | **PASS** | 7 HTTP contract tests via Supertest |
| 4. Smoke tests (live) | **PASS** | 6/6 — DB connected, LinkedIn OAuth configured, auth enforced |
| 5. Build verification | **FAIL** | Frontend `tsc -b` fails — MUI v9 Typography/Stack prop typing (pre-existing); backend build OK |
| 6. Manual UI checklist | **PENDING** | See `docs/QA.md` — requires browser walkthrough |

---

## Phase 2 — Unit tests

### Backend (`npm test`)

| Suite | Tests | Status |
|-------|-------|--------|
| `tests/unit/hashtags.test.ts` | 11 | PASS |
| `tests/unit/linkedin-image.test.ts` | 4 | PASS |
| `tests/unit/validators.test.ts` | 8 | PASS |
| **Total** | **30** | **PASS** |

**Coverage focus:** hashtag generation/normalization, LinkedIn image validation, Zod auth/post schemas.

### Frontend (`npm test`)

| Suite | Tests | Status |
|-------|-------|--------|
| `src/lib/hashtags.test.ts` | 5 | PASS |
| `src/lib/datetime.test.ts` | 4 | PASS |
| `src/store/slices/composerSlice.test.ts` | 5 | PASS |
| **Total** | **14** | **PASS** |

**Coverage focus:** FE/BE hashtag parity, datetime helpers, compose Redux reducers.

---

## Phase 3 — Integration tests

| Test | Expected | Actual |
|------|----------|--------|
| `GET /api/v1/health` | 200/503 + version | PASS |
| `GET /api/v1/auth/config` | 200 public | PASS |
| `GET /api/v1/accounts` | 401 without token | PASS |
| `GET /api/v1/posts/options` | 401 without token | PASS |
| `GET /api/v1/accounts/linkedin/status` | 200 + configured flag | PASS |
| `POST /api/v1/auth/login` invalid email | 400 | PASS |
| Unknown route | 404 | PASS |

---

## Phase 4 — Smoke tests (live backend)

```
[PASS] Health endpoint — status=200 db=connected
[PASS] Auth config — recaptcha=true
[PASS] LinkedIn OAuth configured — configured=true
[PASS] Accounts requires auth — status=401
[PASS] Posts list requires auth — status=401
[PASS] Authenticated flows — skipped (set QA_EMAIL / QA_PASSWORD)
```

**LinkedIn DB status (separate check):** Connected — Hamza Haseeb, token valid until 2026-09-07.

---

## Phase 5 — Known issues / observations

| ID | Severity | Area | Finding |
|----|----------|------|---------|
| QA-001 | P1 | Compose UI | Platforms section can show “no account connected” while DB has LinkedIn — accounts fetch race (fix in progress) |
| QA-002 | P2 | Compose UI | Publish buttons at bottom of long form — easy to miss without scroll |
| QA-003 | P3 | Lint | 8 oxlint warnings (unused imports, hook deps) — non-blocking |
| QA-004 | — | Test gap | No Playwright/Cypress E2E yet |
| QA-006 | P1 | Build | Frontend production build fails TypeScript check (MUI v9 `fontWeight`, `textAlign`, Stack layout props on Typography/Stack) |

---

## Phase 6 — Manual checklist (Compose / Publish)

Use this in the browser after refresh:

- [ ] `/compose` loads without skeleton stuck
- [ ] Platforms shows LinkedIn **Connected**
- [ ] Select LinkedIn → **Publish now** enabled
- [ ] Live preview updates with content + hashtags + image
- [ ] Publish now → post in `/posts/published`
- [ ] LinkedIn feed shows post

Full checklist: [`docs/QA.md`](./QA.md)

---

## How to re-run

```bash
cd backend && npm test && npm run test:qa:smoke
cd ../frontend && npm test && npm run lint
```

Optional authenticated smoke:

```bash
set QA_EMAIL=your@email.com
set QA_PASSWORD=your-password
cd backend && npm run test:qa:smoke
```

---

## CI

`.github/workflows/ci.yml` updated to run `npm test` on backend and frontend for every PR/push to `master`.
