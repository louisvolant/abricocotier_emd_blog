import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * EmDash's templates define both palettes with `light-dark()`. Lightning CSS,
 * which Astro uses in production builds, otherwise rewrites those colours into
 * variables tied to `prefers-color-scheme`, so the footer's manual light/dark
 * switcher stops working. The build must opt out of that transform.
 */

const config = readFileSync(
	new URL("../astro.config.mjs", import.meta.url),
	"utf8",
);
const manifest = JSON.parse(
	readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

test("lightningcss is a direct dev dependency", () => {
	assert.ok(
		manifest.devDependencies.lightningcss,
		"the build needs lightningcss to configure its CSS transform",
	);
});

test("the config imports Lightning CSS features", () => {
	assert.match(
		config,
		/import\s*\{\s*Features\s*\}\s*from\s*["']lightningcss["']/,
	);
});

test("Lightning CSS keeps light-dark() native", () => {
	assert.match(
		config,
		/lightningcss:\s*\{\s*exclude:\s*Features\.LightDark\s*\}/s,
		"excluding Features.LightDark keeps the manual theme switcher working",
	);
});
