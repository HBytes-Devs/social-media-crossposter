# Google Ads analytics setup

SMC reads Google Ads metrics directly from the **Google Ads API** (no third-party analytics SaaS).

## What you get

- OAuth connect for Google Ads accounts
- Account-level daily metrics: impressions, clicks, cost, conversions, CTR
- Campaign-level breakdown with tables and charts
- Date presets: last 7 / 30 / 90 days + custom range
- Dashboard summary panel + dedicated `/google-ads` page

## Prerequisites

1. **Google Cloud project** with **Google Ads API** enabled
2. **OAuth 2.0 Web client** (Client ID + secret)
3. **Google Ads developer token** (test token works for test manager accounts)
4. A Google account with access to at least one Ads customer

## 1. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. **APIs & Services → Library** → enable **Google Ads API**
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URI:
     - Local: `http://localhost:3001/api/v1/google-ads/callback`
     - Production: `https://<API_HOST>/api/v1/google-ads/callback`

Copy **Client ID** and **Client secret**.

## 2. Google Ads developer token

1. Sign in to [Google Ads](https://ads.google.com/)
2. **Tools & settings → Setup → API Center**
3. Apply for a developer token (test access is enough to start)

Copy the **developer token**.

## 3. Backend `.env`

```env
GOOGLE_ADS_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=your-client-secret
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token
GOOGLE_ADS_REDIRECT_URI=http://localhost:3001/api/v1/google-ads/callback
```

Restart the backend after changing env vars.

## 4. Database migration

```bash
cd backend
npx prisma migrate deploy
# or for local dev:
npx prisma migrate dev
```

## 5. Connect in SMC

1. Log in with a **Medium or Premium** plan (analytics feature)
2. Open **Google Ads** in the sidebar
3. Click **Connect Google Ads**
4. Approve OAuth (scope: `https://www.googleapis.com/auth/adwords`)
5. Click **Sync now** to pull metrics from the API

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/google-ads/status` | Config + connection status |
| GET | `/api/v1/google-ads/connect-url` | OAuth URL (auth required) |
| GET | `/api/v1/google-ads/callback` | OAuth callback |
| GET | `/api/v1/google-ads/analytics` | Cached metrics (`preset`, `from`, `to`, `sync=true`) |
| POST | `/api/v1/google-ads/sync` | Fetch from Google Ads API and store |
| DELETE | `/api/v1/google-ads/accounts/:id` | Disconnect |

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Google Ads is not configured` | Set all four `GOOGLE_ADS_*` env vars |
| `developer token` / `PERMISSION_DENIED` | Token not approved yet, or wrong Google account |
| `No accessible Google Ads accounts` | Connect with a Google user that has Ads access |
| Empty charts after connect | Click **Sync now** — dashboard shows cached DB data |
| OAuth redirect mismatch | Redirect URI in Google Cloud must match `GOOGLE_ADS_REDIRECT_URI` exactly |

## Notes

- First accessible customer ID is stored on connect (multi-account picker can be added later).
- Tokens are encrypted at rest with `TOKEN_ENCRYPTION_KEY`.
- Metrics are stored in `GoogleAdsAccountMetric` and `GoogleAdsCampaignMetric` for fast dashboard loads.
