# Abricocotier v2

Personal blog built with [EmDash 1.3.1](https://github.com/emdash-cms/emdash) (Astro-based CMS), deployed on Cloudflare Workers. Live at [v2.abricocotier.fr](https://v2.abricocotier.fr).

## What's Included

- Featured post hero on the homepage
- Post archive with reading time estimates
- Category and tag archives
- Full-text search
- RSS feed
- SEO metadata and JSON-LD, including per-page metadata for static pages
- Dark/light mode
- In-context visual editing for signed-in editors
- French comment UI (labels, statuses and dates) on post pages
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

## Comments

`Comments` and `CommentForm` from `emdash/ui/comments` ship English text and format dates in `en-US`. EmDash 1.2 added a `labels` prop to both components and a `locale` prop to `Comments`, and `src/pages/posts/[slug].astro` uses them so a French reader never sees an English label next to their own comment:

- `src/utils/comment-labels.ts` holds the French wording and `COMMENT_DATE_LOCALE`.
- `COMMENT_LIST_LABELS` covers `Comments`: the `heading` callback receives the approved comment count, so 0, 1 and *n* comments each read correctly in French.
- `COMMENT_FORM_LABELS` covers every `CommentForm` key, including the two different success messages — `published` when a comment is approved immediately, `pending` when it waits for moderation.

A key left out of `labels` is not an error: the component silently falls back to its English default. `test/comment-labels.test.mjs` asserts the full key set and rejects any value that is still an English default.

## Infrastructure

- **Runtime:** Cloudflare Workers (worker name: `abricocotier-v2`)
- **Database:** D1 (`abricocotier-v2-d1`)
- **Storage:** R2 (`abricocotier-v2-r2`, bound as `MEDIA`)
- **Framework:** Astro with `@astrojs/cloudflare`
- **CMS:** EmDash `1.3.1` with `@emdash-cms/cloudflare` `1.3.1`
- **Database options:** `d1({ binding: "DB", session: "auto", coalesce: true })` — reads use the D1 Sessions API so anonymous visitors can be served by the nearest replica, and `coalesce` batches the reads of one request into a single round trip (EmDash 1.3 skips its start-of-request settings/menu/widget/taxonomy preload without it). Because it is experimental, a read and a write started together may run write-first: await a read before a write that must not affect it. See [Read replicas](https://docs.emdashcms.com/deployment/database/#read-replicas).

## Local Development

```bash
pnpm install
pnpm dev
pnpm test      # node --test, no test framework to install
pnpm typecheck # astro check
```

The admin is available at `http://localhost:4321/_emdash/admin`. Copy `.env.example` to `.env` and set a real `EMDASH_ENCRYPTION_KEY` (a key is generated automatically at scaffold time).

Tests live in `test/` and run on Node's built-in runner. They cover what a build cannot: the EmDash/D1 configuration, the lockstep package versions, the widget seed, and the label and stylesheet contracts the templates rely on.

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
pnpm test
pnpm build
```

`emdash` and `@emdash-cms/cloudflare` are released in lockstep and must share the same version: the adapter pins one exact `emdash` release, so a drifting range installs a second copy of the core that the adapter never runs against. EmDash warns about it during `astro build` and `astro dev`; `test/emdash-lockstep.test.mjs` fails the same drift before that.

### Migrating the database

This site runs on Cloudflare Workers with `session: "auto"`, so pending core migrations normally run on the first request after a new build is deployed. **Upgrading from EmDash 0.38 or earlier is the exception**: the data migrations added since then rewrite every entry and revision, which is too much work for a single request. From 1.3.1 on, the Worker answers `503` instead of serving content without it, and never starts that migration itself.

Apply those migrations from the CLI, before deploying the new build:

```bash
pnpm emdash migrate
```

The command resumes from the last written batch if it is interrupted, so it is safe to re-run. If the Worker logs a stuck migration lock, release it first with `pnpm emdash migrate --release-lock`; use `--take-over-lock <id>` to apply under a lock you cannot release from the admin. See [Core migrations](https://docs.emdashcms.com/deployment/core-migrations/).

## Manual Deploy

```bash
pnpm deploy   # astro build && wrangler deploy
```
