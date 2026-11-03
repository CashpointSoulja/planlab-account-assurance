# Deployment

## Live

| | URL |
|---|---|
| **Production** | https://planlab-account-assurance.pages.dev/ |
| **This deployment (immutable)** | https://cb9ab1eb.planlab-account-assurance.pages.dev |

## What was deployed

| Item | Value |
|---|---|
| Host | Cloudflare Pages, free tier, project `planlab-account-assurance` |
| Source | Branch `claude/tender-curie-qvywq2` at commit `8e97fc8` |
| Build | `npm run build`, which writes the static site to `dist/` |
| Upload | `npx wrangler pages deploy dist --project-name planlab-account-assurance` (Wrangler direct upload) |
| Files | Wrangler reported 11 files uploaded. `dist/` holds 12 entries; the difference is most likely `_headers`, which Pages reads as configuration rather than serving as a file. |
| Server-side code | None: no Functions, KV, D1, environment variables or secrets |
| Cost | None: free tier, no paid plan or service |
| Date | 3 November 2026 |

The deployment is a direct upload, not a Git integration, so `main` does not need to change for the site to publish. The deployed build comes from the working branch.

## Independent checks on the live host

I ran these myself, outside the build environment, on 3 November 2026.

1. **Clean install and full suite at `8e97fc8`.** `npm ci` followed by `npm test`: 25 of 25 passed.
2. **Browser tests against production.** I adapted all 17 browser tests in `tests/e2e.test.mjs` to run against https://planlab-account-assurance.pages.dev/ instead of the local server: 17 of 17 passed.

The production-origin version of the browser tests was a local adaptation and is not committed here. The committed suite runs against a local build.

## What the build environment could not check

The environment used to build and test this repository cannot reach `pages.dev` (requests return no response). Every check against the live site above was done independently, outside that environment.

## Redeploy

```bash
npm ci
```

```bash
npm run build && npx wrangler pages deploy dist --project-name planlab-account-assurance
```

Each deploy gets its own immutable URL; production follows the latest deploy.
