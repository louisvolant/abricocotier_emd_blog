import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Widget options in a seed belong under `props`. EmDash accepts `settings` in
 * the schema but ignores it when applying the seed, and 1.2 started warning
 * about it — so options written there are silently lost. These tests keep every
 * widget on `props`, and check that the routes a widget can link to match the
 * routes the site actually serves.
 */

const seed = JSON.parse(
	readFileSync(new URL("../seed/seed.json", import.meta.url), "utf8"),
);

/** Routes defined by `src/pages`, as the pattern `/dir/:param`. */
const siteRoutes = [
	"/",
	"/posts",
	"/posts/:slug",
	"/category/:slug",
	"/tag/:slug",
	"/pages/:slug",
	"/search",
];

const widgets = seed.widgetAreas.flatMap((area) => area.widgets);

test("the seed defines widget areas", () => {
	assert.ok(widgets.length > 0, "the sidebar and footer areas should seed widgets");
});

test("no widget puts its options under the ignored settings key", () => {
	for (const widget of widgets) {
		assert.equal(
			widget.settings,
			undefined,
			`widget "${widget.title ?? widget.componentId}" uses settings; options belong under props`,
		);
	}
});

test("every component widget carries its options under props", () => {
	const componentWidgets = widgets.filter((widget) => widget.type === "component");

	assert.ok(componentWidgets.length > 0);
	for (const widget of componentWidgets) {
		assert.ok(
			widget.componentId?.startsWith("core:"),
			`unexpected widget component: ${widget.componentId}`,
		);
	}
});

test("the recent posts widget links to the post route the site serves", () => {
	const recentPosts = widgets.find((w) => w.componentId === "core:recent-posts");
	assert.ok(recentPosts, "the sidebar should keep a recent posts widget");

	// Without a urlTemplate the widget links to `/:slug`, which 404s here:
	// posts live under /posts/:slug.
	assert.equal(recentPosts.props.urlTemplate, "/posts/:slug");
	assert.ok(siteRoutes.includes(recentPosts.props.urlTemplate));
});

test("widget URL templates only use tokens the widget supports", () => {
	const supportedTokens = [":collection", ":id", ":slug", ":path"];

	for (const widget of widgets) {
		const template = widget.props?.urlTemplate;
		if (!template) continue;

		for (const token of template.match(/:\w+/g) ?? []) {
			assert.ok(
				supportedTokens.includes(token),
				`${token} is not a urlTemplate token (${template})`,
			);
		}
	}
});
