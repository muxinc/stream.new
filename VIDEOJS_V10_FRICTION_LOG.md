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

**Root causes (three stacked, found via `PerformanceObserver` layout-shift attribution).**

1. **`{ ssr: false }` on the `next/dynamic` imports** (cargo-culted from the Plyr player).
   Client-only loading defers the player chunk past hydration, so the page paints its
   "centered loading" layout and re-layouts when the chunk mounts (shift ≈ 0.94). The
   v10 React components hydrate cleanly through plain `next/dynamic` — `ssr: false` was
   never needed. Plyr has the same measured problem (CLS ≈ 0.95) for the same reason.
2. **`onLoaded` timing.** stream.new's `PlayerPage` keeps a `centered={showLoading}`
   layout until the player calls `onLoaded`. The established players call it on *mount*;
   wiring it to `loadedmetadata` (which reads as more "correct") makes the layout swap
   visibly late. Convention followed: fire on mount.
3. **Intrinsic-width starvation.** `PlayerPage`'s `.wrapper` was shrink-to-fit inside a
   centered flex parent, and a box sized by `aspect-ratio` + `height: 100%` contributes
   **zero intrinsic width** — so the wrapper sat at the width of the actions row (272px)
   until real content (poster/video) arrived (shift ≈ 0.31). `mux-player` dodges this only
   because its custom element has intrinsic size at upgrade. Fixed generically with
   `width: 100%` on `.wrapper`.

Additionally, sizing for the v10 players now lives on a wrapper `<div>` in `PlayerLoader`
(which renders immediately) rather than on the skin — the skin fills it at
`width/height: 100%` — so the box exists regardless of when the player mounts.

**Measured results** (CLS, playback ID `BV3Y…`, 1200×897 viewport):

| Route | dev before | dev after | prod after |
|---|---|---|---|
| videojs-v10-spf | 1.44 | **0.02** | 1.44 |
| videojs-v10-hlsjs | 1.44 | **0.02** | 1.44 |
| mux-player (control) | 0.02 | 0.02 | 1.44 |
| mux-video (control) | — | — | 1.48 |
| plyr | 0.96 | 0.96 | 0.95 |

**Portrait/vertical.** Verified: forcing a 9:16 aspect ratio resolves the v10 box to the
same geometry as `mux-player`'s (390×694, centered, no overflow) — the reserve box uses
the same `aspect-ratio`/`height:100%`/`max-width:100%` style `mux-player` uses. (Simulated
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

- Is `'use client'` needed at the importing boundary, or do the components self-declare?
  (Both our components carry their own `'use client'` banner; untested without it.)
- Can the v10 components be imported statically (no `next/dynamic`) from a server
  component page, with the RSC boundary at the component itself?
- What does v10 actually render on the server? (In this app the players only mount
  client-side post-hydration, so SSR output was never exercised — item 2 only proved the
  modules *evaluate* safely in a server context.)
- Bundle implications of static vs dynamic import for multi-player pages.

Partial answers from item 2: the components evaluate server-side without errors and
hydrate cleanly via plain `next/dynamic`.

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
