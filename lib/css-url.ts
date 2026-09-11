/*
 * Percent-encode the characters CSS forbids in an unquoted url() token
 * (whitespace, quotes, parens, backslash). Percent-encoding is transparent to
 * data: URI consumers, so the encoded string still renders identically.
 *
 * Needed because the blurup placeholder is interpolated into an unquoted
 * `url()` inside a *server-rendered* inline style attribute. @mux/blurup's
 * SVG data URI contains raw quotes/spaces/parens, which are forbidden in an
 * unquoted url token; the resulting bad-url-token cascades and silently
 * invalidates every other declaration in that attribute (aspect-ratio
 * included). Client-side React sets properties individually, so the hazard is
 * SSR-only and invisible in dev tools. (CJP)
 */
export const toCssUnquotedUrlSafe = (uri: string): string =>
  uri.replace(
    /[\s"'()\\]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`
  );
