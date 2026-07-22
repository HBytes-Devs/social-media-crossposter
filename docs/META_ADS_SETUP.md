# Meta (Facebook) Ads analytics setup

SMC reads **Meta Marketing API** metrics (Facebook + Instagram ads) — separate from organic Facebook/Instagram posting.

## Organic vs Ads — important difference

| | Organic posting (already connected) | Meta Ads (to set up) |
|---|---|---|
| **Purpose** | Publish posts to Facebook Page / Instagram | Read ad spend, impressions, clicks, campaigns |
| **OAuth scopes** | `pages_manage_posts`, `instagram_content_publish` | `ads_read`, `business_management` |
| **SMC storage** | `SocialAccount` table | `MetaAdsAccount` table (after code is built) |
| **Connect in SMC** | Accounts → Facebook / Instagram | Meta Ads page (coming) |
| **Redirect URI** | `/api/v1/accounts/facebook/callback` | `/api/v1/meta-ads/callback` |

Same **Meta App ID** can be used — but you need **Marketing API** product + **ads_read** permission.

---

## What you get (after SMC Meta Ads is built)

- OAuth connect for Meta ad accounts
- Account-level daily metrics: impressions, clicks, spend, conversions, CTR
- Campaign-level breakdown
- Date presets: last 7 / 30 / 90 days + custom range
- Dashboard panel + `/meta-ads` page (like Google Ads / LinkedIn Ads)

---

## Prerequisites

1. [Meta Developer](https://developers.facebook.com/) app (same app as Facebook posting, or new app)
2. **Marketing API** product added to the app
3. Facebook **Business Manager** with at least one **Ad Account**
4. User with **Advertiser** or **Admin** role on the ad account
5. **App Review** for `ads_read` (required for production; dev mode works for app admins/testers)

---

## Step 1 — Meta Developer Portal

1. Open [developers.facebook.com](https://developers.facebook.com/)
2. Select your SMC app (or create **Create App** → type **Business**)
3. Note **App ID** and **App Secret** (Settings → Basic)

---

## Step 2 — Add products

In app dashboard → **Add products**:

| Product | Required | Purpose |
|---------|----------|---------|
| **Facebook Login** or **Facebook Login for Business** | ✅ | OAuth |
| **Marketing API** | ✅ | Ad accounts + insights |

---

## Step 3 — OAuth redirect URI (Ads)

**Facebook Login → Settings → Valid OAuth Redirect URIs**

Add **exactly** (separate from organic Facebook callback):

```
http://localhost:3001/api/v1/meta-ads/callback
```

Production:

```
https://<YOUR_API_HOST>/api/v1/meta-ads/callback
```

Do **not** reuse `/accounts/facebook/callback` for ads — different scopes and token storage.

---

## Step 4 — Permissions (App Review)

**App Review → Permissions and Features** — request:

| Permission | Type | Purpose |
|------------|------|---------|
| **`ads_read`** | Advanced access | Read ad account insights (required) |
| **`business_management`** | Standard/Advanced | List ad accounts in Business Manager |
| `public_profile` | Standard | User identity during OAuth |

**Do not request** `ads_management` unless you plan to edit campaigns from SMC (report-only = not needed).

### Dev mode (before review)

- Only **app admins**, **developers**, and **testers** can authorize `ads_read`
- Add testers: **Roles → Test users** or invite as **Developer** on the app

---

## Step 5 — Business Manager link

1. Open [business.facebook.com](https://business.facebook.com/)
2. **Business settings → Accounts → Ad accounts** — confirm you have an ad account
3. **Business settings → Apps** — add your Meta developer app to the business (if not already)
4. Grant the app access to the ad account

Without an ad account, connect will succeed but metrics will be empty.

---

## Step 6 — Backend `.env`

Reuse existing Meta app credentials; add Ads redirect:

```env
# Already used for organic Facebook/Instagram
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret

# Meta Ads OAuth (dedicated callback)
META_ADS_REDIRECT_URI=http://localhost:3001/api/v1/meta-ads/callback

# Optional: separate Login for Business config with ads permissions
# META_ADS_CONFIG_ID=
```

Restart backend after changes.

---

## Step 7 — Connect in SMC (after Meta Ads code is deployed)

1. Log in with **Medium or Premium** plan
2. Open **Meta Ads** in sidebar
3. **Connect Meta Ads** → approve OAuth
4. **Sync now** to pull insights from Marketing API

---

## API endpoints (planned — mirror Google/LinkedIn Ads)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/meta-ads/status` | Config + connection status |
| GET | `/api/v1/meta-ads/connect-url` | OAuth URL |
| GET | `/api/v1/meta-ads/callback` | OAuth callback |
| GET | `/api/v1/meta-ads/analytics` | Cached metrics |
| POST | `/api/v1/meta-ads/sync` | Fetch from Marketing API |
| DELETE | `/api/v1/meta-ads/accounts/:id` | Disconnect |

---

## Marketing API calls (reference)

- List ad accounts: `GET /me/adaccounts?fields=id,name,account_status`
- Account insights: `GET /act_{ad_account_id}/insights?fields=impressions,clicks,spend,actions&time_increment=1`
- Campaign insights: `GET /act_{ad_account_id}/insights?level=campaign&fields=campaign_name,impressions,clicks,spend`

Graph API version: same as organic (`v21.0` in `platform.config.ts`).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Facebook posts work, Ads connect fails | Different OAuth flow — need `ads_read` + Marketing API product |
| `redirect_uri_mismatch` | Add exact `/meta-ads/callback` URI in Meta app settings |
| Empty ad accounts | Create ad account in Business Manager; grant app access |
| `ads_read` denied | App Review pending — use app admin account in dev mode |
| Token expired | Reconnect; use long-lived token exchange |
| Instagram organic works, Ads don't | Ads use Marketing API, not Instagram Graph publishing API |

---

## Checklist

- [ ] Meta app created / selected
- [ ] Marketing API product added
- [ ] `ads_read` + `business_management` requested (or dev mode with admin user)
- [ ] Redirect URI: `http://localhost:3001/api/v1/meta-ads/callback`
- [ ] Ad account exists in Business Manager
- [ ] App linked to Business Manager
- [ ] `.env`: `META_APP_ID`, `META_APP_SECRET`, `META_ADS_REDIRECT_URI`
- [ ] SMC Meta Ads backend + frontend built and deployed
- [ ] Connect + Sync tested

---

*Organic Facebook setup: see existing Meta app docs. Meta Ads is read-only reporting — campaign management stays in Meta Ads Manager.*
