# Instagram Setup (Meta Graph API)
## Social Media Crossposter (SMC)

Roman Urdu guide — step by step

---

## Pehle yeh confirm karo (Zaroori!)

Instagram API sirf **Business** ya **Creator** accounts ke liye hai — personal IG nahi chalega.

| Requirement | Kaise check karein |
|-------------|-------------------|
| Instagram Business/Creator | IG app → Settings → Account type |
| Facebook Page linked | IG Settings → Business → Connect Facebook Page |
| Facebook account | Meta developer login ke liye |

> Agar personal account hai: IG → Settings → **Switch to professional account** → Business ya Creator choose karo → Facebook Page link karo.

---

## Step 1 — Meta Developer Account

1. Kholo: [https://developers.facebook.com](https://developers.facebook.com)
2. Facebook account se **login** karo
3. **My Apps** → **Create App**

---

## Step 2 — App Type Choose Karo

| Field | Value |
|-------|-------|
| **Use case** | **Other** ya **Business** |
| **App name** | `Social Media Crossposter` (ya `SMC`) |
| **App contact email** | Apna email |
| **Business portfolio** | Optional (skip kar sakte ho dev ke liye) |

**Create app** dabao.

---

## Step 3 — Products Add Karo

App Dashboard → **Add Products**:

| Product | Kyun chahiye |
|---------|--------------|
| **Instagram** (Instagram Graph API) | Post publish |
| **Facebook Login for Business** | OAuth login |

Har product par **Set up** dabao.

---

## Step 4 — Facebook Login Settings

**Facebook Login** → **Settings** → **Valid OAuth Redirect URIs** mein **dono** URLs add karo:

```
http://localhost:3001/api/v1/accounts/facebook/callback
http://localhost:3001/api/v1/accounts/instagram/callback
```

**Save Changes** dabao.

---

## Step 5 — Instagram Product Settings

**Instagram** → **API setup with Instagram login** (ya Basic Display nahi — **Graph API** use karo)

Permissions jo SMC use karta hai:
- `instagram_basic`
- `instagram_content_publish`
- `pages_show_list`
- `pages_read_engagement`

---

## Step 6 — App ID + Secret Copy Karo

**App settings** → **Basic**:

| Field | `.env` variable |
|-------|-----------------|
| **App ID** | `META_APP_ID` |
| **App Secret** (Show dabao) | `META_APP_SECRET` |

---

## Step 7 — `.env` Mein Daalo

`backend/.env`:

```env
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here
META_REDIRECT_URI=http://localhost:3001/api/v1/accounts/facebook/callback
META_INSTAGRAM_REDIRECT_URI=http://localhost:3001/api/v1/accounts/instagram/callback
```

Backend restart:
```powershell
cd backend
npm run dev
```

---

## Step 8 — Test Users (Dev Mode)

Development mode mein sirf **app roles** wale users connect kar sakte hain:

1. App Dashboard → **App roles** → **Roles**
2. Apna Facebook account ko **Administrator** ya **Developer** banao
3. Instagram account jo connect karna hai — wohi Facebook user hona chahiye jiska IG Business account linked Page se connected ho

---

## Step 9 — Instagram Connect Karo

**Option A — Browser (SMC UI):**
1. Frontend chalao: `http://localhost:5173`
2. Login karo
3. **Accounts** → **Instagram** → **Connect**
4. Facebook login → permissions allow karo
5. Success page aana chahiye

**Option B — Script:**
```powershell
cd backend
npx tsx scripts/instagram-connect-url.ts
```
Output URL browser mein kholo.

---

## Step 10 — Test Post

1. **Compose** page kholo
2. **Kam az kam 1 image** add karo (Instagram bina image ke post nahi karta)
3. Caption likho
4. Sirf **Instagram** account select karo
5. **Publish Now**

---

## Common Errors

| Error | Fix |
|-------|-----|
| `No Instagram Business account linked` | IG ko Facebook Page se link karo |
| `Invalid OAuth redirect URI` | Step 4 URLs exact match karo |
| `App not authorized` | Dev mode: app role add karo; Production: App Review |
| Image publish fail | Image required; S3 configured hona chahiye |
| `instagram_content_publish` denied | App Review submit karo (production ke liye) |

---

## App Review (Production)

Public users ke liye Meta **App Review** chahiye:

1. **instagram_content_publish** — Advanced Access request
2. **pages_show_list**, **pages_read_engagement** — as needed
3. Demo video: compose → image upload → publish flow
4. Privacy policy URL (GitHub repo ya hosted page)

Dev/testing ke liye App Review **zaroori nahi** — sirf app admins/developers/testers.

---

## Technical Notes

- Instagram posts **image required** (text-only nahi)
- Caption limit: **2200 characters**
- Rate limit: ~**25 posts / 24 hours** per IG account
- SMC private S3 images ko publish time par **presigned URL** se Meta ko deta hai
- Facebook Page posting alag flow hai — same Meta app use hoti hai

---

## Quick Checklist

- [ ] IG Business/Creator account
- [ ] Facebook Page linked to IG
- [ ] Meta app created
- [ ] Facebook Login + Instagram products added
- [ ] Redirect URIs set (facebook + instagram callbacks)
- [ ] `META_APP_ID` + `META_APP_SECRET` in `.env`
- [ ] Backend + frontend running
- [ ] Instagram connected in Accounts page
- [ ] Test post with image
