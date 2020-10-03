import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const { method } = req;

  switch (method) {
    case 'POST':
      console.log('debug...', req.body);
      res.json({ message: 'thank you' });
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
