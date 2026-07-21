# LinkedIn Ads analytics setup

SMC reads **LinkedIn Ads / Marketing API** campaign metrics directly (impressions, clicks, spend, CTR, conversions) — separate from organic LinkedIn post analytics.

## What you get

- OAuth connect for LinkedIn Ads accounts (`r_ads` + `r_ads_reporting`)
- Account-level daily metrics
- Campaign-level breakdown (table + charts)
- Date presets: last 7 / 30 / 90 days + custom range
- Dashboard **LinkedIn Ads performance** panel + dedicated `/linkedin-ads` page

## Prerequisites

1. [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps) app with **Advertising / Marketing** products enabled
2. OAuth 2.0 redirect URI registered for Ads callback
3. LinkedIn user that can access at least one **Ads account**
4. Products / permissions approved (LinkedIn often requires Marketing Developer Platform access)

Required scopes:

- `r_ads` — read ad accounts & campaigns
- `r_ads_reporting` — ad analytics / reporting

## 1. App + redirect URI

Authorized redirect URI examples:

- Local: `http://localhost:3001/api/v1/linkedin-ads/callback`
- Production: `https://<API_HOST>/api/v1/linkedin-ads/callback`

You can reuse the same Client ID/Secret as organic LinkedIn posting, **or** set dedicated Ads credentials.

## 2. Backend `.env`

```env
# Reuse organic LinkedIn app credentials (optional if LINKEDIN_ADS_CLIENT_* set)
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...

# Ads-specific (recommended dedicated redirect)
LINKEDIN_ADS_CLIENT_ID=          # optional override
LINKEDIN_ADS_CLIENT_SECRET=      # optional override
LINKEDIN_ADS_REDIRECT_URI=http://localhost:3001/api/v1/linkedin-ads/callback

LINKEDIN_API_VERSION=202601
```

Restart the backend after changing env.

## 3. Database migration

```bash
cd backend
npx prisma migrate deploy
# or:
npx prisma migrate dev
npx prisma generate
```

## 4. Connect in SMC

1. Log in with **Medium or Premium** (analytics plan limit)
2. Open **LinkedIn Ads** in the sidebar
3. Click **Connect LinkedIn Ads**
4. Approve OAuth
5. Click **Sync now** to pull metrics from LinkedIn Reporting API

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/linkedin-ads/status` | Config + connection status |
| GET | `/api/v1/linkedin-ads/connect-url` | OAuth URL |
| GET | `/api/v1/linkedin-ads/callback` | OAuth callback |
| GET | `/api/v1/linkedin-ads/analytics` | Cached metrics (`preset`, `from`, `to`, `sync=true`) |
| POST | `/api/v1/linkedin-ads/sync` | Fetch from LinkedIn Ads API and store |
| DELETE | `/api/v1/linkedin-ads/accounts/:id` | Disconnect |

## Notes

- First accessible ad account is linked (multi-account picker can be added later).
- Organic post analytics (`LinkedIn performance` on dashboard) is a **different** API (`memberCreatorPostAnalytics`) and stays separate.
- Cost is stored as micros (currency × 1,000,000) for parity with Google Ads UI.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `403` / not authorized | App missing `r_ads` / `r_ads_reporting` or user has no Ads account access |
| No ad accounts found | Create/link an Ads account in Campaign Manager |
| Token expired | Reconnect; ensure refresh tokens are issued for your LinkedIn app |
| Empty metrics after sync | Campaigns may have no spend in the selected range — try last 90 days |
