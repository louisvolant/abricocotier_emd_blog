import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";

/**
 * EmDash 1.2 added `admin.locales`, which drops every catalog that is not
 * listed from the admin bundle. An unknown code does not warn: the build fails
 * and reports the available codes. The configured codes are therefore checked
 * against the catalogs the installed `@emdash-cms/admin` really ships, so the
 * failure shows up in `pnpm test` rather than in CI.
 */

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const config = readFileSync(new URL("../astro.config.mjs", import.meta.url), "utf8");
const localesBlock = config.match(/admin:\s*\{\s*locales:\s*\[([^\]]*)\]/);

/**
 * `@emdash-cms/admin` is a transitive dependency, so it lives in the pnpm
 * virtual store rather than at the root of `node_modules`.
 */
function resolveAdminManifest() {
	const store = new URL("../node_modules/.pnpm/", import.meta.url);
	const emdashStore = readdirSync(store).find((entry) => entry.startsWith("emdash@"));
	assert.ok(emdashStore, "the pnpm virtual store should hold the emdash package");

	const manifest = `${store.pathname}${emdashStore}/node_modules/@emdash-cms/admin/dist/locales-manifest.json`;
	assert.ok(
		existsSync(manifest),
		`@emdash-cms/admin should ship a locale manifest at ${manifest}`,
	);

	return readJson(manifest).locales;
}

test("the admin bundle is limited to a list of locales", () => {
	assert.ok(localesBlock, "astro.config.mjs must set admin.locales");

	const codes = [...localesBlock[1].matchAll(/["']([^"']+)["']/g)].map(([, code]) => code);
	assert.ok(codes.length > 0, "admin.locales must not be empty");
	assert.deepEqual(codes, ["fr"], "the admin is only used in French");
});

test("every configured admin locale is a catalog EmDash ships", () => {
	const shipped = Object.keys(resolveAdminManifest());
	const configured = [...localesBlock[1].matchAll(/["']([^"']+)["']/g)].map(([, code]) => code);

	for (const code of configured) {
		assert.ok(
			shipped.includes(code),
			`EmDash ships no "${code}" catalog; available: ${shipped.join(", ")}`,
		);
	}
});

test("limiting the locales leaves English available as the fallback", () => {
	const shipped = Object.keys(resolveAdminManifest());
	const configured = [...localesBlock[1].matchAll(/["']([^"']+)["']/g)].map(([, code]) => code);

	assert.ok(
		!configured.includes("en"),
		"EmDash always bundles English, so listing it only widens the admin",
	);
	assert.ok(shipped.includes("en"), "English is the fallback for unlisted locales");
});
