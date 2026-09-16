# Abricocotier v2

Personal blog built with [EmDash](https://github.com/emdash-cms/emdash) (Astro-based CMS), deployed on Cloudflare Workers. Live at [v2.abricocotier.fr](https://v2.abricocotier.fr).

## What's Included

- Featured post hero on the homepage
- Post archive with reading time estimates
- Category and tag archives
- Full-text search
- RSS feed
- SEO metadata and JSON-LD
- Dark/light mode
- Forms plugin and webhook notifier

## Pages

| Page | Route |
|---|---|
| Homepage | `/` |
| All posts | `/posts` |
| Single post | `/posts/:slug` |
| Category archive | `/category/:slug` |
| Tag archive | `/tag/:slug` |
| Search | `/search` |
| Static pages | `/pages/:slug` |
| 404 | fallback |

The admin UI lives at `/_emdash/admin`.

## Infrastructure

- **Runtime:** Cloudflare Workers (worker name: `abricocotier-v2`)
- **Database:** D1 (`abricocotier-v2-d1`)
- **Storage:** R2 (`abricocotier-v2-r2`, bound as `MEDIA`)
- **Framework:** Astro with `@astrojs/cloudflare`

## Local Development

```bash
pnpm install
pnpm dev
```

The admin is available at `http://localhost:4321/_emdash/admin`. Copy `.env.example` to `.env` and set a real `EMDASH_ENCRYPTION_KEY` (a key is generated automatically at scaffold time).

## Deployment

The repo is connected to Cloudflare Workers Builds: pushing to the tracked branch builds (`pnpm build`) and deploys automatically. No local `wrangler deploy` needed.

Configuration notes (see `wrangler.jsonc`):

- `keep_vars: true` — environment variables and secrets set in the Cloudflare dashboard survive deployments.
- `worker_loaders` is commented out (free plan). Sandboxed plugins (webhook notifier) need it on paid plans — re-enable if you upgrade.
- The D1 binding is `DB`, the R2 binding is `MEDIA`.

Before the first deploy, set the `EMDASH_ENCRYPTION_KEY` variable on the Worker (same value as your local `.env`), otherwise content encrypted locally cannot be decrypted in production.

## Manual Deploy

```bash
pnpm deploy   # astro build && wrangler deploy
```
