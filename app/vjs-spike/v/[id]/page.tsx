/*
 * Server-first mirror of /v/[id] — defaults to the SPF-backed player. (CJP)
 */
import { redirect } from 'next/navigation';
import { VIDEOJS_V10_SPF_TYPE } from '../../../../constants';

export default async function VjsSpikeDefaultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/vjs-spike/v/${encodeURIComponent(id)}/${VIDEOJS_V10_SPF_TYPE}`);
}
