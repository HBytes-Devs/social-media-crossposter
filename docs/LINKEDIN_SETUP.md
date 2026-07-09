# LinkedIn Developer App Setup
## Social Media Crossposter (SMC)

Roman Urdu guide — step by step

---

## Step 1 — LinkedIn Developer Account

1. Kholo: [https://developer.linkedin.com](https://developer.linkedin.com)
2. Apne LinkedIn account se **login** karo (Hamza Haseeb wala)
3. **Create app** dabao

---

## Step 2 — App Details Bharo

| Field | Value |
|-------|-------|
| **App name** | `Social Media Crossposter` (ya `SMC`) |
| **LinkedIn Page** | Apna company page select karo (agar nahi hai to personal page banao — LinkedIn require karta hai) |
| **Privacy policy URL** | `http://localhost:3001` (dev ke liye OK) |
| **App logo** | Koi bhi logo upload karo |

**Create app** dabao → verification ho sakti hai (email confirm).

---

## Step 3 — Products Add Karo (Zaroori!)

App dashboard → **Products** tab:

| Product | Kaam | Action |
|---------|------|--------|
| **Sign In with LinkedIn using OpenID Connect** | Login / user info | **Request access** |
| **Share on LinkedIn** | Post publish karna | **Request access** |

> Dev mode mein apne account par test kar sakte ho. Production ke liye LinkedIn review chahiye.

---

## Step 4 — OAuth Redirect URL Set Karo

App → **Auth** tab → **OAuth 2.0 settings**

**Authorized redirect URLs** mein yeh **exact** URL add karo:

```
http://localhost:3001/api/v1/accounts/linkedin/callback
```

**Update** dabao.

---

## Step 5 — Client ID + Secret Copy Karo

App → **Auth** tab:

| Field | `.env` variable |
|-------|-----------------|
| **Client ID** | `LINKEDIN_CLIENT_ID` |
| **Client Secret** | `LINKEDIN_CLIENT_SECRET` |

---

## Step 6 — `.env` Mein Daalo

`backend/.env` file:

```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:3001/api/v1/accounts/linkedin/callback
```

Backend restart karo:
```powershell
cd backend
npm run dev
```

---

## Step 7 — Connect Karo (Browser Se)

### 7a. Pehle login karo — JWT token lo

```powershell
$login = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -Body '{"email":"haseebcodejourney@gmail.com","password":"SMC@Hamza2026!"}' -ContentType "application/json"
$token = $login.data.token
Write-Host $token
```

### 7b. Browser mein yeh URL kholo

```
http://localhost:3001/api/v1/accounts/linkedin/connect?token=PASTE_TOKEN_HERE
```

`PASTE_TOKEN_HERE` ki jagah apna JWT token daalo.

### 7c. LinkedIn login + Allow

LinkedIn permission screen aayega → **Allow** dabao.

### 7d. Success!

Green page dikhega: **"LINKEDIN Connected!"**

---

## Step 8 — Verify Karo

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/accounts" -Headers @{ Authorization = "Bearer $token" }
```

Expected:
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "platform": "LINKEDIN",
        "accountName": "Hamza Haseeb",
        "isActive": true
      }
    ]
  }
}
```

---

## API Endpoints Summary

| Method | URL | Kaam |
|--------|-----|------|
| `GET` | `/api/v1/accounts/linkedin/status` | LinkedIn configured hai? |
| `GET` | `/api/v1/accounts/linkedin/connect?token=JWT` | Browser se connect |
| `GET` | `/api/v1/accounts/linkedin/connect-url` | JSON mein auth URL (Bearer token) |
| `GET` | `/api/v1/accounts/linkedin/callback` | LinkedIn redirect (auto) |
| `GET` | `/api/v1/accounts` | Connected accounts list |
| `DELETE` | `/api/v1/accounts/:id` | Disconnect |

---

## Common Errors

| Error | Fix |
|-------|-----|
| `redirect_uri_mismatch` | Redirect URL exact match karo (no trailing slash) |
| `invalid_client` | Client ID / Secret check karo |
| `unauthorized_scope` | "Share on LinkedIn" product add karo |
| `401 Authentication required` | Token missing — URL mein `?token=` add karo |
| LinkedIn page required | Company/personal page link karo app se |

---

## Scopes Jo Use Ho Rahe Hain

```
openid profile email w_member_social
```

- `openid` + `profile` + `email` → user info
- `w_member_social` → post publish karna

---

*Setup complete hone ke baad agla step: Posts API — LinkedIn par publish!*
