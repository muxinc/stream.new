// Mock Mux SDK responses
export const mockAsset = {
  id: 'test-asset-id',
  status: 'ready',
  playback_ids: [{
    id: 'test-playback-id',
    policy: 'public',
  }],
  duration: 120,
  aspect_ratio: '16:9',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  upload_id: 'test-upload-id',
  tracks: [{
    id: 'test-track-id',
    type: 'video',
    duration: 120,
    max_width: 1920,
    max_height: 1080,
    max_frame_rate: 30,
  }],
  mp4_support: 'standard',
  max_stored_resolution: 'HD',
  max_stored_frame_rate: 30,
  passthrough: 'test-passthrough',
};

export const mockUpload = {
  id: 'test-upload-id',
  url: 'https://storage.googleapis.com/mux-uploads/test',
  status: 'waiting',
  new_asset_settings: {
    playback_policy: ['public'],
    mp4_support: 'standard',
  },
  created_at: new Date().toISOString(),
  asset_id: null,
  timeout: 24 * 60 * 60,
};

export const mockWebhookEvent = {
  type: 'video.asset.ready',
  object: {
    type: 'asset',
    id: 'test-asset-id',
  },
  data: mockAsset,
  created_at: new Date().toISOString(),
  id: 'test-webhook-id',
  environment: {
    id: 'test-env-id',
    name: 'Test Environment',
  },
  accessor_source: null,
  accessor: null,
  request_id: null,
  attempts: [{
    webhook_id: 'test-webhook-id',
    response_status_code: 200,
    response_body: '',
    created_at: new Date().toISOString(),
  }],
};

export const mockPlaybackId = {
  id: 'test-playback-id',
  policy: 'public',
  created_at: new Date().toISOString(),
};

export const mockStoryboard = {
  aspect_ratio: '16:9',
  interval: 5,
  url: 'https://image.mux.com/test-playback-id/storyboard.jpg',
  width: 640,
  height: 360,
  row_count: 10,
  column_count: 10,
  tile_width: 64,
  tile_height: 36,
};

// Mock Mux Node SDK
export const createMockMuxClient = () => ({
  Video: {
    Uploads: {
      create: jest.fn().mockResolvedValue({ data: mockUpload }),
      get: jest.fn().mockResolvedValue({ data: mockUpload }),
      cancel: jest.fn().mockResolvedValue({ data: { ...mockUpload, status: 'cancelled' } }),
      list: jest.fn().mockResolvedValue({ data: [mockUpload] }),
    },
    Assets: {
      create: jest.fn().mockResolvedValue({ data: mockAsset }),
      get: jest.fn().mockResolvedValue({ data: mockAsset }),
      del: jest.fn().mockResolvedValue({}),
      list: jest.fn().mockResolvedValue({ data: [mockAsset] }),
      updateMp4Support: jest.fn().mockResolvedValue({ data: { ...mockAsset, mp4_support: 'standard' } }),
      createPlaybackId: jest.fn().mockResolvedValue({ data: mockPlaybackId }),
      deletePlaybackId: jest.fn().mockResolvedValue({}),
      createTrack: jest.fn().mockResolvedValue({ data: { id: 'test-track-id' } }),
      deleteTrack: jest.fn().mockResolvedValue({}),
    },
    PlaybackIds: {
      get: jest.fn().mockResolvedValue({ data: mockPlaybackId }),
    },
  },
  Data: {
    Metrics: {
      list: jest.fn().mockResolvedValue({ data: [] }),
    },
    Errors: {
      list: jest.fn().mockResolvedValue({ data: [] }),
    },
    Exports: {
      list: jest.fn().mockResolvedValue({ data: [] }),
    },
    Filters: {
      list: jest.fn().mockResolvedValue({ data: [] }),
    },
    VideoViews: {
      list: jest.fn().mockResolvedValue({ data: [] }),
      get: jest.fn().mockResolvedValue({ data: {} }),
    },
  },
  Webhooks: {
    verifyHeader: jest.fn().mockReturnValue(true),
  },
  JWT: {
    signPlaybackId: jest.fn().mockReturnValue('test-jwt-token'),
    signSpaceId: jest.fn().mockReturnValue('test-space-jwt-token'),
    signViewerCounts: jest.fn().mockReturnValue('test-viewer-jwt-token'),
  },
});

// Mock UpChunk
export const mockUpChunk = {
  on: jest.fn(),
  off: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  abort: jest.fn(),
  startTime: Date.now(),
  endTime: null,
  getProgress: jest.fn().mockReturnValue({ detail: 0.5 }),
};

export const createMockUpChunk = () => {
  const mock = { ...mockUpChunk };
  // Make it chainable
  Object.keys(mock).forEach(key => {
    if (typeof mock[key] === 'function' && key !== 'getProgress') {
      const originalFn = mock[key];
      mock[key] = jest.fn((...args) => {
        originalFn(...args);
        return mock;
      });
    }
  });
  return mock;
};