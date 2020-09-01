import Mux from '@mux/mux-node';

const { Video } = new Mux();

export default async function assetHandler (req, res) {
  if (
    !process.env.SLACK_MODERATOR_PASSWORD
    || (req.query['slack-moderator-password'] !== process.env.SLACK_MODERATOR_PASSWORD)
  ) {
    res.status(401).end('Unauthorized');
    return;
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        await Video.Assets.del(req.query.id);
        res.status(200).end(`Deleted ${req.query.id}`);
      } catch (e) {
        res.statusCode = 500;
        console.error('Request error', e); // eslint-disable-line no-console
        res.end('Error deleting asset');
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
