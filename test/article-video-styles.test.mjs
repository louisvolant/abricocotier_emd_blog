import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * EmDash 1.2 added a built-in video block that `PortableText` renders with the
 * browser's own player. Browsers style `<video>` inline at its intrinsic width,
 * so without these rules a landscape video in a post escapes the 680px reading
 * column and sits on the text baseline. The rules live in the page's scoped
 * <style>, where nothing else would catch a regression.
 */

const page = readFileSync(new URL("../src/pages/posts/[slug].astro", import.meta.url), "utf8");

const videoRule = page.match(/\.article-content\s*:global\(video\)\s*\{([^}]*)\}/);

test("the article body styles video blocks", () => {
	assert.ok(videoRule, "the article stylesheet must have a rule for :global(video)");
});

test("video blocks cannot overflow the reading column", () => {
	const declarations = videoRule[1];

	assert.match(declarations, /display:\s*block/, "an inline video sits on the text baseline");
	assert.match(declarations, /max-width:\s*100%/);
	assert.match(declarations, /width:\s*100%/);
	assert.match(declarations, /height:\s*auto/, "otherwise the player keeps its intrinsic ratio height");
});

test("video blocks are inset like the other block-level media", () => {
	assert.match(videoRule[1], /margin:\s*2em 0/);
	assert.match(videoRule[1], /border-radius:\s*var\(--radius-lg\)/);
});

test("an empty video block collapses instead of leaving a gap", () => {
	// A video block saved without an asset renders nothing, so it should not
	// leave the block margins behind either.
	assert.match(page, /\.article-content\s*:global\(video:empty\)\s*\{\s*display:\s*none;/);
});
