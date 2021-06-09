function urlutils (): void {}

urlutils.getStreamBaseUrl = function() {
  return (process.env.NEXT_PUBLIC_STREAM_PLAYBACK_BASEURL) ? process.env.NEXT_PUBLIC_STREAM_PLAYBACK_BASEURL : 'https://stream.mux.com';
}

urlutils.getImageBaseUrl = function() {
  return (process.env.NEXT_PUBLIC_IMAGE_PLAYBACK_BASEURL) ? process.env.NEXT_PUBLIC_IMAGE_PLAYBACK_BASEURL : 'https://image.mux.com';
}

export default urlutils;
