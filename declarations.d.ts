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

declare module 'mux-embed' {
  export function monitor (video: HTMLVideoElement, options: Record<string, any>) // eslint-disable-line @typescript-eslint/no-explicit-any
}

type NoProps = Record<never, never>
