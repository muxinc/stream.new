import { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';

const mux = new Mux();

interface ViewsResponse {
  data: {
    value: number;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;
  const { playbackId } = req.query;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
    return;
  }

  try {
    console.log('Getting view count for playback ID:', playbackId);
    
    // Use the raw API endpoint for metrics/views/overall
    const response = await mux.request({
      method: 'get',
      path: '/data/v1/metrics/views/overall',
      query: {
        timeframe: ['7:days'],
        filters: [`video_id:${playbackId}`]
      }
    });

    console.log('Mux Data API response:', JSON.stringify(response, null, 2));

    // Get the total view count from the response
    const totalViews = (response as unknown as ViewsResponse).data.value || 0;
    console.log('Total views:', totalViews);

    res.json({
      views: totalViews,
      timeframe: '7d'
    });
  } catch (e: any) {
    console.error('Error fetching view count:', e);
    if (e instanceof Error) {
      console.error('Error details:', e.message);
      console.error('Error stack:', e.stack);
    }
    
    // Check if it's a Mux API error
    if (e.status === 403) {
      console.error('Mux Data API access denied. Make sure MUX_TOKEN_ID and MUX_TOKEN_SECRET are set correctly.');
      res.status(403).json({ error: 'Mux Data API access denied' });
    } else if (e.status === 404) {
      console.error('No data found for this playback ID');
      res.status(404).json({ error: 'No view data found for this video' });
    } else {
      res.status(500).json({ error: 'Error fetching view count' });
    }
  }
} 