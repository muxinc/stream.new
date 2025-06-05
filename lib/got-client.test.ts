/**
 * @jest-environment node
 */
import nock from 'nock';
import { gotClient } from './got-client';

describe('gotClient', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' };
      nock('https://api.example.com')
        .get('/endpoint')
        .reply(200, mockResponse);

      const response = await gotClient.get('https://api.example.com/endpoint').json();
      expect(response).toEqual(mockResponse);
    });

    it('should handle GET request with query parameters', async () => {
      nock('https://api.example.com')
        .get('/endpoint')
        .query({ param1: 'value1', param2: 'value2' })
        .reply(200, { success: true });

      const response = await gotClient.get('https://api.example.com/endpoint', {
        searchParams: { param1: 'value1', param2: 'value2' },
      }).json();

      expect(response).toEqual({ success: true });
    });

    it('should handle GET request errors', async () => {
      nock('https://api.example.com')
        .get('/endpoint')
        .reply(404, { error: 'Not found' });

      await expect(
        gotClient.get('https://api.example.com/endpoint').json()
      ).rejects.toThrow();
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request with JSON body', async () => {
      const requestBody = { key: 'value' };
      const mockResponse = { id: '123' };

      nock('https://api.example.com')
        .post('/endpoint', requestBody)
        .reply(201, mockResponse);

      const response = await gotClient.post('https://api.example.com/endpoint', {
        json: requestBody,
      }).json();

      expect(response).toEqual(mockResponse);
    });

    it('should handle POST request with headers', async () => {
      nock('https://api.example.com', {
        reqheaders: {
          'authorization': 'Bearer token123',
          'content-type': 'application/json',
        },
      })
        .post('/endpoint')
        .reply(200, { authenticated: true });

      const response = await gotClient.post('https://api.example.com/endpoint', {
        headers: {
          authorization: 'Bearer token123',
        },
        json: {},
      }).json();

      expect(response).toEqual({ authenticated: true });
    });

    it('should handle POST request with form data', async () => {
      nock('https://api.example.com')
        .post('/endpoint', 'field1=value1&field2=value2')
        .reply(200, { received: true });

      const response = await gotClient.post('https://api.example.com/endpoint', {
        form: {
          field1: 'value1',
          field2: 'value2',
        },
      }).json();

      expect(response).toEqual({ received: true });
    });
  });

  describe('Error handling', () => {
    it('should provide detailed error information', async () => {
      nock('https://api.example.com')
        .get('/endpoint')
        .reply(500, { message: 'Internal Server Error' });

      try {
        await gotClient.get('https://api.example.com/endpoint').json();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.statusCode).toBe(500);
        expect(error.response.body).toContain('Internal Server Error');
      }
    });

    it('should handle network errors', async () => {
      nock('https://api.example.com')
        .get('/endpoint')
        .replyWithError('Network error');

      await expect(
        gotClient.get('https://api.example.com/endpoint').json()
      ).rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      nock('https://api.example.com')
        .get('/endpoint')
        .delay(6000)
        .reply(200);

      await expect(
        gotClient.get('https://api.example.com/endpoint', {
          timeout: {
            request: 1000,
          },
        }).json()
      ).rejects.toThrow();
    });
  });

  describe('Retry behavior', () => {
    it('should retry on failure', async () => {
      let attempts = 0;
      nock('https://api.example.com')
        .get('/endpoint')
        .times(3)
        .reply(() => {
          attempts++;
          if (attempts < 3) {
            return [500, { error: 'Server error' }];
          }
          return [200, { success: true }];
        });

      const response = await gotClient.get('https://api.example.com/endpoint', {
        retry: {
          limit: 2,
        },
      }).json();

      expect(response).toEqual({ success: true });
      expect(attempts).toBe(3);
    });
  });

  describe('Response types', () => {
    it('should handle text responses', async () => {
      nock('https://api.example.com')
        .get('/endpoint')
        .reply(200, 'Plain text response');

      const response = await gotClient.get('https://api.example.com/endpoint').text();
      expect(response).toBe('Plain text response');
    });

    it('should handle buffer responses', async () => {
      const binaryData = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      nock('https://api.example.com')
        .get('/image.png')
        .reply(200, binaryData);

      const response = await gotClient.get('https://api.example.com/image.png').buffer();
      expect(response).toEqual(binaryData);
    });
  });
});