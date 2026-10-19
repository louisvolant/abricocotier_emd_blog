import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * The Cloudflare templates ship `d1({ session: "auto", coalesce: true })`, and
 * EmDash 1.3 stopped preloading site settings, menus, widget areas and taxonomy
 * terms when `coalesce` is off. Dropping the flag silently costs every
 * logged-out page view a round trip per query, so it is asserted here rather
 * than left to a comment in the config.
 */

const config = readFileSync(
	new URL("../astro.config.mjs", import.meta.url),
	"utf8",
);

const databaseCall = config.match(/database:\s*d1\(\{([^}]*)\}\)/s);

test("the EmDash database is a D1 binding", () => {
	assert.ok(databaseCall, "astro.config.mjs must configure a d1() database");
	assert.match(databaseCall[1], /binding:\s*"DB"/);
});

test("D1 reads use a session so replicas can serve anonymous traffic", () => {
	assert.match(
		databaseCall[1],
		/session:\s*"(auto|primary-first)"/,
		"a session mode is required for read replication to be used",
	);
});

test("D1 session reads are coalesced into a single round trip", () => {
	assert.match(
		databaseCall[1],
		/coalesce:\s*true/,
		"coalesce: true batches a request's reads and re-enables the settings preload",
	);
});
