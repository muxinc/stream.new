import { notFound } from 'next/navigation';
import PlayerPage from '../../../../components/player-page';
import { getPropsFromPlaybackId } from '../../../../lib/player-page-utils';
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
  params
}: {
  params: Promise<{ id: string; playerType: string }>
}) {
  const { id, playerType } = await params;
  const props = await getPropsFromPlaybackId(id);

  if (!props.videoExists) {
    notFound();
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
