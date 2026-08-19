# vjs-spike: video.js v10 client/server boundary spike

Exploratory spike for friction-log item 3: **do the video.js v10 use cases need
`'use client'` (or `next/dynamic`) in app code?**

## Routes

`/vjs-spike/[variant]?playbackId=<id>&engine=spf|hlsjs`

| Variant | Boundary strategy |
|---|---|
| `rsc-static` | Server component page + server component player module. **No `'use client'`, no `next/dynamic` anywhere in app code.** |
| `client-static` | Explicit `'use client'` wrapper, static imports. |
| `client-dynamic` | `'use client'` + `next/dynamic` — stream.new's current PlayerLoader approach. |

`playbackId` defaults to a public test asset; `engine` defaults to `spf`. Expand the
`VARIANTS` map in `[variant]/page.tsx` as new strategies come up.

## Findings (2026-08-18, @videojs/react@10.0.0-beta.27, Next 16.1.6)

1. **No app-level `'use client'` is needed.** The package ships `'use client'`
   banners throughout its dist (entry points and the `media/mux-video/*` flavors
   included), so RSC treats the components as client components automatically.
2. **All three variants behave identically**: SSR emits the full skin markup
   (`role="group"`, a11y attributes, inline sizing style) plus the `<video>`
   element shell (`crossorigin`, `playsinline` — no `src`; source resolution and
   engine attach happen client-side). All hydrate and play with zero console
   errors, both engines.
3. **Static import from a server component works** — `next/dynamic` is a
   code-splitting choice for multi-player pages like stream.new's
   `/v/[id]/[playerType]`, not a requirement.
4. **Server-component constraint to remember:** an RSC host can only pass
   serializable props — no `onLoadedMetadata`/refs. Anything interactive at the
   app layer (e.g. stream.new's seek-to-`?time=`, `onLoaded` wiring) still needs
   a client component *somewhere*; the spike players are deliberately
   handler-free.

## Not yet explored

- Bundle-size comparison of static vs dynamic import (the spike double-imports
  both engine flavors per module, so it's not a fair bundle testbed as-is).
- Whether SSR'ing a `source`-derived `src`/poster on the video element upstream
  would improve first-paint (currently client-resolved).

## Round 2: server-first mirror of `/v/[id]/[playerType]` — PROMOTED

> **Update:** round 2's routes and components were promoted out of the spike:
> `components/server-player-page.tsx` + `components/player-actions.tsx` are now
> used by the real `/v/[id]` and `/v/[id]/[playerType]` routes for the
> `videojs-v10-*` player types (see `SERVER_RENDERED_PLAYER_TYPES` in
> `constants.ts`), and the `/vjs-spike/v/*` mirror routes were removed. The
> boundary-variant route below remains for future boundary tests.

The round-2 mirror re-created the real player page server-first — same props derivation
(`getPropsFromPlaybackId`), metadata, `Layout` chrome, sizing, Mux Data, poster +
blur-up placeholder — with app-level client code reduced to ONE leaf
(`spike-actions.tsx`: copy-URL + report-abuse). Query params (`?time=`, `?color=`)
deliberately ignored for now. The client `Layout` is composed from the server page
via the RSC children pattern; the v10 player and `MuxData` render directly from
server components (serializable props only).

**Results (prod):**

| Route | CLS |
|---|---|
| `/vjs-spike/v/.../videojs-v10-spf` | **0.003** |
| `/vjs-spike/v/.../videojs-v10-hlsjs` | **0.003** |
| `/v/...` (all five players, after the styled-jsx fix below) | 0.41–0.49 |
| `/v/...` (all five players, before it) | 1.42–1.48 |

Both engines play, the actions leaf hydrates and works (report form toggles), no
console errors. The remaining ~0.45 on the current `/v` routes is `PlayerPage`'s
client-gated render (`FullpageLoader` → player swap), which the server-first shape
eliminates by construction — the player is in the initial HTML.

**Major incidental discovery: styled-jsx wasn't SSR'd at all.** The server HTML
carried `jsx-*` class names with no style rules — the App Router migration lost
styled-jsx SSR (pages router did it automatically; App Router needs the registry
from the Next.js CSS-in-JS guide). Every styled-jsx page painted unstyled and
shifted when styles landed at hydration; this — not the loading-state swap — was
the dominant cause of the universal ~1.4 CLS measured across ALL /v players in
production. Fixed app-wide in `components/styled-jsx-registry.tsx` +
`app/layout.tsx`.

**Known deviations from PlayerPage** (candidates for later rounds): no `?time=`
seek / `?color=` accent, opening the report form doesn't unmount the player, no
FullpageLoader/`onLoaded` phase (unnecessary under SSR), errors left to the skin's
error dialog.

### Post-promotion note: engine chunk splitting (corrected)

With both `MuxVideo` flavors statically imported in `server-player-page.tsx`, both
engines shipped to every route. A first fix attempt — a conditional
`await import(...)` in the server component — **did not work**: client references
reachable from a route's server module graph are merged into the route's client
chunks whether or not they render. (An initial measurement suggesting it worked
was a warm-cache artifact; a cold-cache, in-page `performance` measurement showed
both routes loading the identical 21 chunks / 2,065KB decoded, with hls.js's
590KB chunk in the "shared" set.)

The working fix is `components/v10-media.tsx`: a small client leaf that selects
the engine flavor via `next/dynamic` (SSR stays on — no `ssr: false`). Cold-cache
results, decoded (transferred):

| Route | engine-only chunk | total route JS |
|---|---|---|
| spf | 79KB (24KB) — SPF engine | 1,476KB (424KB) |
| hlsjs | 590KB (182KB) — hls.js | 1,987KB (582KB) |

Two lessons for the log: (1) in App Router, conditional client rendering does not
imply conditional client *bundling* — `next/dynamic` inside a client component is
what creates the split point; (2) measure bundles cold-cache from in-page
resource timing (`decodedBodySize`/`transferSize`), not from a network listener
on a reused browser context.

### Initial-load optimization: measured findings, implementation TBD

An optimization pass was implemented, measured, and then **backed out pending a
discussion of the right implementation** (commits `75dc493` → reverted in
`09e3084`; diff there shows the working version). What the measurements
established, kept for the record:

- The `V10Media` next/dynamic leaf keeps the media **server-rendered** (`<video>`,
  skin, poster, blur-up in initial HTML) and the engine chunk preloads with the
  page's initial scripts — no post-hydration waterfall. This part needs no change.
- `ReactDOM.preload` of the HLS manifest (`as: 'fetch'`, anonymous) + `preconnect`
  to the delivery domains moved the main-manifest fetch **~780ms → ~395ms**, with a
  single fetch (`initiator: "link"`) — both SPF (fetch) and hls.js (XHR) hit the
  preload cache.
- `generateMetadata` and the page each run `getPropsFromPlaybackId`'s upstream
  round-trips (2× per request, all /v routes); React `cache()` dedupes it.
  Remaining TTFB (~390ms) is the serial upstream chain itself.

Open implementation questions: where should the hints live (route level vs. player
page component vs. a dedicated hints component vs. **upstream in the v10 media
component**, which knows its manifest URL and `preload` semantics at SSR time)?
Should manifest preload respect `preload="none"`? Is `cache()` on shared
`lib/player-page-utils.ts` the right dedupe seam?
