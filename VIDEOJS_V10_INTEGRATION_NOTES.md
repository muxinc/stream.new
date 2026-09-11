# video.js v10 integration notes

Working notes and measured findings for stream.new's video.js v10 integration —
the record behind the decisions in the current implementation. Companion to
`VIDEOJS_V10_FRICTION_LOG.md` (which tracks upstream-facing friction; this file
tracks app-side architecture findings).

> **Provenance:** this began as `app/vjs-spike/README.md`, the notes for the
> client/server boundary spike (friction-log item 3). The spike routes
> (`/vjs-spike/[variant]`) and `components/vjs-spike/*` were removed on
> 2026-08-19 once the integration became the intended general implementation;
> the sections below are kept verbatim as the record. References to spike
> routes are historical, and these components were renamed on 2026-08-19 to
> reflect their v10 coupling (historical prose keeps the old names):
> `components/server-player-page.tsx` (`ServerPlayerPage`) →
> `components/videojs-v10-player-page.tsx` (`VideojsV10PlayerPage`),
> `components/v10-media.tsx` (`V10Media`) → `components/videojs-v10-media.tsx`
> (`VideojsV10Media`), and `SERVER_RENDERED_PLAYER_TYPES` →
> `VIDEOJS_V10_PLAYER_TYPES` in `constants.ts`.

## Boundary spike (removed): do the v10 use cases need `'use client'` / `next/dynamic` in app code?

### Routes (removed 2026-08-19)

`/vjs-spike/[variant]?playbackId=<id>&engine=spf|hlsjs`

| Variant | Boundary strategy |
|---|---|
| `rsc-static` | Server component page + server component player module. **No `'use client'`, no `next/dynamic` anywhere in app code.** |
| `client-static` | Explicit `'use client'` wrapper, static imports. |
| `client-dynamic` | `'use client'` + `next/dynamic` — stream.new's current PlayerLoader approach. |

`playbackId` defaulted to a public test asset; `engine` defaulted to `spf`.

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

### Route shape: static per-engine segments — explored and backed out (2026-08-19)

An alternative to the `V10Media` next/dynamic leaf was implemented, verified, and
**backed out by choice** (never committed): static route segments
`/v/[id]/videojs-v10-{spf,hlsjs}` alongside the dynamic `[playerType]` sibling, each
statically importing its own `MuxVideo` flavor and composing it into `ServerPlayerPage`
via a `media` slot. What the exploration established, kept for the record:

- **It's valid and it works**: static segments take precedence over the dynamic sibling;
  SSR of the skin + `<video>` shell is unchanged; a production build showed each route's
  chunk set contains exactly one engine (spf route 1,420KB total with a 78KB SPF chunk;
  hls.js route 1,931KB with a 589KB hls.js chunk; zero cross-engine leakage).
- **Performance is a wash vs. the dynamic leaf.** The leaf never used `ssr: false` and
  its engine chunk preloads with the page's initial scripts (no post-hydration
  waterfall), so static imports only guarantee the module is executable when hydration
  starts — a milliseconds-scale difference, not the headline win it looks like.
- **Why parameterized won**: the routes are conceptually parameterized; the static shape
  hard-codes the engine into the URL/route table and gives up request-time flavor
  selection — a stated future goal is choosing the media flavor **server-side from
  asset/source details**, which the dynamic leaf supports today.

Options recorded for that future server-side flavor selection:
1. Middleware/rewrite → per-flavor routes (selection logic server-side, chunks
   build-time exact, no client-visible redirect) — needs selection inputs resolvable
   before render.
2. The current `V10Media` dynamic leaf (selection can use render-time data; one engine
   fetched per request; the lazy-boundary cost is the milliseconds above).
3. One route statically importing both flavors and rendering one — **hinges on an
   unverified assumption**: the measured "both engines shipped, 2,065KB" result was with
   a conditional `await import()` in the server component; the static-import-both /
   render-one variant was never measured separately and is a cheap experiment.

## Engine selection research: predicting TS vs CMAF from API metadata (2026-08-19)

Motivation: SPF cannot play MPEG-TS segments (and never will by current plans); hls.js
plays both. Goal: pick the engine server-side from asset/playback-ID metadata — playlist
inspection deliberately excluded from the implementation for now (stacked-effort risk).
Research: mux monorepo (checkout @ 2023-10, mechanics), Notion + Slack (2025-07 quoted
production code + 2026 plans), docs.mux.com/openapi-specification (public field
semantics), plus empirical manifest correlation over the stream.new env's 16 assets.

**The production rule** (video/services/assetindex/renditionsets.go; container chosen
per playback ID at creation, stable forever, never per-request): default TS; CMAF iff
the asset is CMAF-compatible (ingest-computed, can silently fall back to TS on e.g.
audio timing problems) AND (tier is basic/baseline or premium, OR a per-environment
LaunchDarkly flag, OR internal test flag). Hard overrides: low-latency live → CMAF
always (and its recorded assets stay CMAF "to avoid retranscoding"); DRM playback IDs →
CMAF always. Hard TS (2023 mechanics; may have loosened since): clips
(source_asset_id/on_demand_clip), normalize_audio, audio-only, no ready primary audio
track, standard/reduced-latency live.

**Derived heuristic** (verified against the env sample, 16/16 consistent):
- SPF when `video_quality` (fall back: `encoding_tier` baseline→basic, smart→plus) is
  `basic` or `premium`, AND ingest is on-demand non-clip, AND tracks include video+audio.
  Tier membership encodes the rollout date for free: basic (2023-10) and premium
  (2024-10) postdate CMAF, so no created-at cutoff is needed.
- SPF when the asset has `live_stream_id` and the parent stream (if retrievable) has
  `latency_mode: "low"`.
- hls.js for everything else: plus/smart (the flag-gated coin-flip tier — TS by default),
  clips, audio-only (empirically either container in 2026), standard/reduced live,
  foreign playback IDs (no API visibility), missing fields (pre-2023-10 assets predate
  tiers entirely), deleted parent streams, API errors. hls.js is always safe — it plays
  CMAF too; SPF is only chosen on confident CMAF.
- Known irreducible gap: rare basic/premium ingest fallback to TS is invisible in the
  API; a runtime error→hls.js fallback (the internally-agreed VJS10 strategy) is the
  eventual mitigation, out of scope for the first pass.

**Practical notes.** `video_quality` is NOT required on the Asset schema (deprecated
`encoding_tier` IS) — the fallback mapping is mandatory, not optional. `created_at` is
string-of-epoch-seconds in the API but a bare integer in webhooks. `ingest_type` absent
on pre-2024-02 assets. The asset does not echo its stream's latency_mode — requires the
live_stream_id join. stream.new creates uploads with `video_quality: 'basic'`
(app/api/uploads/route.ts), so native assets are the force-CMAF tier → SPF-eligible.

**Future exit ramps** (agreed internally 2026-05, unshipped as of 2026-08): a TS-vs-CMAF
response header on manifest requests, and an output-format field on API/webhooks (new
assets only). Also: NIICE will make 100% of NEW ingest CMAF (plus tier last, target
"within 6 months of launch"), but old assets will never be converted — the heuristic
stays necessary for the back catalog indefinitely. If playlist inspection ever becomes
acceptable, the deterministic single-fetch check is the multivariant's audio GROUP-ID
("audio-*" → CMAF, "audN"/no-URI stub → TS) — cacheable per playback ID.

### Behavior validation: TS-on-SPF failure mode, end to end (2026-08-19)

The v10 e2e suite's SPF unsupported-source spec (its TS-ladder and fMP4 scenarios) was
validated against stream.new's own /v routes with Playwright, using env assets matched
to the scenarios via the Mux API. Key find: the env contains a deliberate matched pair —
the same 654s video ingested at premium (fMP4: `JsDMLk…`) and plus (TS: `lPlSEQ…`) —
the video analog of the audio-only CMAF/TS pair.

| Case | Route | Result |
|---|---|---|
| TS VOD on SPF | `/v/lPlSEQ…/videojs-v10-spf` | ✅ error dialog opens with the exact `errors.unplayable` copy ("This media is unsupported by the player."), not the generic fallback; `readyState` stays 0 |
| Same TS VOD on hls.js | `/v/lPlSEQ…/videojs-v10-hlsjs` | ✅ plays; `readyState` 4; no dialog |
| Matched fMP4 VOD on SPF | `/v/JsDMLk…/videojs-v10-spf` | ✅ plays; no dialog; zero console errors |
| Standard-latency live recording (TS) on SPF | `/v/INw9j7…/videojs-v10-spf` | ✅ same unplayable dialog |

Console on the failing cases shows the full SVTA sequence in spec order — cause 1004
(unsupported video format, per-rendition) before verdict 2011 (no supported video
track) — and a developer-facing message that explicitly recommends importing the
`hls-js` flavor in place of `spf`. This end-to-end confirms both the stakes of the
engine-selection heuristic (TS on SPF fails loudly, not silently) and its correctness
on these assets (plus→TS, premium→fMP4, standard-latency live→TS).

### Auto engine selection: implemented (2026-08-19)

The heuristic above is live as a third v10 player type, `videojs-v10`
(`/v/[id]/videojs-v10`), alongside the explicit `-spf`/`-hlsjs` overrides.

Shape (`lib/videojs-v10-engine.ts`):
- `getV10EngineFromAsset(asset, { liveStreamLatencyMode? })` — the **synchronous
  pure core** over an asset already in hand (DRM → hls.js; live-derived →
  stream latency or hls.js when unknown; clips/audio-only/video-only → hls.js;
  then basic|premium → SPF, else hls.js).
- `getV10EngineForAsset(asset)` — async wrapper doing the parent-live-stream
  join only when needed.
- `getV10EngineForPlaybackId(id)` — full lookup for the /v pages (playback ID →
  object → asset), every failure landing on hls.js.
- `/api/assets/[id]` now includes `videojs_v10_engine` in its response `asset`
  object, computed by the sync core from the asset it already retrieves (no
  extra Mux calls for on-demand assets). The /v player pages do NOT call this
  endpoint (it serves the post-upload status page); they use the async lookup.

Validation:
- A real stream.new upload (basic quality): auto route selected **SPF** (only
  the spf engine chunk loaded), played; `/api/assets/{id}` reports
  `"videojs_v10_engine": "spf"`. Its manifest has `EXT-X-MAP` — **empirically
  closing the basic→CMAF sample gap** (no basic assets existed in the other
  env).
- 14-case table test of the sync core (premium/basic/plus, legacy
  encoding_tier fallback, LL/standard/unknown live recordings, clips,
  audio-only/video-only, DRM, missing tracks): all pass.
- Foreign playback IDs (streamable but outside the app env) fall back to
  hls.js and play — verified in-browser.

**Environment mismatch discovered during validation:** the dev `.env.local`
Mux credentials belong to a DIFFERENT environment than the one holding the
premium/plus/live test assets used earlier in these notes ("Invalid playback
ID, mismatching environment"). From the app's perspective those assets
exercise the foreign-ID fallback (hls.js — safe and correct), and the
tier/live rules are covered by the table test + the earlier container
empirics. Full integration validation of the SPF-selection paths for
premium/LL-live content would need env alignment or test assets created in
the app's env — open item.

### Symmetric warm-start harness: SPF vs hls.js without Mux Data (2026-08-19)

Given friction item 7 (Mux Data cross-engine skew), an injected element-level harness:
navigate → evaluate injects identical instrumentation on both engines — muted `play()`
retry loop as the anchor, element events, `requestVideoFrameCallback` as engine-neutral
first-frame ground truth, manifest fetch from resource timing (script-timing
independent). Same asset (BV3Y), pre-warmed routes, alternating order, n=3 per engine,
dev server. All ms from the play attempt:

| Engine | rest readyState | play→`playing` | play→first frame (rVFC) | first frame mediaTime |
|---|---|---|---|---|
| SPF | 1 | 65 / 70 / 125 | 69 / 71 / 126 | 43ms ×3 |
| hls.js | 4 | 57 / 16 / 17 | 186 / 64 / 76 | 0 / 0 / 42 |

Manifest fetch (nav-anchored): statistically identical (~1.0–1.1s start, ~100ms duration
both engines).

**Findings:**
1. **True warm-start time-to-first-frame is a tie** (medians ~71ms vs ~76ms). Neither
   engine is meaningfully faster from a settled page.
2. **The engines invert the meaning of element readiness events.** Under
   `preload="metadata"`, hls.js buffers to readyState 4 at rest (`playing` fires ~17ms
   after play, but the first *rendered* frame lags it by 50–130ms), while SPF holds
   readyState 1 and fetches/appends on demand (`playing` fires essentially *with* the
   first frame, 1–4ms apart). Any metric keyed on `playing`/readiness — including Mux
   Data's element-derived TTFF (the 4–5ms hls.js readings) — tells the opposite story
   from render truth. rVFC is the only symmetric first-frame signal.
3. **Preload behavior differs materially**: hls.js effectively ignores
   `preload="metadata"` semantics (buffers media to readyState 4); SPF honors it
   (metadata only, readyState 1). Trade-off: hls.js spends bandwidth on never-played
   views for a `playing`-event head start that doesn't translate to faster rendered
   frames; SPF's thrift costs nothing measurable at first-frame. Worth an upstream
   conversation about which behavior v10 *wants* as its default.

### A/B campaign: cold + warm lanes, production build (2026-08-20)

Instrumentation added to the v10 player page (testing affordances): `?autoplay`
(muted autoplay on the media), `?preload=none|metadata|auto` (pass-through), `?perf`
(`components/perf-marks.tsx` — nav-anchored element lifecycle marks + rVFC first frame
at `window.__perfMarks`). Campaign: scripted Chrome (playwright-core, system channel),
production server, same asset (BV3Y), alternating order.

**Cold lane** (`?autoplay&perf`, fresh browser context per run = cold HTTP cache; n=8
per engine; ms from navigation):

| | loadstart med | first frame med | first frame p90 |
|---|---|---|---|
| SPF | 666 | **994** | 1234 |
| hls.js | 585 | **1052** | 1219 |

Each engine had exactly one ~2.2s outlier (CDN moment); distributions otherwise
overlap. **Verdict: on the user-perceived cold path, SPF is at least as performant —
~6% faster at the median, tie at p90** — despite attaching the element later
(loadstart +80ms, the resolve-before-attach ordering).

**Warm lane** (`?preload=auto`, settled 6s, scripted muted play; n=5): SPF play→frame
median 126ms vs hls.js 61ms. But the lane FAILED as an equalizer, which is its real
finding: `rsAtPlay` stayed 1 on SPF in all runs — see the preload item below. hls.js's
warm advantage is entirely its 32s pre-buffer; SPF's number still contains on-demand
segment fetches. This is a buffering-policy difference, not pipeline speed (the cold
lane, where both fetch everything, shows parity-to-SPF-favor).

**Preload prop verification** (prod, `?preload=auto`): hls.js flavor forwards it
(element attr+prop `auto`, readyState 4, 32s buffered — though it also buffers under
`metadata`, i.e., ignores the restrictive semantic); **SPF flavor drops the prop** —
element `preload` stays `"metadata"`, no pre-buffering, no opt-in possible. Neither
flavor honors the author's preload intent; they fail in opposite directions
(friction log item 8).

### Planned (not built): local-server A/B lane + campaign protocol upgrades

Parked 2026-08-21 to return to primary integration efforts. When resumed:

- **Outlier forensics from the 2026-08-20 cold campaign**: both ~2.2s outliers (run 1
  SPF — first-run effect — and run 7 hls.js) had `loadstart` itself inflated (~1200ms vs
  ~550–770ms typical), i.e. the delay preceded any media work — environmental (machine
  load burst / server transient), not engine variance. Interleaving spread it evenly;
  verdict unchanged with outliers dropped (SPF ~980 vs hls.js ~1045 medians).
- **Local-server lane** (isolates engine pipeline; removes CDN/network noise *and*
  field realism — a third lane beside CDN-cold and an eventual throttled lane):
  1. Test server: `~/dev/muxinc/simple-local-video-test-server` (`npm run start` →
     http-server on :8789, correct HLS mimetypes, `/public` navigable).
  2. App affordance: test-only `?src=` on the v10 page rendering the *generic* HLS
     media components (`@videojs/react/media/hls-video` = SPF-backed,
     `media/hlsjs-video` = hls.js-backed) — MuxVideo can't point at localhost
     (customDomain can't express host:port/plain http).
  3. Content: needs a CMAF/fMP4 ladder (SPF can't play TS); ideally a local mirror of
     the same asset used in the CDN lane for comparability.
  4. Protocol: discard run 1 by rule, n≥15/engine, quiesced machine, interleaved.
- Campaign runner pattern (reusable): `npm i --no-save playwright-core` +
  `chromium.launch({ channel: 'chrome' })`, fresh context per cold run, poll
  `window.__perfMarks` (the `?perf` leaf). Script copy in the 2026-08-20 session
  scratchpad; trivially re-derivable from the notes above.

## Upgrade to `@videojs/react@10.0.0-rc.2` (2026-09-11)

First release candidate; upgraded from `10.0.0-beta.27`. Breaking API deltas that hit
this app (all in `components/videojs-v10-player-page.tsx`):

- **Media adapters are now optional peer deps.** `@videojs/react/media/mux-video/*`
  import `@videojs/mux-video`, and Mux Data lives in `@videojs/mux-data` — both must be
  installed explicitly (`npm i @videojs/mux-video @videojs/mux-data`); npm doesn't
  auto-install optional peers and the failure is a module-not-found at build time.
- **`MuxData` moved**: `@videojs/react/media/mux-data` → `@videojs/react/extensions/mux-data`.
  Props unchanged for our usage (`envKey`, `beaconCollectionDomain`,
  `playerSoftwareName`, `metadata`).
- **`poster` moved from `VideoSkin` to `VideoPlayer`** (`MediaContentValue`; a URL
  string still works). The skin's `<img class="media-poster-image">` gets its `src` from
  the player and the `src` *is* server-rendered (relevant because the skin CSS hides a
  poster image without `src`/`srcset`).
- **`VideoSkin.placeholder` removed → `renderPoster`.** The blurup is now our own
  `background: url(...)` on the poster `<img>`. `renderPoster` accepts either a render
  function or a React *element* (`renderElement()` clones it and merges `style`); the
  element form is what keeps this passable from the server component without a client
  wrapper. Friction item 6's percent-encoding stays (same SSR'd style-attribute hazard).

Verified on the production build (Playwright, Chrome), test playback ID
`BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM`:
`/v/[id]/videojs-v10` (→ hls.js fallback, foreign-env asset), `/videojs-v10-spf`,
`/videojs-v10-hlsjs?autoplay`, `?color=ff0000`: SSR'd `<video>`, poster `src`,
blurup background and intact skin inline styles (aspect-ratio included) on every
route; playback advances on both engines (SPF via MSE blob src, no `window.Hls`
global on the SPF route; muted autoplay honored); Mux Data beacons POST to
`data.stream.new`; CLS 0; zero console errors. `/v/[id]` (mux-player) and `/embed`
unaffected. `tsc`, eslint, jest all green.

## Default player switch: `videojs-v10-hlsjs` is the `/v/[id]` default (2026-09-11)

`DEFAULT_PLAYER_TYPE` (constants.ts) now points at the hls.js-backed v10 type; Mux
Player stays reachable at `/v/[id]/mux-player` (and remains the `/embed` player). Both
`/v` pages share `getV10EngineForPlayerType()` (lib/videojs-v10-engine.ts) and
`getV10PagePropsFromSearchParams()` (lib/player-page-utils.ts), so the default and
explicit routes are symmetric — flipping the default is a one-constant change.

**Why hls.js and not SPF/auto this round.** SPF-preferred was judged not yet safe as a
blanket default because three documented items compound into one invisible failure:
the engine selector is a metadata heuristic (rare basic/premium TS-fallback assets still
land on SPF, which can't play TS), SPF source rejections never reach the media element
so Mux Data records *nothing* (friction item 7), and there is no runtime
error→hls.js fallback. hls.js-backed has none of those blind spots while still putting
the v10 skin + server-first page in production.

**Fast follow (agreed 2026-09-11) before SPF-preferred becomes the default:**
1. **Runtime SPF-error → hls.js fallback, and/or surface SPF engine errors to Mux Data**
   (the gate). Note the app's "fallback based on feature support" does not exist yet
   either — selection is server-side from asset metadata; a client-side
   MediaSource/ManagedMediaSource check would be part of this item.
2. ~~**`?time=` parity on the v10 pages**~~ ✅ done 2026-09-11 (`?time=` parsed
   server-side in `getV10PagePropsFromSearchParams`; hls.js flavor →
   `source.engine.hlsJs.startPosition`, plus a once-only `onLoadedMetadata` seek in
   `VideojsV10Media` as the fallback for SPF and iOS native HLS; friction item 4
   re-checked — rc.2 still has no declarative start time).
3. **iOS Safari + portrait-asset pass** — all measurements so far are desktop Chrome.
4. **Reversible rollout affordance** — cookie/query override so Mux Player is one
   click away for support, then flip `DEFAULT_PLAYER_TYPE` to `videojs-v10`.

Also still open and now on the default path: preload non-functional (item 8 — hls.js
pre-buffers ~32s per never-played view, a bandwidth cost we can't currently turn off);
per-playbackId caching is moot for the hls.js default (explicit types skip the Mux API
lookup) but returns with the auto type.

Verified on the production build (Playwright, Chrome): `/v/[id]` SSRs the v10 page,
plays via hls.js, beacons to `data.stream.new`; `/v/[id]/mux-player` renders Mux Player;
`/embed` unchanged.

**Mux Data naming (2026-09-11, friction item 9).** The v10 page now reports
`player_software_name` derived from the media import path — `videojs-react-mux-video-hls-js`
/ `videojs-react-mux-video-spf` — with `player_name: 'stream.new'` like the other
first-class players, and the version left to the library default (the `@videojs/mux-data`
package version). The spike-era `${playerType}-rsc` name and descriptive `player_name`
strings are gone; historical local views (through 2026-09-11) carry those. Follow-up:
move render path (`rsc`/`client`), engine and stream.new player type into Mux Data custom
dimensions (`custom_1..`) for bisecting.
