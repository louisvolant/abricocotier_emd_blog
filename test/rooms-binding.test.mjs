import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * EmDash 1.5 adds co-editing rooms backed by one Durable Object per edited
 * entry. The feature stays off until `coEditing` is enabled, but the Worker has
 * to declare and re-export the class for the binding to resolve.
 */

const wrangler = readFileSync(
	new URL("../wrangler.jsonc", import.meta.url),
	"utf8",
);
const worker = readFileSync(
	new URL("../src/worker.ts", import.meta.url),
	"utf8",
);

test("wrangler binds the co-editing Durable Object", () => {
	assert.match(wrangler, /"name":\s*"EMDASH_ROOMS"/);
	assert.match(wrangler, /"class_name":\s*"EmDashRoom"/);
});

test("wrangler exports the SQLite-backed room class", () => {
	assert.match(
		wrangler,
		/"EmDashRoom":\s*\{\s*"type":\s*"durable-object",\s*"storage":\s*"sqlite"\s*\}/s,
	);
});

test("the Worker entrypoint re-exports the room class", () => {
	assert.match(worker, /export\s*\{[^}]*\bEmDashRoom\b[^}]*\}/s);
});
