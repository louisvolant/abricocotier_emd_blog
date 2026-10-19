import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * `emdash` and `@emdash-cms/cloudflare` are published in lockstep: the Cloudflare
 * adapter depends on one exact `emdash` version. Letting the two ranges drift
 * apart installs a second copy of the core that the adapter never runs against,
 * which EmDash now warns about at `astro build` / `astro dev` time.
 *
 * These tests read the installed trees rather than pinning a version number, so
 * they keep holding after the next upgrade without being edited.
 */

const readJson = (relativePath) =>
	JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8"));

const manifest = readJson("../package.json");
const installedCore = readJson("../node_modules/emdash/package.json");
const installedAdapter = readJson("../node_modules/@emdash-cms/cloudflare/package.json");

test("package.json declares the same range for emdash and its Cloudflare adapter", () => {
	const core = manifest.dependencies.emdash;
	const adapter = manifest.dependencies["@emdash-cms/cloudflare"];

	assert.equal(core, adapter, "emdash and @emdash-cms/cloudflare must share one range");
	assert.match(core, /^\^?\d+\.\d+\.\d+$/, "a pinned or caret range is expected");
});

test("the installed emdash core matches the version the adapter is built against", () => {
	assert.equal(
		installedAdapter.version,
		installedCore.version,
		"the adapter and the core must be the same release",
	);
	assert.equal(
		installedAdapter.dependencies.emdash,
		installedCore.version,
		"the adapter pins an exact emdash version, so a mismatched core means two copies are installed",
	);
});
