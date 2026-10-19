/**
 * French labels for the comment components of `emdash/ui/comments`.
 *
 * EmDash 1.2 added a `labels` prop to `Comments` and `CommentForm`, plus a
 * `locale` prop on `Comments` that formats comment dates. Until then both
 * components were hard-coded to English and to `en-US`, which stood out on a
 * French blog: a reader who wrote a comment in French saw "Post Comment" and
 * an English date under their own text.
 *
 * Every key a component accepts is set here. A key that is missing keeps the
 * component's English default, so `test/comment-labels.test.mjs` fails if one
 * is dropped rather than silently falling back to English.
 */

/** BCP 47 tag used to format comment dates, matching the site's language. */
export const COMMENT_DATE_LOCALE = "fr-FR";

/** Labels for the `Comments` list: heading, member badge and like button. */
export const COMMENT_LIST_LABELS = {
	/** `count` is the number of approved comments, so 0 gets its own wording. */
	heading: (count: number) => {
		if (count === 0) return "Aucun commentaire";
		return count === 1 ? "1 commentaire" : `${count} commentaires`;
	},
	member: "Membre du site",
	like: "J'aime",
};

/** Labels for the `CommentForm`: every field, button and status message. */
export const COMMENT_FORM_LABELS = {
	name: "Nom",
	email: "E-mail",
	comment: "Commentaire",
	submit: "Publier le commentaire",
	submitting: "Envoi en cours…",
	/** Shown when the comment is approved immediately. */
	published: "Commentaire publié",
	/** Shown when the comment waits for moderation. */
	pending: "Commentaire envoyé, en attente de validation",
	error: "Votre commentaire n'a pas pu être envoyé.",
	networkError: "Erreur réseau. Veuillez réessayer.",
};
