This is deployed to vercel automatically on the mux/stream.new project

## Plus-quality uploads (`PLUS_UPLOAD_PERCENT`, server-side env var)

Uploads are created with `video_quality: 'basic'`, which Mux delivers as CMAF. Setting `PLUS_UPLOAD_PERCENT` to an integer from `0` to `100` creates that percentage of new uploads with `video_quality: 'plus'` instead, which Mux delivers as MPEG-TS. This exists to put real traffic on the video.js SPF engine's MPEG-TS transmux path (see `lib/videojs-engine.ts`).

- The code default is `0`: unset, empty, non-integer or out-of-range values all mean "every upload is `basic`".
- Production is set to `25` through the Vercel project's environment variables for the SPF MPEG-TS stability test (stakeholder-approved). Plus is a paid-encoding tier, so check before raising it.
- To turn it off, set the variable to `0` or remove it in Vercel, then redeploy (a changed variable only applies to new deployments).
- It is read per request in `app/api/uploads/route.ts` (`lib/upload-quality.ts`) and is server-side only. Do not give it a `NEXT_PUBLIC_` prefix.
- Each plus upload is logged as `[stream.new] upload <id> created with video_quality=plus`.
- Changing it only affects uploads created afterwards; existing plus assets keep playing (and keep going to SPF).

## Watching video.js playback health in Sentry

The video.js player page (`components/videojs-media.tsx`) reports fatal playback errors to Sentry (project `stream-dot-new`) as `video.js playback error (<engine>, code <code>): <message>`, and tags every event captured while the player is on the page:

- `videojs_engine`: `spf` or `hlsjs`
- `player_type`: `videojs` (the `/v/:id` default), `videojs-spf` or `videojs-hlsjs`
- `playback_id`
- `media_error_code` (playback errors only): an SVTA code for SPF (for example `99001`, unsupported playback feature), a `MediaError` code for hls.js

Useful searches: `videojs_engine:spf` (everything on SPF pages), `message:"video.js playback error" videojs_engine:spf` (SPF playback failures), and the same with `hlsjs` as the baseline.

