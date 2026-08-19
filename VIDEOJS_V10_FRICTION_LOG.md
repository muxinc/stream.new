# video.js v10 Integration Friction Log

Context: `stream.new` added two player routes exercising the video.js v10 `MuxVideo`
media component (`@videojs/react@10.0.0-beta.27`) as a "cold start" integration
experiment — no prior project context, public docs + published packages only.

- `/v/:playbackId/videojs-v10-spf` — SPF (Streaming Processor Framework)-backed `MuxVideo`
- `/v/:playbackId/videojs-v10-hlsjs` — hls.js-backed `MuxVideo`

This log records what didn't work smoothly, the root cause where we found one, how (or
whether) it was resolved here, and what may warrant upstream (docs or code) attention.
Expect the list to grow.

---

## 1. TS error for the documented CSS import — `ts(2882)` ✅ resolved (app-side)

**Symptom.** VS Code flags the install guide's first line:

> `Cannot find module or type declarations for side-effect import of '@videojs/react/video/skin.css'. ts(2882)`

**Root cause.** `@videojs/react` exports its CSS paths (`./video/*.css`) but ships no type
declarations for them, and TypeScript can't resolve a bare `.css` module without an
ambient declaration. Editors running TS ≥ 5.9 surface this as `ts(2882)` even when the
project's `tsc` passes (the equivalent CLI check is the off-by-default
`noUncheckedSideEffectImports` flag — running `tsc --noEmit --noUncheckedSideEffectImports`
reproduces it as TS2307).

Notably this was **already latent in stream.new** for `plyr/dist/plyr.css` — it isn't
v10-specific, but v10's install instructions walk every TS user straight into it.

**Resolution here.** Added `declare module '*.css';` to `declarations.d.ts`. Both the IDE
diagnostic and the strict-flag CLI run are now clean.

**Upstream candidates.**
- Docs: note the ambient declaration (or a `global.d.ts` snippet) in the installation guide
  for TypeScript projects.
- Package: ship declaration stubs for the exported CSS paths so the imports resolve without
  app-side ambient modules.

## 2. Initial sizing / CLS on the v10 routes ✅ resolved (app-side), with findings

**Symptom.** The other players render "properly sized" on first load; both v10 routes
first rendered much smaller, then jumped to full size. Measured CLS ≈ **1.44** (dev)
vs ≈ 0.02 for `mux-player`.

**Final resolution — two small changes:**

1. **Drop `{ ssr: false }` from the `next/dynamic` imports** (it was cargo-culted from the
   Plyr player). Client-only loading defers the player chunk past hydration, so the page
   paints its "centered loading" layout and re-layouts when the chunk mounts (shift ≈
   0.94). The v10 React components load and hydrate cleanly through plain `next/dynamic` —
   `ssr: false` was never needed. Plyr has the same measured problem (dev CLS ≈ 0.95) for
   the same reason.
2. **Fire `onLoaded` on mount** (like the established player components), not on
   `loadedmetadata`. `PlayerPage` keeps a `centered={showLoading}` layout until
   `onLoaded`; firing it at mount folds the layout swap into the hydration commit, and
   also closes the window in which a mounted-but-empty skin sits inside the centered
   (shrink-to-fit) layout with no intrinsic width — the cause of a secondary
   "272px-wide player" collapse (≈ 0.31 + 0.11 shifts).

That's the whole fix. Everything else tried along the way was backed out (see the
iteration history below).

**Measured results** (CLS, playback ID `BV3Y…`, 1200×897 viewport):

| Route | dev before | dev after | prod after (also throttled) |
|---|---|---|---|
| videojs-v10-spf | 1.44 | **0.02** | 1.44 (= control) |
| videojs-v10-hlsjs | 1.44 | **0.02** | 1.44 (= control) |
| mux-player (control) | 0.02 | 0.02 | 1.42–1.44 |
| mux-video (control) | — | — | 1.48 |
| plyr | 0.96 | 0.96 | 0.95 |

### Iteration history / ablation (part of the process, kept deliberately)

The first working resolution layered **five** changes. A later ablation pass — fresh
production build per variant, `mux-player` as in-run control, normal + CDP-throttled
(1 MB/s, 40 ms) runs, plus a geometry-timeline probe (sampling the skin's bounding box
every 100 ms) — showed most were unnecessary:

| Change | Kept? | Ablation result |
|---|---|---|
| Remove `{ ssr: false }` | ✅ **kept** | The fundamental fix; dev CLS 1.44 → 0.02 |
| `onLoaded` on mount (not `loadedmetadata`) | ✅ **kept** | CLS-neutral in prod *while the reserve wrapper existed*, but it closes the centered+empty-skin collapse window once the wrapper is gone; also repo convention, and it's what kept dev at parity when the control could reach 0.02 |
| `'use client'` in the v10 component modules | ❌ backed out | No effect (they only ever load inside `PlayerPage`'s client tree). A dev re-measure *appeared* to show it mattered — see the measurement lesson below |
| Reserve wrapper `<div>` in `PlayerLoader` + skin at `width/height:100%` | ❌ backed out | Geometry probe: skin mounts at full size (1160×694) immediately with sizing back on the skin, prod + throttled — identical timeline to `mux-player` |
| `width: 100%` on `PlayerPage`'s `.wrapper` | ❌ backed out | Same probe after removal: still no narrow phase. The 272px collapse it addressed only reproduces in combination with `loadedmetadata`-timed `onLoaded` (the centered layout is the shrink-to-fit culprit) |

**Measurement lesson.** Mid-ablation, the long-running dev server drifted: routes that had
repeatedly measured 0.02 (including `mux-player`) all started measuring ~1.44, which
briefly made the `'use client'` ablation look like a real regression. Dev CLS numbers are
not stable across a long dev-server session (recompiles, `.next` cache churn from
interleaved `next build` runs). Conclusions were re-established against fresh production
builds with an in-run control; treat dev numbers as directional only.

**Diagnostic that cracked it:** `PerformanceObserver` `layout-shift` entries carry
`sources` (node + previous/current rects) — attribution pinpointed each mechanism
(`main.content-wrapper-centered` swap ≈ 0.94; `.wrapper` 272→1160 px collapse ≈ 0.31)
where CLS totals alone were ambiguous, since the totals are near-identical sums of
different shift combinations.

**Portrait/vertical.** Verified: forcing a 9:16 aspect ratio resolves the v10 skin to the
same geometry as `mux-player`'s (390×694, centered, no overflow) — the skin carries the
same `aspect-ratio`/`height:100%`/`max-width:100%` style `mux-player` uses. (Simulated
via style override; worth re-verifying with a real portrait asset.)

**Pre-existing app finding (out of scope for this item, not v10's fault).** In
**production**, *every* player route shifted ≈ 1.4. This was initially attributed to the
"Loading player" centered layout → player layout swap in `PlayerPage`'s client-side
chain — but the item-3 spike (round 2) found the dominant cause: **styled-jsx was not
SSR'd at all**. The App Router migration lost styled-jsx server rendering (server HTML
carried `jsx-*` class names with no rules; App Router needs the registry from the Next.js
CSS-in-JS guide, which pages router never did), so every styled-jsx page painted unstyled
and shifted when styles landed at hydration. Fixed app-wide on the spike branch
(`components/styled-jsx-registry.tsx` + `app/layout.tsx`): all five `/v` players dropped
1.42–1.48 → 0.41–0.49. The remaining ~0.45 *is* the client-gated `FullpageLoader` →
player swap, which the server-first page shape from the item-3 spike eliminates
by construction (measured CLS **0.003**).

**Upstream candidates.**
- Docs: a "layout stability" note — the skin has no intrinsic size before media/poster
  arrive; recommend an `aspect-ratio` box owned by the *host* app (and warn that
  `aspect-ratio` + `height` contributes no intrinsic width inside shrink-to-fit parents).
- Docs (Next.js guide): `next/dynamic` works *without* `{ ssr: false }`; recommend against
  client-only loading for CLS reasons.

## 3. `'use client'` / dynamic-import assumptions ✅ answered by spike (branch `videojs-v10-use-client-spike`)

stream.new renders every player inside a `'use client'` `PlayerPage` and loads all of them
via `next/dynamic`, so this integration never validated what v10 actually *requires*.
A parameterized spike route (`/vjs-spike/[variant]?playbackId=&engine=`) tested three
boundary strategies — no app boundary at all (`rsc-static`), explicit `'use client'`
(`client-static`), and the current `next/dynamic` approach (`client-dynamic`); see
`app/vjs-spike/README.md`.

**Findings** (`@videojs/react@10.0.0-beta.27`, Next 16.1.6):

- **No app-level `'use client'` is needed.** The package self-declares `'use client'`
  throughout its dist (entry points and the `media/mux-video/*` flavors included), so RSC
  treats the components as client components automatically — a server component page can
  statically import and render them directly.
- **v10 SSRs real markup**: the full skin (role/a11y attributes, inline sizing) plus the
  `<video>` element shell (`crossorigin`, `playsinline`; no `src` — source resolution and
  engine attach happen client-side). All variants hydrate and play with zero console
  errors on both engines.
- **`next/dynamic` is a code-splitting choice, not a requirement** — appropriate for
  multi-player pages like `/v/[id]/[playerType]`, unnecessary otherwise.
- The real constraint is the standard RSC one: a server-component host can pass only
  serializable props, so app-layer interactivity (seek-to-`?time=`, `onLoaded` wiring)
  still needs a client component somewhere.

Still unexplored: fair bundle-size comparison of static vs dynamic import; whether
upstream SSR-ing the `source`-derived `src`/poster would improve first paint.

## 4. No declarative start time on the media components ✅ answered (kept the ref)

**Question.** Can the "start at `?time=`" behavior be passed via `source` (or similar)
instead of the `useRef` + `loadedmetadata` seek?

**Findings.**
- The hls.js-backed `MuxVideo`'s `source` inherits `HlsSource`, whose `engine.hlsJs` is a
  full `Partial<HlsConfig>` passthrough — so `source={{ playbackId, engine: { hlsJs:
  { startPosition } } }}` works **on the MSE path only**.
- The native-HLS path (Safari) has no equivalent: `NativeHlsConfig` is `drmSystems`-only,
  and `startPosition` is never read there. A source-only approach is not cross-browser.
- The SPF flavor exposes no engine-config surface at all (`HlsVideoMediaProps` is
  `src`/`preload`/`disableRemotePlayback`/`streamType`), so it needs the imperative seek
  regardless.
- Near-miss: Mux's `playback.assetStartTime` param is **instant clipping** — it trims the
  asset (duration/timeline change), not "begin playback at t".

**Resolution.** Kept the `useRef` + seek-on-`loadedmetadata` approach: it's the only
mechanism uniform across both engines (MSE + native) and both flavors (SPF + hls.js), and
using `startPosition` would still require the ref as a Safari fallback.

**Upstream candidate.** `@mux/mux-video` (media-chrome) has a first-class `startTime`
attribute; the v10 media components have no declarative equivalent. A `startTime` prop on
the media components (or on the skin/player) that handles the engine differences
internally would remove this boilerplate from every host app.

## 5. `?color=` (accent color) support was missed in the initial integration ✅ resolved (app-side)

**The miss.** stream.new's player routes accept `?color=<hex>`; `PlayerPage` parses it and
`PlayerLoader` forwards it as `accentColor` (`mux-player`) / `primaryColor`
(`mux-player-classic`). The v10 components were never given a `color` prop and
`PlayerLoader` doesn't pass one — the gap went unnoticed through the whole initial
integration because nothing fails: the skins silently keep their default accent.
Caught only on a later friction-log review (2026-08-19).

**What v10 actually supports (confirmed).** Both official skins (Default and Minimal) are
themeable via CSS custom properties — documented in the package's
`docs/how-to/customize-skins.md`:

- `--media-accent-color` — "the color of slider fills and accented controls"
- `--media-accent-text-color` — text/icons rendered *on* the accent color; when omitted,
  the skins derive it with `contrast-color(var(--media-accent-color))`

Verified in the shipped CSS (`dist/default/presets/video/skin.css` and
`minimal-skin.css`, identical mechanism): `--accent-color: var(--media-accent-color,
var(--default-accent-color))` with `--default-accent-color: oklch(1 0 0)` (white).

There is **no prop-level API**: nothing on `VideoPlayer`/`VideoSkin` (or anywhere in the
React surface) exposes accent color — the CSS custom property is the only mechanism, so
it's invisible to prop/TS-driven discovery and lives only in the customize-skins guide.

**Resolution here (small).**
1. Added `color?: string` to both v10 components' props, set as
   `'--media-accent-color': color` on the inline `style` object already passed to
   `<VideoSkin>` (React drops `undefined` style values). Left
   `--media-accent-text-color` unset so the skin's `contrast-color()` derivation picks the
   readable text color, matching `mux-player`'s single-`accentColor` ergonomics.
2. Forwarded `color={color}` from `PlayerLoader`, same as the other players. Also wired
   `?color=` into the server-first path (this branch's live v10 routes): a shared
   `getColorFromQueryValue` helper in `lib/player-page-utils.ts` mirrors `PlayerPage`'s
   hex validation (note: the hex-digits-only restriction is stream.new's own
   pre-existing `?color=` design — `#` can't ride in a query string, and the whitelist
   guards the inline-style sink — not a v10 limitation; `--media-accent-color` accepts
   any CSS `<color>`, as its docs state), both `/v` route pages read `searchParams`, and `ServerPlayerPage`
   takes a `color` prop — removing one of its documented "deliberate deviations".
   Verified in-browser on both engines (`?color=f5c518` → `--accent-color`
   resolves to `#f5c518`, `media-slider__fill` renders it) — but only after
   fixing item 6 below, which this verification flushed out.
3. Typed the custom properties with the csstype-documented module augmentation
   (`css-custom-properties.d.ts`) — the same "well-established standard" route as item
   1's global `*.css` ambient module — since `@types/react@18.3`'s `CSSProperties` is
   deliberately closed-typed (no `--*` index signature). The augmentation keeps closed
   typing: `'--media-accent-color'` type-checks, `'--media-accent-colour'` still errors.

**TS trap found on the way (cousin of item 1).** The augmentation *cannot* live in a
global script file like `declarations.d.ts`: module augmentation only merges when the
containing file is itself a module. In a script file, `declare module 'csstype' { ... }`
is an *ambient module declaration* that silently **replaces** the real csstype for the
whole program — and with `skipLibCheck: true` (Next.js default) the fallout is almost
entirely hidden, surfacing only as three baffling app-side errors (`'fontSize' does not
exist in type 'CSSProperties & …'`) in files untouched by the change. The fix is a
dedicated `.d.ts` with a top-level `import type {} from 'csstype';` to make it a module
(`declarations.d.ts` must stay a script file so its `interface Window` etc. remain
global).

**Upstream candidates.**
- Parity/discoverability: `mux-player` exposes `accent-color`/`primary-color` as
  first-class attributes/props; v10 theming is CSS-var-only and only discoverable via the
  customize-skins doc. A `style`-adjacent note in the React docs (or a typed helper)
  would surface it to TS users.
- Package: ship the csstype `Properties` module augmentation for the documented theming
  custom properties (`--media-accent-color`, `--media-accent-text-color`,
  `--media-border-radius`, `--media-scale-unit`) so React/TS users get typed inline
  `style` support out of the box — the direct analogue of item 1's "ship declaration
  stubs for the exported CSS paths". Crucially, this can be **automatic on import** —
  no consumer config — via either of two vehicles:
  1. *Entry-carried*: a `css-properties.d.ts` in the package (`declare module 'csstype'
     { interface Properties { '--media-accent-color'?: string; … } } export {};` — the
     `export {}` is load-bearing, see the script-file trap above) side-effect-imported
     from the `@videojs/react/video` entry's `index.d.ts`. Importing `VideoSkin` then
     augments the consumer's program by itself. Works on any TS version.
  2. *Stylesheet-carried* (TS ≥ 5.0 `allowArbitraryExtensions`): ship the same
     augmentation as `skin.d.css.ts` beside each `skin.css`. The install guide's own
     `import '@videojs/react/video/skin.css'` then both resolves (fixing item 1's
     `ts(2882)` with no app-side wildcard module) *and* delivers the theming types
     scoped per skin — import `minimal-skin.css`, get exactly its variables.
  Either way the files can be **codegen'd from the built CSS** (scan for `--media-*`
  declarations, emit the interface), so the types, the docs table, and the stylesheets
  can never drift.
- Docs: the customize-skins guide shows the custom properties but no React inline-`style`
  example — the closed `CSSProperties` typing means the obvious approach type-errors, and
  the standard fix (csstype augmentation) carries the script-file/ambient-module trap
  described above; a copy-pasteable snippet would save every TS integrator this detour.

## 6. `VideoSkin`'s `placeholder` prop silently invalidates the host's inline styles ✅ resolved (app-side workaround)

**Found while verifying item 5:** the SSR'd `?color=` value was present in the skin's
`style` *attribute* but never took effect — and neither did anything else in it:
`el.style.length` was **0** and `aspect-ratio` computed to `auto`. The entire inline
style attribute was invalid CSS, on every server-rendered v10 page, the whole time.

**Root cause (upstream).** `VideoSkin` interpolates its `placeholder` prop verbatim into
an unquoted CSS url token (`dist/*/presets/video/skin.js`):

```js
const containerStyle = placeholder ? {
  "--media-poster-placeholder": `url(${placeholder})`,
  ...style
} : style;
```

`@mux/blurup`'s `blurDataURL` is an *unencoded* SVG data URI containing raw quotes,
spaces, and parens — all forbidden in an unquoted `url()` token. The tokenizer bails into
a bad-url-token at the first `"`, and the leftover quote pairing swallows every
subsequent `;`, so **every declaration in the attribute dies** — the placeholder itself,
the host's `aspect-ratio`/`max-width`/etc. sizing, and (item 5) `--media-accent-color`.

**Why it went unnoticed.** Two compounding silences:
- On the client-rendered path (`PlayerPage`/`PlayerLoader`), React sets style properties
  *individually* (`style.setProperty(...)`), so only the malformed placeholder
  declaration is dropped — everything else works. Only SSR serializes the styles into one
  attribute that fails as a unit, and hydration never repairs it.
- Nothing errors: no console message, no visual break once media metadata provides the
  aspect ratio. The pre-metadata sizing the inline `aspect-ratio` was supposed to provide
  was simply absent. (Caveat for item 2/3's CLS story: the server-first page measured CLS
  0.003 *with this style attribute broken* — worth a re-measure now that the inline
  sizing actually applies; if anything it should only improve.)

**Resolution here.** `lib/css-url.ts` → `toCssUnquotedUrlSafe()`: percent-encodes the
characters CSS forbids in an unquoted url token (whitespace, `"`, `'`, `(`, `)`, `\`) —
percent-encoding is transparent to data-URI consumers. Applied at all three
`placeholder={blurDataURL}` call sites (`ServerPlayerPage`, both v10 components).
Verified: all 10 inline declarations now parse, the placeholder data URI still decodes
as an image, and `aspect-ratio` computes again.

**Upstream candidates.**
- Code: `VideoSkin` should emit a *quoted* url with proper escaping (e.g.
  `` `url("${placeholder.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}")` ``), or
  percent-encode as above. Any un-encoded data URI (a very common `blurDataURL` shape —
  `@mux/blurup`, LQIP SVGs, `plaiceholder`) reproduces this.
- Docs: until fixed, the `placeholder` prop docs should state the value must be
  url-token-safe. The failure mode is brutal to notice: SSR-only, no error, and it takes
  unrelated sibling styles down with it.

## Also observed during the initial one-shot (2026-08-18)

- **Flavor discoverability**: the SPF vs hls.js `MuxVideo` split
  (`@videojs/react/media/mux-video/spf` vs `.../hls-js`) isn't in the docs; found via the
  package export map and `.d.ts` files.
- **`crossOrigin` required for storyboards**: without `crossOrigin="anonymous"` on
  `MuxVideo`, the skin's timeline-thumbnail VTT fails with a cross-origin security error.
  `MuxVideo` wires the storyboard automatically, so this bites by default.
- **Mux Data can't hook the SPF engine**: `[vjs-mux] Mux Data could not hook this playback
  engine…` — SPF-backed views are monitored from the media element alone (no rendition
  switches / request timing). The hls.js flavor hooks cleanly.
- **`source.customDomain` empty-string**: an env-driven `customDomain: ""` isn't treated as
  "unset"; the app must coerce to `undefined` (`process.env.X || undefined`).
