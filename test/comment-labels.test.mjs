import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
	COMMENT_DATE_LOCALE,
	COMMENT_FORM_LABELS,
	COMMENT_LIST_LABELS,
} from "../src/utils/comment-labels.ts";

/**
 * EmDash silently falls back to English for any key omitted from the `labels`
 * prop of `Comments` / `CommentForm`, so a missing key is not a build error --
 * it is an English word on a French page. These tests pin the full key set and
 * reject wording that never left the English defaults.
 */

const COMMENT_LIST_KEYS = ["heading", "member", "like"];
const COMMENT_FORM_KEYS = [
	"name",
	"email",
	"comment",
	"submit",
	"submitting",
	"published",
	"pending",
	"error",
	"networkError",
];

/**
 * Wording copied from the components' English defaults in emdash 1.3.1, checked
 * as whole strings: "Comment" is a substring of the French "Commentaire", so a
 * substring test would flag the translation as untranslated.
 */
const ENGLISH_DEFAULTS = [
	"No comments yet",
	"1 Comment",
	"2 Comments",
	"Site member",
	"Like",
	"Name",
	"Email",
	"Comment",
	"Post Comment",
	"Submitting...",
	"Comment published",
	"Comment submitted for review",
	"Network error. Please try again.",
];

test("the comment list covers every label key", () => {
	assert.deepEqual(Object.keys(COMMENT_LIST_LABELS).sort(), [...COMMENT_LIST_KEYS].sort());
});

test("the comment form covers every label key", () => {
	assert.deepEqual(Object.keys(COMMENT_FORM_LABELS).sort(), [...COMMENT_FORM_KEYS].sort());
});

test("the comment heading agrees with the French number rule", () => {
	assert.equal(COMMENT_LIST_LABELS.heading(0), "Aucun commentaire");
	assert.equal(COMMENT_LIST_LABELS.heading(1), "1 commentaire");
	// French takes an -s from 2 upwards, unlike the English default.
	assert.equal(COMMENT_LIST_LABELS.heading(2), "2 commentaires");
	assert.equal(COMMENT_LIST_LABELS.heading(42), "42 commentaires");
});

test("the heading reports the count it is given", () => {
	for (const count of [1, 2, 7, 100]) {
		assert.match(COMMENT_LIST_LABELS.heading(count), new RegExp(`\\b${count}\\b`));
	}
});

test("no label is left at its English default", () => {
	const values = [
		COMMENT_LIST_LABELS.heading(0),
		COMMENT_LIST_LABELS.heading(1),
		COMMENT_LIST_LABELS.heading(2),
		COMMENT_LIST_LABELS.member,
		COMMENT_LIST_LABELS.like,
		...Object.values(COMMENT_FORM_LABELS),
	].map((value) => value.trim().toLowerCase());

	for (const english of ENGLISH_DEFAULTS) {
		assert.ok(
			!values.includes(english.toLowerCase()),
			`"${english}" is still the untranslated EmDash default`,
		);
	}
});

test("the date locale is a valid tag the comments component can format with", () => {
	assert.ok(COMMENT_DATE_LOCALE, "a locale is required, Comments falls back to en-US");
	assert.deepEqual(
		Intl.DateTimeFormat.supportedLocalesOf(COMMENT_DATE_LOCALE),
		[COMMENT_DATE_LOCALE],
	);
});

test("the post page passes the labels and the locale to the components", () => {
	const page = readFileSync(
		new URL("../src/pages/posts/[slug].astro", import.meta.url),
		"utf8",
	);

	assert.match(page, /<Comments[\s\S]*?labels=\{COMMENT_LIST_LABELS\}/);
	assert.match(page, /<Comments[\s\S]*?locale=\{COMMENT_DATE_LOCALE\}/);
	assert.match(page, /<CommentForm[\s\S]*?labels=\{COMMENT_FORM_LABELS\}/);
});
