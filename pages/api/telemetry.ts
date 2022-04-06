import { NextApiRequest, NextApiResponse } from 'next';

const TELEMETRY_ENDPOINT = process.env.TELEMETRY_ENDPOINT;

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const { method, body } = req;

  switch (method) {
    case 'POST':
      console.log(body);
      if (TELEMETRY_ENDPOINT) {
        res.send(await fetch(TELEMETRY_ENDPOINT, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }, 
          body 
        }));
      } else {
        res.json({ message: 'Nothing happened because telemetry is not configured.' });
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
