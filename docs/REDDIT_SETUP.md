# Reddit Developer App Setup
## Social Media Crossposter (SMC)

Roman Urdu guide — step by step

---

## Step 1 — Reddit Account

1. Reddit account hona zaroori hai: [https://www.reddit.com](https://www.reddit.com)
2. Developer apps ke liye account verified hona chahiye (email confirm)

---

## Step 2 — App Banao

1. Kholo: [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Neeche scroll karo → **"create another app..."** ya **"create app"** dabao

| Field | Value |
|-------|-------|
| **name** | `Social Media Crossposter` (ya `SMC`) |
| **App type** | **web app** select karo |
| **description** | `Cross-post to Reddit from SMC` (optional) |
| **about url** | `http://localhost:5173` (optional) |
| **redirect uri** | `http://localhost:3001/api/v1/accounts/reddit/callback` |

**create app** dabao.

---

## Step 3 — Client ID + Secret Copy Karo

App banne ke baad card par:

| Reddit par kya dikhega | `.env` variable |
|------------------------|-----------------|
| App name ke neecay **choti string** (jaise `abc123XYZ`) | `REDDIT_CLIENT_ID` |
| **secret** — "secret" label ke saath | `REDDIT_CLIENT_SECRET` |

> **Note:** Script-type apps mein sirf client_id hoti hai, secret nahi. SMC ke liye **web app** choose karo taake secret mile.

---

## Step 4 — `.env` Mein Daalo

`backend/.env` file mein yeh add/update karo:

```env
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_secret_here
REDDIT_REDIRECT_URI=http://localhost:3001/api/v1/accounts/reddit/callback
REDDIT_USER_AGENT=windows:com.smc.crossposter:v1.0 (by /u/YourRedditUsername)
```

**User-Agent format zaroori hai** — `YourRedditUsername` apna Reddit username likho (bina u/).

Backend restart:
```powershell
cd backend
npm run dev
```

---

## Step 5 — Reddit Connect Karo

### Option A — Frontend UI
1. `http://localhost:5173/accounts` kholo
2. Reddit card par **Connect** dabao
3. Reddit login + **Allow** karo
4. **Refresh list** dabao

### Option B — Script se URL
```powershell
cd backend
npx tsx scripts/reddit-connect-url.ts
```
Browser mein printed URL kholo.

---

## Step 6 — Test Post (r/test)

Reddit par testing ke liye `r/test` subreddit use hoti hai.

```powershell
cd backend
npx tsx scripts/test-reddit-post.ts
```

---

## Compose UI — Reddit Fields

Jab Reddit account select ho:

| Field | Zaroori? | Example |
|-------|----------|---------|
| **Title** | ✅ Haan (text posts) | `My first SMC post` |
| **Subreddit** | ✅ Haan | `test` (bina r/) |
| **Content** | ✅ Haan | Post body text |
| **Image** | Optional | 1 image supported |

---

## Common Errors

| Error | Fix |
|-------|-----|
| `redirect_uri mismatch` | Reddit app mein **exact** callback URL add karo |
| `401 Unauthorized` | `REDDIT_USER_AGENT` sahi format mein set karo |
| `SUBREDDIT_NOEXIST` | Subreddit name check karo (e.g. `test`, `programming`) |
| `RATELIMIT` | Thoda wait karo — Reddit rate limit lagata hai |
| `Setup required` UI | `.env` mein teeno Reddit vars bharo + backend restart |

---

## Scopes (SMC use karta hai)

- `identity` — username/account info
- `submit` — posts submit karna
- `read` — basic read access

---

## Production Notes

- Har subreddit ki **apni rules** hain — spam mat karo
- Naye accounts par posting restrictions ho sakti hain (karma minimum)
- `r/test` sirf development/testing ke liye — real audience ke liye relevant subreddit choose karo

---

*SMC — Reddit integration*
