'use client';

/*
 * Testing-only instrumentation leaf, rendered by the v10 player page when
 * ?perf is present. Records nav-anchored (performance.now) timestamps for the
 * media element's startup lifecycle plus the first *rendered* frame via
 * requestVideoFrameCallback — the only engine-neutral first-frame signal (see
 * the v10 integration notes (kept outside this repo), "Symmetric warm-start harness") — and
 * exposes them at window.__perfMarks for harnesses to poll. rsAtMount flags
 * runs where this leaf attached after playback had already begun. (CJP)
 */
import { useEffect } from 'react';

declare global {
  interface Window {
    __perfMarks?: Record<string, number>;
  }
}

const PerfMarks: React.FC = () => {
  useEffect(() => {
    const marks: Record<string, number> = { mount: performance.now() };
    window.__perfMarks = marks;
    const video = document.querySelector('video');
    if (!video) {
      marks.noVideoAtMount = 1;
      return;
    }
    marks.rsAtMount = video.readyState;
    const stamp = (name: string) => () => {
      if (!(name in marks)) marks[name] = performance.now();
    };
    const handlers = ['loadstart', 'loadedmetadata', 'canplay', 'play', 'playing'].map((ev) => {
      const handler = stamp(ev);
      video.addEventListener(ev, handler, { once: true });
      return { ev, handler };
    });
    if ('requestVideoFrameCallback' in video) {
      video.requestVideoFrameCallback((_now, meta) => {
        marks.firstFrame = performance.now();
        marks.firstFrameMediaTime = meta.mediaTime * 1000;
      });
    }
    return () => handlers.forEach(({ ev, handler }) => video.removeEventListener(ev, handler));
  }, []);
  return null;
};

export default PerfMarks;
