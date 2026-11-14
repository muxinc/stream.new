/*
 * Video quality for new direct uploads.
 *
 * Uploads are `basic` (delivered as CMAF). PLUS_UPLOAD_PERCENT (integer
 * 0-100, server-side only, default 0) creates that percentage of uploads as
 * `plus` instead, which Mux delivers as MPEG-TS — the content the video.js
 * SPF engine's transmuxer needs real traffic on. Unset, empty or invalid
 * values mean 0, so nothing changes unless the variable is set. See
 * README_INTERNAL.md.
 */
export type UploadVideoQuality = 'basic' | 'plus';

export function getPlusUploadPercent(
  value: string | undefined = process.env.PLUS_UPLOAD_PERCENT
): number {
  const trimmed = value?.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) return 0;

  const percent = Number(trimmed);
  return percent <= 100 ? percent : 0;
}

export function pickUploadVideoQuality(
  percent: number = getPlusUploadPercent(),
  random: () => number = Math.random
): UploadVideoQuality {
  // random() is in [0, 1): 0 never picks plus, 100 always does.
  return random() * 100 < percent ? 'plus' : 'basic';
}
