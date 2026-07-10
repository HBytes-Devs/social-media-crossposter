# LinkedIn Post Analytics Setup
## Social Media Crossposter (SMC)

Roman Urdu guide — impressions, likes (reactions), comments, reshares

---

## Pehle samjho

| Cheez | Detail |
|-------|--------|
| **Abhi SMC** | Post publish ✅ · Analytics fetch ❌ (code ready, API approval pending) |
| **LinkedIn API** | `memberCreatorPostAnalytics` |
| **Permission** | `r_member_postAnalytics` |
| **Product** | **Community Management API** (Development Tier pehle) |
| **Approval** | Manual — LinkedIn review karta hai |

Tumhari app ab sirf **`w_member_social`** se post karti hai. Analytics ke liye alag product + permission chahiye.

---

## Step 1 — LinkedIn Developer Portal

1. Kholo: [https://developer.linkedin.com](https://developer.linkedin.com)
2. Apni existing SMC app select karo (`Social Media Crossposter`)
3. **Products** tab kholo

---

## Step 2 — Community Management API apply karo

1. **Community Management API** dhundo
2. **Request access** / **Increasing access** link dabao
3. Agar grayed out ho:
   - Naya app banao (same company page ke sath) — FAQ #4 Microsoft docs
   - Ya [LinkedIn Developer Support](https://linkedin.zendesk.com/hc/en-us) par ticket kholo

**Docs:** [Community Management Overview](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview)

---

## Step 3 — Access Request Form (copy-paste)

### App / product name
```
Social Media Crossposter (SMC)
```

### Source code / platform link
```
https://github.com/Haseebcodejourney/social-media-crossposter
```

### Use case summary
```
SMC is a self-hosted dashboard where authenticated users compose posts (text + images) and publish to their own LinkedIn profile. We are requesting Community Management API access (Development Tier) to display post performance metrics — impressions, reactions, comments, and reshares — back to the user for posts they published through SMC.

This is read-only analytics for the member's own content. We do not scrape feeds, bulk-download member data, or post on behalf of users without explicit OAuth consent. Analytics helps creators understand which cross-posted content performs best.
```

### Detailed description
```
Workflow:
1. User logs into SMC (email/password + reCAPTCHA).
2. User connects LinkedIn via OAuth (existing w_member_social — publish).
3. User composes a post in SMC and publishes to LinkedIn.
4. SMC stores the LinkedIn post URN (platformPostId).
5. User opens the Posts page and clicks "View stats" to fetch metrics via memberCreatorPostAnalytics for that post only.

Metrics displayed: IMPRESSION, MEMBERS_REACHED, REACTION (likes), COMMENT, RESHARE.

Data usage:
- Only the authenticated member's own posts published through SMC.
- No third-party member profile data beyond aggregate engagement counts.
- Tokens stored encrypted; users can disconnect LinkedIn anytime.

Why Community Management API:
- memberCreatorPostAnalytics requires r_member_postAnalytics.
- Share on LinkedIn product alone does not include post analytics.
```

### How engagement is shown in the app
```
On the Posts page, each successfully published LinkedIn post shows a stats row:
- Impressions
- Reactions (likes)
- Comments
- Reshares
- Members reached

Users trigger a refresh manually to respect API rate limits. We do not auto-poll in the background in v1.
```

### OAuth redirect URI (already configured)
```
http://localhost:3001/api/v1/accounts/linkedin/callback
```

### Privacy policy URL (dev)
```
https://github.com/Haseebcodejourney/social-media-crossposter
```
*(Production mein proper privacy policy page add karna)*

---

## Step 4 — Demo video (Standard Tier ke liye)

Jab Development Tier approve ho, Standard Tier ke liye **screencast** chahiye:

| Scene | Dikhana hai |
|-------|-------------|
| 1 | SMC login |
| 2 | LinkedIn connect (OAuth) |
| 3 | Compose + publish post with image |
| 4 | Posts page → **View stats** → metrics dikhen |
| 5 | (Optional) Comment on LinkedIn post → SMC mein comment count |

**Review checklist:** [Community Management App Review](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-app-review)

---

## Step 5 — Approval ke baad code update

### 5a. LinkedIn adapter mein scope add karo

File: `backend/src/platforms/linkedin/linkedin.adapter.ts`

```typescript
const SCOPES = [
  "openid",
  "profile",
  "w_member_social",
  "r_member_postAnalytics",  // ← add after approval
  "email",
];
```

### 5b. LinkedIn dubara connect karo

Purana token mein naya scope nahi hoga:

1. SMC → **Accounts** → LinkedIn **Disconnect**
2. Phir **Connect** → permissions allow (nayi screen aayegi)
3. Purani posts par stats try karo

### 5c. Test script
```powershell
cd backend
npx tsx scripts/test-linkedin-analytics.ts <post-id>
```

---

## API reference (SMC backend)

| Endpoint | Kaam |
|----------|------|
| `GET /api/v1/posts/:id/analytics` | Per-target metrics (LinkedIn abhi) |

**Example response:**
```json
{
  "success": true,
  "data": {
    "postId": "...",
    "targets": [{
      "targetId": "...",
      "platform": "LINKEDIN",
      "platformPostId": "urn:li:share:...",
      "analytics": {
        "impressions": 120,
        "membersReached": 85,
        "reactions": 12,
        "comments": 3,
        "reshares": 1
      }
    }]
  }
}
```

---

## Rate limits (Development Tier)

| Limit | Value |
|-------|-------|
| Per app | 500 requests / day |
| Per member | 100 requests / day |

Har post = ~5 API calls (ek metric ke liye ek call). Zyada posts par manual refresh use karo.

---

## Common errors

| Error | Fix |
|-------|-----|
| `403` / `ACCESS_DENIED` | Community Management API approve nahi hui |
| `r_member_postAnalytics` missing | Scope add karo + reconnect LinkedIn |
| Invalid entity URN | Post dubara publish karo ya `platformPostId` check karo |
| Metrics `0` | Post abhi nayi hai — kuch ghante wait karo |

---

## Checklist

- [ ] Community Management API (Development Tier) apply
- [ ] LinkedIn approval email wait
- [ ] `r_member_postAnalytics` scope add
- [ ] LinkedIn disconnect + reconnect
- [ ] Post publish → Posts page → View stats test

---

*GitHub repo reviewers ke liye: https://github.com/Haseebcodejourney/social-media-crossposter*
