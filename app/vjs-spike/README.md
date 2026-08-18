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
