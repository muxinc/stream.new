import { notFound } from 'next/navigation';
import PlayerPage from '../../../../components/player-page';
import VideojsPlayerPage from '../../../../components/videojs-player-page';
import { getPropsFromPlaybackId, getVideojsPagePropsFromSearchParams, getPlayerPageMetadata } from '../../../../lib/player-page-utils';
import { getVideojsEngineForPlayerType } from '../../../../lib/videojs-engine';
import { VIDEOJS_PLAYER_TYPES } from '../../../../constants';
import type { PlayerTypes } from '../../../../constants';

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return getPlayerPageMetadata(id);
}

export default async function PlayerTypePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string; playerType: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id, playerType } = await params;
  const props = await getPropsFromPlaybackId(id);

  if (!props.videoExists) {
    notFound();
  }

  // The video.js player types render fully on the server; the rest render
  // client-side via PlayerPage/PlayerLoader (which reads ?color= itself). (CJP)
  if (VIDEOJS_PLAYER_TYPES.includes(playerType)) {
    const videojsProps = getVideojsPagePropsFromSearchParams(await searchParams);
    const engine = await getVideojsEngineForPlayerType(playerType, id);
    return <VideojsPlayerPage {...props} playerType={playerType} engine={engine} {...videojsProps} />;
  }

  return (
    <PlayerPage
      playbackId={props.playbackId}
      videoExists={props.videoExists}
      shareUrl={props.shareUrl}
      poster={props.poster}
      aspectRatio={props.aspectRatio}
      blurDataURL={props.blurDataURL}
      playerType={playerType as PlayerTypes}
    />
  );
}
