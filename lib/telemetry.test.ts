/**
 * @jest-environment node
 */
import { reportUploadTelemetry, UploadTelemetry, ChunkInfo } from './telemetry';

// Mock fetch
global.fetch = jest.fn();

describe('telemetry', () => {
  beforeEach(() => {
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('reportUploadTelemetry', () => {
    it('exports reportUploadTelemetry function', () => {
      expect(typeof reportUploadTelemetry).toBe('function');
    });

    it('sends upload telemetry data', () => {
      const uploadData: UploadTelemetry = {
        uploadId: 'test-upload-123',
        fileSize: 1024000,
        uploadStarted: Date.now(),
        uploadFinished: Date.now() + 5000,
        chunkSize: 8192,
        chunks: [
          { size: 8192, uploadStarted: Date.now() },
          { size: 8192, uploadStarted: Date.now() + 1000, uploadFinished: Date.now() + 2000 },
        ],
      };

      reportUploadTelemetry(uploadData);

      expect(fetch).toHaveBeenCalledWith('/api/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'upload',
          data: uploadData,
        }),
      });
    });

    it('handles minimal telemetry data', () => {
      const minimalData: UploadTelemetry = {
        chunks: [],
      };

      reportUploadTelemetry(minimalData);

      expect(fetch).toHaveBeenCalledWith('/api/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'upload',
          data: minimalData,
        }),
      });
    });

    it('handles upload error scenarios', () => {
      const errorData: UploadTelemetry = {
        uploadId: 'failed-upload-456',
        message: 'Upload failed due to network error',
        uploadErrored: true,
        fileSize: 512000,
        uploadStarted: Date.now(),
        chunks: [
          { size: 8192, uploadStarted: Date.now() },
        ],
      };

      reportUploadTelemetry(errorData);

      expect(fetch).toHaveBeenCalledWith('/api/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'upload',
          data: errorData,
        }),
      });
    });

    it('handles dynamic chunk size scenarios', () => {
      const dynamicData: UploadTelemetry = {
        uploadId: 'dynamic-upload-789',
        dynamicChunkSize: true,
        fileSize: 2048000,
        chunks: [
          { size: 4096, uploadStarted: Date.now() },
          { size: 8192, uploadStarted: Date.now() + 1000 },
          { size: 16384, uploadStarted: Date.now() + 2000 },
        ],
      };

      reportUploadTelemetry(dynamicData);

      expect(fetch).toHaveBeenCalled();
      const callArgs = (fetch as jest.Mock).mock.calls[0];
      const bodyData = JSON.parse(callArgs[1].body);
      
      expect(bodyData.type).toBe('upload');
      expect(bodyData.data.dynamicChunkSize).toBe(true);
      expect(bodyData.data.chunks).toHaveLength(3);
    });
  });

  describe('type definitions', () => {
    it('exports ChunkInfo type', () => {
      const chunk: ChunkInfo = {
        size: 1024,
        uploadStarted: Date.now(),
        uploadFinished: Date.now() + 1000,
      };
      expect(chunk.size).toBe(1024);
      expect(typeof chunk.uploadStarted).toBe('number');
    });

    it('exports UploadTelemetry type', () => {
      const telemetry: UploadTelemetry = {
        uploadId: 'test',
        chunks: [],
      };
      expect(telemetry.uploadId).toBe('test');
      expect(Array.isArray(telemetry.chunks)).toBe(true);
    });
  });
});