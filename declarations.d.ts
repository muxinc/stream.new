interface Window {
  webkitAudioContext: typeof AudioContext
}

interface MediaDevices {
  getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
}

interface MediaTrackConstraintSet {
  displaySurface?: ConstrainDOMString;
  logicalSurface?: ConstrainBoolean;
}

/*
 * Global (side-effect) CSS imports from packages, e.g.
 * `import '@videojs/react/video/skin.css'` or `import 'plyr/dist/plyr.css'`.
 * Without this, editors running TS >= 5.9 surface ts(2882) ("Cannot find module
 * or type declarations for side-effect import"), since these packages don't
 * ship type declarations for their CSS export paths. (CJP)
 */
declare module '*.css';

declare module 'mux-embed' {
  export function monitor (video: HTMLVideoElement, options: Record<string, any>) // eslint-disable-line @typescript-eslint/no-explicit-any
}

type NoProps = Record<never, never>
