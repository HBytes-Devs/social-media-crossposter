# SMC Quality Assurance Guide

Quality engineering coverage for **Social Media Crossposter v1.0.0-rc.1**.

## Testing phases

| Phase | Goal | How to run | Location |
|-------|------|------------|----------|
| **1. Static analysis** | Type safety, lint | `npm run lint` in `backend/` and `frontend/` | CI |
| **2. Unit tests** | Pure logic (hashtags, validators, reducers) | `npm test` in each package | `backend/tests/unit`, `frontend/src/**/*.test.ts` |
| **3. Integration tests** | HTTP API contracts | `npm test` in `backend/` | `backend/tests/integration` |
| **4. Smoke tests** | Live environment health | `npm run test:qa:smoke` in `backend/` | `backend/scripts/qa-smoke.ts` |
| **5. Build verification** | Production bundles compile | `npm run build` in each package | CI |
| **6. Manual / exploratory** | UI flows, OAuth, publish | Checklist below | Browser |

---

## Run full automated QA

```bash
# Backend: unit + integration + smoke
cd backend
npm test
npm run test:qa:smoke

# Optional authenticated smoke (no credentials in repo)
set QA_EMAIL=you@example.com
set QA_PASSWORD=your-password
npm run test:qa:smoke

# Frontend: unit tests + build + lint
cd ../frontend
npm test
npm run lint
npm run build
```

---

## Manual test checklist (Compose / Publish)

### Auth
- [ ] Register new user
- [ ] Login / logout
- [ ] Session persists after refresh
- [ ] Protected routes redirect when logged out

### Accounts
- [ ] `/accounts` shows platform cards
- [ ] LinkedIn shows **Connected** when OAuth complete
- [ ] Disconnect / reconnect flow

### Compose (`/compose`)
- [ ] Page loads options, accounts, media library
- [ ] Content editor + char count (Twitter 280 warning)
- [ ] Hashtag modes: auto / manual / none
- [ ] Image upload + thumbnail preview
- [ ] Platform grid selects connected accounts
- [ ] Live preview updates per platform tab
- [ ] **Publish or schedule** section visible (scroll or sticky on mobile)
- [ ] Buttons enabled when content + platform selected

### Publish flows
- [ ] **Save as draft** → appears in `/posts/drafts`
- [ ] **Schedule post** → appears in `/posts/scheduled`
- [ ] **Publish now** → appears in `/posts/published` (LinkedIn feed)

### Posts & calendar
- [ ] Tab filters: All, Published, Scheduled, Drafts, Trashed
- [ ] Trash / restore
- [ ] Calendar month view

### Settings
- [ ] Profile update
- [ ] AI keys panel (if configured)

---

## Defect severity (for reporting)

| Level | Definition | Example |
|-------|------------|---------|
| **P0** | Cannot publish or auth broken | Publish API 500, login fails |
| **P1** | Major feature blocked | Accounts not loading on compose |
| **P2** | Workaround exists | Preview layout on narrow screen |
| **P3** | Cosmetic / copy | Urdu hint text on English UI |

---

## CI integration

GitHub Actions workflow `.github/workflows/ci.yml` runs:

- Backend: `lint`, `test`, `build`
- Frontend: `lint`, `test`, `build`

---

## Known gaps / backlog

- E2E browser tests (Playwright) — not yet automated
- FE/BE hashtag parity enforced by unit tests but logic is duplicated
- OAuth flows require manual verification per platform
- Load / performance testing not in scope for rc.1
