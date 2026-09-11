import { notFound } from 'next/navigation';
import { DEFAULT_PLAYER_TYPE, VIDEOJS_PLAYER_TYPES } from '../../../constants';
import type { PlayerTypes } from '../../../constants';
import PlayerPage from '../../../components/player-page';
import VideojsPlayerPage from '../../../components/videojs-player-page';
import { getPropsFromPlaybackId, getVideojsPagePropsFromSearchParams, getPlayerPageMetadata } from '../../../lib/player-page-utils';
import { getVideojsEngineForPlayerType } from '../../../lib/videojs-engine';

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getPlayerPageMetadata(id);
}

export default async function PlaybackPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params;
  const props = await getPropsFromPlaybackId(id);

  if (!props.videoExists) {
    notFound();
  }

  // The video.js player types render fully on the server; the rest render
  // client-side via PlayerPage/PlayerLoader (which reads ?color= itself).
  // Kept symmetric with /v/[id]/[playerType]. (CJP)
  if (VIDEOJS_PLAYER_TYPES.includes(DEFAULT_PLAYER_TYPE)) {
    const videojsProps = getVideojsPagePropsFromSearchParams(await searchParams);
    const engine = await getVideojsEngineForPlayerType(DEFAULT_PLAYER_TYPE, id);
    return <VideojsPlayerPage {...props} playerType={DEFAULT_PLAYER_TYPE} engine={engine} {...videojsProps} />;
  }

  return (
    <PlayerPage
      playbackId={props.playbackId}
      videoExists={props.videoExists}
      shareUrl={props.shareUrl}
      poster={props.poster}
      aspectRatio={props.aspectRatio}
      blurDataURL={props.blurDataURL}
      playerType={DEFAULT_PLAYER_TYPE as PlayerTypes}
    />
  );
}
