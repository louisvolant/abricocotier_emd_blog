# Abricocotier v2

Personal blog built with [EmDash 1.2](https://github.com/emdash-cms/emdash) (Astro-based CMS), deployed on Cloudflare Workers. Live at [v2.abricocotier.fr](https://v2.abricocotier.fr).

## What's Included

- Featured post hero on the homepage
- Post archive with reading time estimates
- Category and tag archives
- Full-text search
- RSS feed
- SEO metadata and JSON-LD, including per-page metadata for static pages
- Dark/light mode
- In-context visual editing for signed-in editors
- Footer links to the author's Personal Page and Portfolio next to the "Powered by EmDash" credit
- Forms plugin and sandboxed webhook notifier
- Plugin registry support (`registry.emdashcms.com`)

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
- **CMS:** EmDash `1.2.0` with `@emdash-cms/cloudflare` `1.2.0`

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

Plugins are resolved through the EmDash plugin registry (`registry.emdashcms.com`, configured in `astro.config.mjs`). The legacy `marketplace` option was deprecated in EmDash 1.x and is no longer used. `@emdash-cms/plugin-forms` runs as a native plugin; the webhook notifier runs sandboxed and is skipped while no Worker Loader binding is configured.

Before the first deploy, set the `EMDASH_ENCRYPTION_KEY` variable on the Worker (same value as your local `.env`), otherwise content encrypted locally cannot be decrypted in production.

## Updating EmDash

Update the EmDash packages together and rebuild:

```bash
pnpm up --latest emdash @emdash-cms/cloudflare @emdash-cms/plugin-forms @emdash-cms/plugin-webhook-notifier
pnpm build
```

`emdash` and `@emdash-cms/cloudflare` are released in lockstep and must share the same version. Pending core migrations run on the first request after the new build is deployed.

When editing `seed/seed.json`, widget options belong under `props`. Since EmDash 1.2, a widget's `settings` key is ignored during seeding; validate the file with `pnpm exec emdash seed --validate`.

## Manual Deploy

```bash
pnpm deploy   # astro build && wrangler deploy
```
