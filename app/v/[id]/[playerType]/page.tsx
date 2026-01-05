import { notFound } from 'next/navigation';
import PlayerPage from '../../../../components/player-page';
import { getPropsFromPlaybackId } from '../../../../lib/player-page-utils';
import type { PlayerTypes } from '../../../../constants';

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: { id: string } }) {
  const props = await getPropsFromPlaybackId(params.id);
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
  params: { id: string; playerType: string }
}) {
  const props = await getPropsFromPlaybackId(params.id);

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
      playerType={params.playerType as PlayerTypes}
    />
  );
}
