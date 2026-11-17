import { getI18nConfig } from "emdash";

/** The site is French-only; this is the fallback when Astro i18n is unset. */
const DEFAULT_SITE_LOCALE = "fr";

/**
 * The default locale from the site's Astro `i18n` config, if it names a
 * language this runtime can format. Falls back to the site's own language.
 */
export function getSiteLocale(): string | undefined {
	const locale = getI18nConfig()?.defaultLocale ?? DEFAULT_SITE_LOCALE;
	try {
		return Intl.DateTimeFormat.supportedLocalesOf(locale)[0];
	} catch {
		// Malformed tags such as "pt_BR" throw instead of matching nothing.
		return DEFAULT_SITE_LOCALE;
	}
}

/** Formats a date in the site's locale. */
export function formatDate(date: Date, month: "long" | "short"): string {
	return date.toLocaleDateString(getSiteLocale() ?? DEFAULT_SITE_LOCALE, {
		year: "numeric",
		month,
		day: "numeric",
	});
}
