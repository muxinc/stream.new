/*
 * Exploratory spike: which client/server boundaries do the video.js v10 use
 * cases actually need? This page is a SERVER component (no 'use client') with a
 * parameterized variant per boundary strategy:
 *
 *   /vjs-spike/rsc-static     — no app-level 'use client', no next/dynamic
 *   /vjs-spike/client-static  — 'use client' wrapper, static imports
 *   /vjs-spike/client-dynamic — 'use client' + next/dynamic (stream.new's current approach)
 *
 * Query params: ?playbackId=<id> (defaults to a public test asset), ?engine=spf|hlsjs.
 * Expand VARIANTS as new strategies come up. (CJP)
 */
import { notFound } from 'next/navigation';
import RscStaticPlayer from '../../../components/vjs-spike/rsc-static-player';
import ClientStaticPlayer from '../../../components/vjs-spike/client-static-player';
import ClientDynamicPlayer from '../../../components/vjs-spike/client-dynamic-player';
import type { SpikeEngine, SpikePlayerProps } from '../../../components/vjs-spike/types';

const DEFAULT_PLAYBACK_ID = 'BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM';

const VARIANTS: Record<string, React.ComponentType<SpikePlayerProps>> = {
  'rsc-static': RscStaticPlayer,
  'client-static': ClientStaticPlayer,
  'client-dynamic': ClientDynamicPlayer,
};

export const metadata = { title: 'video.js v10 boundary spike' };

export default async function VjsSpikePage({
  params,
  searchParams,
}: {
  params: Promise<{ variant: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { variant } = await params;
  const sp = await searchParams;

  const SpikePlayer = VARIANTS[variant];
  if (!SpikePlayer) {
    notFound();
  }

  const playbackIdParam = typeof sp.playbackId === 'string' ? sp.playbackId : '';
  const playbackId = /^[a-zA-Z0-9]+$/.test(playbackIdParam) ? playbackIdParam : DEFAULT_PLAYBACK_ID;
  const engine: SpikeEngine = sp.engine === 'hlsjs' ? 'hlsjs' : 'spf';

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 20, fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: 16 }}>
        vjs-spike / {variant} / {engine} / {playbackId}
      </h1>
      <SpikePlayer playbackId={playbackId} engine={engine} />
    </main>
  );
}
