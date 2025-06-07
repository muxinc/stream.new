import { NextApiRequest, NextApiResponse } from 'next';
import handler from './index';
import { Mux } from '@mux/mux-node';

// Mock the Mux class so the API route uses our mock
jest.mock('@mux/mux-node', () => {
  const mockCreate = jest.fn();
  return {
    Mux: jest.fn().mockImplementation(() => ({
      video: {
        uploads: {
          create: mockCreate
        }
      }
    })),
    __mockCreate: mockCreate
  };
});

describe('Uploads API', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let setHeaderMock: jest.Mock;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    setHeaderMock = jest.fn();
    mockRes = {
      status: statusMock,
      json: jsonMock,
      setHeader: setHeaderMock
    };
    mockReq = {
      method: 'POST',
      body: {
        filename: 'test.mp4'
      }
    };
    mockCreate = require('@mux/mux-node').__mockCreate;
    mockCreate.mockReset();
  });

  it('should pass through Mux API error messages', async () => {
    const error = {
      error: {
        messages: ['Free plan is limited to 10 assets']
      }
    };
    mockCreate.mockRejectedValueOnce(error);

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Free plan is limited to 10 assets'
    });
  });

  it('should handle nested Mux API error messages', async () => {
    const error = {
      error: {
        error: {
          messages: ['Free plan is limited to 10 assets, you cannot create direct uploads while exceeding this limit']
        }
      }
    };
    mockCreate.mockRejectedValueOnce(error);

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Free plan is limited to 10 assets, you cannot create direct uploads while exceeding this limit'
    });
  });

  it('should handle successful upload creation', async () => {
    const mockUpload = {
      id: 'test-upload-id',
      url: 'https://test-upload-url.com'
    };
    mockCreate.mockResolvedValueOnce(mockUpload);

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(mockUpload);
  });

  it('should handle unknown errors', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Unknown error'));

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Error creating upload. Please try again later.'
    });
  });

  it('should reject non-POST methods', async () => {
    mockReq.method = 'GET';

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse);

    expect(setHeaderMock).toHaveBeenCalledWith('Allow', ['POST']);
    expect(statusMock).toHaveBeenCalledWith(405);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Method GET Not Allowed' });
  });
}); 