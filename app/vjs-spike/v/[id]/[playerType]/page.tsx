/*
 * Server-first mirror of /v/[id]/[playerType] for the video.js v10 use cases.
 * The page, props derivation, metadata, and player are all server-rendered;
 * see components/vjs-spike/server-player-page.tsx. (CJP)
 */
import { notFound } from 'next/navigation';
import ServerPlayerPage from '../../../../../components/vjs-spike/server-player-page';
import { getPropsFromPlaybackId } from '../../../../../lib/player-page-utils';
import { VIDEOJS_V10_SPF_TYPE, VIDEOJS_V10_HLSJS_TYPE } from '../../../../../constants';

// This spike route only covers the video.js v10 players.
const SPIKE_PLAYER_TYPES: string[] = [VIDEOJS_V10_SPF_TYPE, VIDEOJS_V10_HLSJS_TYPE];

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

export default async function VjsSpikePlayerTypePage({
  params,
}: {
  params: Promise<{ id: string; playerType: string }>;
}) {
  const { id, playerType } = await params;

  if (!SPIKE_PLAYER_TYPES.includes(playerType)) {
    notFound();
  }

  const props = await getPropsFromPlaybackId(id);

  if (!props.videoExists) {
    notFound();
  }

  return <ServerPlayerPage {...props} playerType={playerType} />;
}
