import { getImageBaseUrl } from './urlutils';

export function getThumbnailUrls ({ playbackId, duration }: { playbackId: string, duration: number }): string[] {
  /*
   * Get 5 thumbnails, weighted towards the middle of the content, based on the duration
   * TODO: Make this more dependent on the duration - this is wasteful for short video.
   */
  const timestamps = [(duration * 0.25), (duration * 0.33),  (duration * 0.5), (duration * 0.66), (duration * 0.75)];
  const urls = timestamps.map((time) => `${getImageBaseUrl()}/${playbackId}/thumbnail.png?time=${time}`);
  return urls;
}
