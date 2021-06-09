export function getStreamBaseUrl() {
  return (process.env.NEXT_PUBLIC_STREAM_PLAYBACK_BASEURL) ? process.env.NEXT_PUBLIC_STREAM_PLAYBACK_BASEURL : 'https://stream.mux.com';
}

export function getImageBaseUrl() {
  return (process.env.NEXT_PUBLIC_IMAGE_PLAYBACK_BASEURL) ? process.env.NEXT_PUBLIC_IMAGE_PLAYBACK_BASEURL : 'https://image.mux.com';
}
