import { notFound } from 'next/navigation';
import PlayerPage from '../../../../components/player-page';
import VideojsV10PlayerPage from '../../../../components/videojs-v10-player-page';
import { getPropsFromPlaybackId, getColorFromQueryValue } from '../../../../lib/player-page-utils';
import { VIDEOJS_V10_PLAYER_TYPES } from '../../../../constants';
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
    const color = getColorFromQueryValue((await searchParams).color);
    return <VideojsV10PlayerPage {...props} playerType={playerType} color={color} />;
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
