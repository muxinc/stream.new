import { NextApiRequest, NextApiResponse } from 'next';
import { Mux } from '@mux/mux-node';

const mux = new Mux();

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const upload = await mux.video.uploads.create({
          new_asset_settings: { 
            playback_policy: ['public'],
            inputs: [
              {
                generated_subtitles: [
                  {
                    language_code: 'en',
                    name: 'English (Auto-generated)'
                  }
                ]
              }
            ]
          },
          cors_origin: '*'
        });
        res.status(200).json({
          id: upload.id,
          url: upload.url,
        });
      } catch (error: any) {
        console.error('Request error', error);
        console.error('Mux error structure:', JSON.stringify(error, null, 2));

        // Extract error message from Mux API response
        const muxMessages = error?.error?.messages || error?.error?.error?.messages;
        const errorMessage = Array.isArray(muxMessages) && muxMessages.length > 0
          ? muxMessages[0]
          : 'Error creating upload. Please try again later.';

        res.status(400).json({
          error: errorMessage
        });
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
};
