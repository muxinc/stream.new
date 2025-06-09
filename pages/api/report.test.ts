import { NextApiRequest, NextApiResponse } from 'next';
import reportHandler from './report';
import { sendAbuseReport } from '../../lib/slack-notifier';
import got from '../../lib/got-client';

jest.mock('../../lib/slack-notifier');
jest.mock('../../lib/got-client');

describe('/api/report', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let endMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    endMock = jest.fn().mockReturnThis();
    
    req = {
      method: 'POST',
      body: {
        playbackId: 'test-playback-id',
        reason: 'inappropriate content'
      }
    };
    
    res = {
      status: statusMock,
      json: jsonMock,
      end: endMock,
      setHeader: jest.fn()
    };

    jest.clearAllMocks();
    (got.post as jest.Mock).mockResolvedValue({});
  });

  describe('POST requests', () => {
    it('should handle valid abuse report', async () => {
      (sendAbuseReport as jest.Mock).mockResolvedValue(null);

      await reportHandler(req as NextApiRequest, res as NextApiResponse);

      expect(sendAbuseReport).toHaveBeenCalledWith({
        playbackId: 'test-playback-id',
        reason: 'inappropriate content',
        comment: undefined
      });
      expect(jsonMock).toHaveBeenCalledWith({ message: 'thank you' });
    });

    it('should handle report with comment', async () => {
      req.body = {
        playbackId: 'test-id',
        reason: 'spam',
        comment: 'This is additional context'
      };
      (sendAbuseReport as jest.Mock).mockResolvedValue(null);

      await reportHandler(req as NextApiRequest, res as NextApiResponse);

      expect(sendAbuseReport).toHaveBeenCalledWith({
        playbackId: 'test-id',
        reason: 'spam',
        comment: 'This is additional context'
      });
    });

    it('should send to Airtable when configured', async () => {
      process.env.AIRTABLE_KEY = 'test-key';
      process.env.AIRTABLE_BASE_ID = 'test-base';
      
      await reportHandler(req as NextApiRequest, res as NextApiResponse);

      expect(got.post).toHaveBeenCalledWith(
        'https://api.airtable.com/v0/test-base/Reported',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer test-key'
          },
          json: {
            records: [
              {
                fields: {
                  playbackId: 'test-playback-id',
                  reason: 'inappropriate content',
                  comment: undefined,
                  status: 'Pending'
                }
              }
            ]
          }
        })
      );

      delete process.env.AIRTABLE_KEY;
      delete process.env.AIRTABLE_BASE_ID;
    });

    it('should continue even if Airtable fails', async () => {
      process.env.AIRTABLE_KEY = 'test-key';
      process.env.AIRTABLE_BASE_ID = 'test-base';
      (got.post as jest.Mock).mockRejectedValueOnce(new Error('Airtable error'));
      (sendAbuseReport as jest.Mock).mockResolvedValue(null);

      await reportHandler(req as NextApiRequest, res as NextApiResponse);

      expect(sendAbuseReport).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({ message: 'thank you' });

      delete process.env.AIRTABLE_KEY;
      delete process.env.AIRTABLE_BASE_ID;
    });

    it('should continue even if Slack fails', async () => {
      (sendAbuseReport as jest.Mock).mockRejectedValue(new Error('Slack error'));

      await reportHandler(req as NextApiRequest, res as NextApiResponse);

      expect(jsonMock).toHaveBeenCalledWith({ message: 'thank you' });
    });
  });

  describe('non-POST requests', () => {
    it('should reject GET requests', async () => {
      req.method = 'GET';

      await reportHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
      expect(statusMock).toHaveBeenCalledWith(405);
      expect(endMock).toHaveBeenCalledWith('Method GET Not Allowed');
    });

    it('should reject PUT requests', async () => {
      req.method = 'PUT';

      await reportHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
      expect(statusMock).toHaveBeenCalledWith(405);
      expect(endMock).toHaveBeenCalledWith('Method PUT Not Allowed');
    });

    it('should reject DELETE requests', async () => {
      req.method = 'DELETE';

      await reportHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
      expect(statusMock).toHaveBeenCalledWith(405);
      expect(endMock).toHaveBeenCalledWith('Method DELETE Not Allowed');
    });
  });
});