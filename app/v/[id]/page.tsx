import { notFound } from 'next/navigation';
import { MUX_PLAYER_TYPE, SERVER_RENDERED_PLAYER_TYPES } from '../../../constants';
import PlayerPage from '../../../components/player-page';
import ServerPlayerPage from '../../../components/server-player-page';
import { getPropsFromPlaybackId } from '../../../lib/player-page-utils';

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

export default async function PlaybackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const props = await getPropsFromPlaybackId(id);

  if (!props.videoExists) {
    notFound();
  }

  // The video.js v10 player types render fully on the server; the rest render
  // client-side via PlayerPage/PlayerLoader. Wired here symmetrically with
  // /v/[id]/[playerType] in case the default player type ever changes. (CJP)
  if (SERVER_RENDERED_PLAYER_TYPES.includes(MUX_PLAYER_TYPE)) {
    return <ServerPlayerPage {...props} playerType={MUX_PLAYER_TYPE} />;
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
