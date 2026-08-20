import { notFound } from 'next/navigation';
import PlayerPage from '../../../../components/player-page';
import VideojsV10PlayerPage from '../../../../components/videojs-v10-player-page';
import { getPropsFromPlaybackId, getColorFromQueryValue } from '../../../../lib/player-page-utils';
import { getV10EngineForPlaybackId } from '../../../../lib/videojs-v10-engine';
import { VIDEOJS_V10_PLAYER_TYPES, VIDEOJS_V10_HLSJS_TYPE, VIDEOJS_V10_SPF_TYPE } from '../../../../constants';
import type { PlayerTypes } from '../../../../constants';

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const props = await getPropsFromPlaybackId(id);
  return {
    title: 'View this video created on stream.new',
    openGraph: {
      images: [props.poster],
    },
    twitter: {
      card: 'player' as const,
      images: [props.poster],
    },
  };
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

  // The video.js v10 player types render fully on the server; the rest render
  // client-side via PlayerPage/PlayerLoader (which reads ?color= itself). (CJP)
  if (VIDEOJS_V10_PLAYER_TYPES.includes(playerType)) {
    const sp = await searchParams;
    const color = getColorFromQueryValue(sp.color);
    // Testing affordances for A/B measurement (integration notes, "A/B lanes").
    const autoplay = sp.autoplay !== undefined;
    const preload = sp.preload === 'none' || sp.preload === 'metadata' || sp.preload === 'auto' ? sp.preload : undefined;
    const perf = sp.perf !== undefined;
    // Explicit engine types force their engine; the auto type
    // (videojs-v10) resolves it server-side from the playback ID's metadata.
    const engine =
      playerType === VIDEOJS_V10_SPF_TYPE
        ? 'spf'
        : playerType === VIDEOJS_V10_HLSJS_TYPE
          ? 'hlsjs'
          : await getV10EngineForPlaybackId(id);
    return <VideojsV10PlayerPage {...props} playerType={playerType} engine={engine} color={color} autoplay={autoplay} preload={preload} perf={perf} />;
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
