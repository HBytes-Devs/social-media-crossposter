# SMC Versioning & Release Tracking

**Current release:** `1.0.0-rc.1` (Release Candidate)  
**Target stable:** `1.0.0` — end of July 2026 (see `JULY_2026_DEADLINE_PLAN.txt`)

---

## Single source of truth

All apps read from the repo root file:

```
version.json
```

Update **only** this file when bumping versions. Then update `CHANGELOG.md`.

| Field | Purpose |
|-------|---------|
| `version` | Semver base (`0.9.0`) |
| `channel` | `alpha` \| `beta` \| `rc` \| `stable` |
| `prerelease` | e.g. `beta.1`, `rc.2`, or `null` for stable |
| `fullVersion` | Display string (`0.9.0-beta.1`) |
| `apiVersion` | URL prefix (`v1` → `/api/v1`) |
| `codename` | Marketing / internal name |
| `releaseDate` | ISO date of this release |

---

## Version roadmap (2026)

| Version | Channel | Target | Focus |
|---------|---------|--------|-------|
| **0.9.0-beta.1** | Beta | 10 Jul | Core v1 features, Maria testing |
| **0.9.0-beta.2** | Beta | 11 Jul | Phase 2 polish — retry, mobile, token alerts |
| **0.9.0-beta.4** | Beta | 11 Jul | Phase 4 — analytics, calendar polish |
| **1.0.0-rc.1** | RC | 11 Jul | Phase 5 — deploy configs, docs, staging ready |
| **1.0.0** | Stable | 31 Jul | Month-end launch |

### After 1.0 (professional product)

| Version | Type | Examples |
|---------|------|----------|
| 1.1.0 | Minor | Analytics dashboard, post templates |
| 1.2.0 | Minor | Team workspaces, more platforms |
| 2.0.0 | Major | Video, billing, breaking API changes |

---

## How to bump version

1. Edit `version.json` (increment `prerelease` or `version`)
2. Add section to `CHANGELOG.md` under `[Unreleased]` or new heading
3. Sync `backend/package.json` and `frontend/package.json` `version` to match `fullVersion` base
4. Commit: `chore(release): bump to 0.9.0-beta.2`
5. Tag (optional): `git tag v0.9.0-beta.2 && git push origin v0.9.0-beta.2`

### Beta → RC → Stable

```
0.9.0-beta.1  →  0.9.0-beta.2  →  1.0.0-rc.1  →  1.0.0
     ↑ beta iterations              ↑ freeze features   ↑ launch
```

---

## Where version appears

| Location | File |
|----------|------|
| API root | `GET /api/v1/` |
| Health | `GET /api/v1/health` |
| Version endpoint | `GET /api/v1/version` |
| App sidebar | `VersionBadge` in Layout |
| Settings page | About / version card |

---

## Branch ↔ version mapping (suggested)

| Branch | Purpose |
|--------|---------|
| `master` | Latest integrated code |
| `testing/maria` | QA / beta testing |
| `release/0.9.x` | Beta release fixes only |
| `release/1.0.0` | RC and stable cut |

---

## Feature tracking

Use `CHANGELOG.md` sections:

- **Added** — new features
- **Changed** — behaviour changes
- **Fixed** — bug fixes
- **Deprecated** — soon to remove
- **Removed** — removed
- **Security** — security fixes

Link PRs/issues in changelog when possible.

---

*Last updated: 10 July 2026*
