import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * EmDash's video block renders a raw <video> with the browser's own player.
 * Browsers style `<video>` inline at its intrinsic width, so without these
 * rules a landscape video in a post escapes the 680px reading column and sits
 * on the text baseline. The rules live in the shared prose stylesheet, used by
 * both post and page bodies.
 */

const styles = readFileSync(
	new URL("../src/styles/prose.css", import.meta.url),
	"utf8",
);

const videoRule = styles.match(/\.prose\s+video\s*\{([^}]*)\}/);

test("the article body styles video blocks", () => {
	assert.ok(videoRule, "the prose stylesheet must have a rule for .prose video");
});

test("video blocks cannot overflow the reading column", () => {
	const declarations = videoRule[1];

	assert.match(declarations, /display:\s*block/, "an inline video sits on the text baseline");
	assert.match(declarations, /max-width:\s*100%/);
	assert.match(declarations, /width:\s*100%/);
	assert.match(declarations, /height:\s*auto/, "otherwise the player keeps its intrinsic ratio height");
});

test("video blocks are inset like the other block-level media", () => {
	assert.match(videoRule[1], /margin-block:\s*2em/);
	assert.match(videoRule[1], /border-radius:\s*var\(--radius-lg\)/);
});

test("an empty video block collapses instead of leaving a gap", () => {
	// A video block saved without an asset renders nothing, so it should not
	// leave the block margins behind either.
	assert.match(styles, /\.prose\s+video:empty\s*\{\s*display:\s*none;/);
});
