# Maria Test Checklist

Branch: **`testing/maria`** (merge from `master` before each QA round)

Use **staging URLs** when Phase 5 deploy is live; otherwise `localhost:5173` + `localhost:3001`.

Report format: **screenshot + step + expected vs actual** → WhatsApp or shared doc.

---

## Environment setup (tester)

- [ ] Backend running (`/api/v1/health` → `status: ok`)
- [ ] Frontend opens without white screen
- [ ] LinkedIn OAuth app configured (redirect URI matches environment)
- [ ] Reddit OAuth configured (if testing cross-post)
- [ ] S3 configured (for image post tests)

---

## Core auth

| # | Test | Expected |
|---|------|----------|
| 1 | Register new account | Lands on dashboard, logged in |
| 2 | Logout → Login | Session restores, sidebar shows user |
| 3 | Forgot password (if SMTP set) | Email/code flow or clear error |

---

## Accounts

| # | Test | Expected |
|---|------|----------|
| 4 | Connect LinkedIn | OAuth popup → `/accounts?connected=linkedin` → success alert |
| 5 | Connect Reddit | Same flow for Reddit |
| 6 | Disconnect + reconnect | Account list updates, no duplicate rows |

---

## Compose & publish

| # | Test | Expected |
|---|------|----------|
| 7 | Text-only → Publish now | One post in Posts / Published, LinkedIn live |
| 8 | Image post → Publish | Image visible on platform |
| 9 | LinkedIn + Reddit cross-post | Single post row, both targets; PARTIAL if one fails |
| 10 | Reddit validation | Missing title/subreddit blocked before submit |
| 11 | Twitter char limit hint | Warning if over 280 when Twitter selected |

---

## Schedule

| # | Test | Expected |
|---|------|----------|
| 12 | Schedule future post | **Exactly ONE** entry in Scheduled tab |
| 13 | Dashboard upcoming | Post appears in “next 7 days” |
| 14 | Calendar | Post on correct day |
| 15 | Cancel schedule | Post moves to drafts |

---

## Posts management

| # | Test | Expected |
|---|------|----------|
| 16 | Dashboard counts | Match Posts tab counts |
| 17 | Failed post retry | Retry button re-attempts failed target |
| 18 | Trash → restore → delete | Trash tab behaves correctly |
| 19 | Filter `?status=FAILED` | Failed posts filter works from dashboard link |

---

## Dashboard & analytics

| # | Test | Expected |
|---|------|----------|
| 20 | Stat cards clickable | Navigate to correct posts tab |
| 21 | Platform chips | Show connected platform counts |
| 22 | LinkedIn performance card | Stats or clear “connect / setup” message |
| 23 | Post snippet click | Opens published/scheduled tab |

---

## Calendar

| # | Test | Expected |
|---|------|----------|
| 24 | Month navigation | Prev/next works, loading state shown |
| 25 | Day selection | Detail panel shows posts for that day |
| 26 | Timezone label | Day title shows correct local date |
| 27 | Error state | If API fails, error alert (not empty silent calendar) |

---

## Settings

| # | Test | Expected |
|---|------|----------|
| 28 | Profile name edit | Save → sidebar name updates |
| 29 | Add AI key (Claude/GPT) | Key saved, default star works |
| 30 | Compose AI Assist | Uses saved key, returns suggestion |

---

## i18n & mobile

| # | Test | Expected |
|---|------|----------|
| 31 | Change UI language | Main labels translate |
| 32 | Mobile width (~375px) | Hamburger menu, compose usable |

---

## Token health

| # | Test | Expected |
|---|------|----------|
| 33 | Token expiry banner | Shows when account token expiring |
| 34 | Reconnect prompt | Accounts page connect flow works after expiry |

---

## Staging-only (after deploy)

| # | Test | Expected |
|---|------|----------|
| 35 | Staging URL login | No CORS errors in browser console |
| 36 | OAuth on staging domain | Redirect URIs use production API host |
| 37 | Image upload on staging | S3 URLs load on LinkedIn/Reddit |

---

## Sign-off

| Field | Value |
|-------|-------|
| Tester | Maria |
| Branch / URL | |
| Version | (from Settings → About or `/api/v1/health`) |
| Date | |
| Pass count | / 37 |
| Blockers | |

When all **Must have** items (1–20, 28–30, 35–36) pass on staging → ready for `1.0.0` tag.

See also: [LIMITATIONS.md](LIMITATIONS.md) · [DEPLOY.md](DEPLOY.md)
