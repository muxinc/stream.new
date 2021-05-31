
export function getThumbnailUrls ({ playbackId, duration }: { playbackId: string, duration: number }): string[] {
  /*
   * Get 3 thumbnails based on the duration
   */
  const timestamps = [(duration * 0.25),  (duration * 0.5), (duration * 0.75)];
  const urls = timestamps.map((time) => `https://image.mux.com/${playbackId}/thumbnail.png?time=${time}`);
  return urls;
}
