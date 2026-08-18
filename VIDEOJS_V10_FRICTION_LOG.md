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

**Pre-existing app finding (out of scope, not v10's fault).** In **production**, *every*
player route shifts ≈ 1.4 — the "Loading player" centered layout → player layout swap is
inherent to `PlayerPage`'s `videoExists → tryToLoadPlayer → onLoaded` client-side chain,
and dev only masked it for the SSR'd players via warm chunks. The v10 routes are now at
parity with `mux-player`; fixing the swap itself (e.g. reserving the final layout during
the loading state) would be an app-level change benefiting all players.

**Upstream candidates.**
- Docs: a "layout stability" note — the skin has no intrinsic size before media/poster
  arrive; recommend an `aspect-ratio` box owned by the *host* app (and warn that
  `aspect-ratio` + `height` contributes no intrinsic width inside shrink-to-fit parents).
- Docs (Next.js guide): `next/dynamic` works *without* `{ ssr: false }`; recommend against
  client-only loading for CLS reasons.

## 3. `'use client'` / dynamic-import assumptions 🔜 open follow-up (separate branch)

stream.new renders every player inside a `'use client'` `PlayerPage` and loads all of them
via `next/dynamic`, so this integration never validated what v10 actually *requires*:

- Can the v10 components be imported statically (no `next/dynamic`) from a server
  component page, with the RSC boundary at the component itself? (Would our component
  modules then need their own `'use client'`?)
- What does v10 actually render on the server? (In this app the players only mount
  client-side post-hydration, so SSR output was never exercised — item 2 only proved the
  modules *evaluate* safely in a server context.)
- Bundle implications of static vs dynamic import for multi-player pages.

Partial answers from item 2's ablations: the components evaluate server-side without
errors, hydrate cleanly via plain `next/dynamic`, and need no `'use client'` banner of
their own *when imported from an existing client tree* (measured no-op; removed).

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
