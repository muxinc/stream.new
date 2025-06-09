import { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';

const mux = new Mux();

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;
  const { playbackId } = req.query;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
    return;
  }

  try {
    // Get the playback ID details which includes the asset ID
    const playbackIdData = await mux.video.playbackIds.retrieve(playbackId as string);
    
    if (!playbackIdData || !playbackIdData.object || playbackIdData.object.type !== 'asset') {
      res.status(404).json({ error: 'Playback ID not found or not associated with an asset' });
      return;
    }

    const assetId = playbackIdData.object.id;
    
    // Get the full asset details
    const asset = await mux.video.assets.retrieve(assetId);
    
    // Return comprehensive asset data
    res.json({
      asset: {
        id: asset.id,
        status: asset.status,
        created_at: asset.created_at,
        duration: asset.duration,
        max_stored_resolution: asset.max_stored_resolution,
        max_stored_frame_rate: asset.max_stored_frame_rate,
        aspect_ratio: asset.aspect_ratio,
        tracks: asset.tracks,
        errors: asset.errors,
        playback_ids: asset.playback_ids,
        upload_id: asset.upload_id,
        source_asset_id: asset.source_asset_id,
        master_access: asset.master_access,
        mp4_support: asset.mp4_support,
        encoding_tier: asset.encoding_tier,
        video_quality: asset.video_quality
      },
      playback_id_details: {
        id: playbackIdData.id,
        policy: playbackIdData.policy,
        drm_configuration_id: playbackIdData.drm_configuration_id
      }
    });
  } catch (error: any) {
    console.error('Error fetching asset by playback ID:', error);
    
    // If it's a 404, return a more helpful error
    if (error.status === 404) {
      res.status(404).json({ 
        error: 'Asset not found',
        message: 'The playback ID may be invalid or the asset may have been deleted'
      });
    } else {
      res.status(500).json({ 
        error: 'Error fetching asset data',
        message: error.message || 'Unknown error occurred'
      });
    }
  }
}