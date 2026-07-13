# Contributing to Social Media Crossposter

This project is maintained by **[HBytes Devs](https://github.com/HBytes-Devs)**. We use GitHub for code, issues, pull requests, and **Discussions** for planning and Q&A.

## How we work

| Channel | Use for |
|---------|---------|
| [Discussions](https://github.com/HBytes-Devs/social-media-crossposter/discussions) | Questions, ideas, roadmap talk, announcements |
| [Issues](https://github.com/HBytes-Devs/social-media-crossposter/issues) | Confirmed bugs and scoped feature work |
| Pull requests | Code changes with a linked issue when possible |

## Branching

- `master` — production-ready; protected deploys run from here
- Feature branches — `feat/short-description` or `fix/short-description`
- Open PRs against `master`; keep commits focused and reviewable

## Local development

See [README.md](README.md) for setup. Before opening a PR:

```bash
# Backend
cd backend && npm run lint && npm run test && npm run build

# Frontend
cd frontend && npm run lint && npm run test && npm run build
```

## Code standards

- Match existing patterns in the file you edit
- No secrets in commits (`.env` stays local)
- Run migrations when schema changes: `cd backend && npm run db:migrate`
- Update `CHANGELOG.md` for user-visible changes when appropriate

## Reviews

- At least one team review before merge when possible
- Address CI failures before requesting re-review
- Be constructive in review comments — we're building in public as a team

## Security

Do **not** open public issues for vulnerabilities. Use [GitHub Security Advisories](https://github.com/HBytes-Devs/social-media-crossposter/security/advisories/new) or contact the org owners privately.

## Questions?

Start a [Discussion](https://github.com/HBytes-Devs/social-media-crossposter/discussions/new/choose) — category **Q&A** or **Ideas**.
