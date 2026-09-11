/*
 * Percent-encode the characters CSS forbids in an unquoted url() token
 * (whitespace, quotes, parens, backslash). Percent-encoding is transparent to
 * data: URI consumers, so the encoded string still renders identically.
 *
 * Originally needed because @videojs/react's <VideoSkin> (≤ beta.27)
 * interpolated its `placeholder` prop into `url(${placeholder})` verbatim;
 * @mux/blurup's SVG data URI contains raw quotes/spaces/parens, which makes
 * that declaration a CSS bad-url-token — and in the *server-rendered* style
 * attribute the parse error cascades and silently invalidates every other
 * inline style declaration on the element. Still used now that the blurup is
 * our own `background: url(...)` on the poster <img> (rc.2 `renderPoster`):
 * same hazard, same SSR'd style attribute. (CJP)
 */
export const toCssUnquotedUrlSafe = (uri: string): string =>
  uri.replace(
    /[\s"'()\\]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`
  );
