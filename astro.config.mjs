import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2, sandbox } from "@emdash-cms/cloudflare";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import webhookNotifier from "@emdash-cms/plugin-webhook-notifier";
import { defineConfig, fontProviders } from "astro/config";
import emdash from "emdash/astro";

export default defineConfig({
	output: "server",
	adapter: cloudflare(),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			// The admin is only used in French. Listing `fr` leaves the other 30
			// catalogs out of the admin bundle, which keeps it small; `en` is always
			// shipped as the fallback for users whose browser asks for a language
			// that is not listed. An unknown code fails the build, so
			// `test/admin-locales.test.mjs` checks this list against the catalogs
			// EmDash actually ships.
			admin: { locales: ["fr"] },
			// `emdash` and `@emdash-cms/cloudflare` are released in lockstep: the
			// adapter depends on one exact `emdash` version. Installing a range that
			// resolves to two different copies makes the adapter run against a second
			// copy of the core, so both entries below must stay identical.
			// `test/emdash-lockstep.test.mjs` enforces this.
			// `coalesce` batches the reads a request issues together into one D1
			// round trip. Without it, a session runs its queries one at a time and
			// EmDash skips its start-of-request preload of settings, menus, widget
			// areas and taxonomy terms, which slows down every logged-out page
			// view. Caveat: a read and a write started together may run write-first,
			// so await a read before a write that must not affect it.
			database: d1({ binding: "DB", session: "auto", coalesce: true }),
			storage: r2({ binding: "MEDIA" }),
			plugins: [formsPlugin()],
			sandboxed: [webhookNotifier],
			sandboxRunner: sandbox(),
			// The legacy `marketplace` option is deprecated in EmDash 1.x.
			// Use the plugin registry instead; it is the default when a
			// sandbox runner is configured, but we set it explicitly here.
			registry: "https://registry.emdashcms.com",
		}),
	],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Inter",
			cssVariable: "--font-body",
			weights: [400, 500, 600, 700],
			fallbacks: ["sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "JetBrains Mono",
			cssVariable: "--font-mono",
			weights: [400, 500],
			fallbacks: ["monospace"],
		},
	],
	devToolbar: { enabled: false },
});
