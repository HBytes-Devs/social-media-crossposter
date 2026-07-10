# Changelog

All notable changes to **Social Media Crossposter (SMC)** are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).  
Versioning follows [Semantic Versioning](https://semver.org/).

## Release channels

| Channel | Meaning | Example |
|---------|---------|---------|
| `alpha` | Internal / unstable | `0.8.0-alpha.1` |
| `beta` | Public testing, feature-complete-ish | `0.9.0-beta.1` |
| `rc` | Release candidate | `1.0.0-rc.1` |
| `stable` | Production-ready | `1.0.0` |

---

## [0.9.0-beta.1] - 2026-07-10

### Added
- Dashboard, calendar, and posts management (all, published, scheduled, drafts, trash)
- Post scheduling with background scheduler
- AI Assist: improve, smart hashtags, localize, smart suggest, auto-correct
- Settings: user-owned AI API keys with custom names (Claude, GPT, MiniMax, etc.)
- Auth UI with multi-language support (en, ur, roman-ur, hi)
- LinkedIn compose preview and image validation
- Password reset flow (backend + frontend)
- July 2026 deadline plan (`docs/JULY_2026_DEADLINE_PLAN.txt`)
- Product versioning manifest (`version.json`) and beta channel tracking

### Fixed
- Schedule post duplication (single submit, atomic scheduler claim)
- Translation partial-match bug in localize pipeline
- MUI icon import (`DeleteOutlined`)

### Changed
- Composer split into form + preview panels
- Posts grouped by platform only on "All" tab

---

## [0.1.0] - 2026-07-09

### Added
- Initial project scaffold (backend + frontend)
- LinkedIn OAuth and publish
- Prisma schema, JWT auth, S3 media upload
- Basic composer and accounts page

---

[0.9.0-beta.1]: https://github.com/Haseebcodejourney/social-media-crossposter/compare/35cf4f9...b48daad
[0.1.0]: https://github.com/Haseebcodejourney/social-media-crossposter/commit/35cf4f9
