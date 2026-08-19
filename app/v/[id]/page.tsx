import { notFound } from 'next/navigation';
import { MUX_PLAYER_TYPE, VIDEOJS_V10_PLAYER_TYPES } from '../../../constants';
import PlayerPage from '../../../components/player-page';
import VideojsV10PlayerPage from '../../../components/videojs-v10-player-page';
import { getPropsFromPlaybackId, getColorFromQueryValue } from '../../../lib/player-page-utils';
import { getV10EngineForPlaybackId } from '../../../lib/videojs-v10-engine';

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

  // The video.js v10 player types render fully on the server; the rest render
  // client-side via PlayerPage/PlayerLoader (which reads ?color= itself). Wired
  // here symmetrically with /v/[id]/[playerType] in case the default player
  // type ever changes. (CJP)
  if (VIDEOJS_V10_PLAYER_TYPES.includes(MUX_PLAYER_TYPE)) {
    const color = getColorFromQueryValue((await searchParams).color);
    const engine = await getV10EngineForPlaybackId(id);
    return <VideojsV10PlayerPage {...props} playerType={MUX_PLAYER_TYPE} engine={engine} color={color} />;
  }

  return (
    <PlayerPage
      playbackId={props.playbackId}
      videoExists={props.videoExists}
      shareUrl={props.shareUrl}
      poster={props.poster}
      aspectRatio={props.aspectRatio}
      blurDataURL={props.blurDataURL}
      playerType={MUX_PLAYER_TYPE}
    />
  );
}
