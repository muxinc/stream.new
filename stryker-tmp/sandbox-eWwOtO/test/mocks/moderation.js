// @ts-nocheck
// Mock Google Vision API responses
export const mockGoogleVisionResponse = {
  responses: [{
    safeSearchAnnotation: {
      adult: 'UNLIKELY',
      spoof: 'VERY_UNLIKELY',
      medical: 'VERY_UNLIKELY',
      violence: 'POSSIBLE',
      racy: 'LIKELY',
    },
  }],
};

export const mockGoogleVisionMultipleResponses = {
  responses: [
    {
      safeSearchAnnotation: {
        adult: 'UNLIKELY',
        violence: 'POSSIBLE',
        racy: 'LIKELY',
      },
    },
    {
      safeSearchAnnotation: {
        adult: 'VERY_LIKELY',
        violence: 'UNLIKELY',
        racy: 'POSSIBLE',
      },
    },
    {
      safeSearchAnnotation: {
        adult: 'POSSIBLE',
        violence: 'VERY_LIKELY',
        racy: 'UNLIKELY',
      },
    },
  ],
};

// Mock Hive AI responses
export const mockHiveAIResponse = {
  status: {
    code: '0',
    message: 'SUCCESS',
  },
  data: {
    classes: [
      {
        class: 'general_nsfw',
        score: 0.8,
      },
      {
        class: 'general_suggestive',
        score: 0.6,
      },
      {
        class: 'yes_female_underwear',
        score: 0.7,
      },
      {
        class: 'yes_male_underwear',
        score: 0.1,
      },
    ],
  },
};

export const mockHiveAIErrorResponse = {
  status: {
    code: '400',
    message: 'Invalid request',
  },
  data: null,
};

// Mock Slack webhook payload
export const mockSlackPayload = {
  text: 'New video uploaded',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*New video uploaded*',
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*Asset ID:*\ntest-asset-id',
        },
        {
          type: 'mrkdwn',
          text: '*Playback ID:*\ntest-playback-id',
        },
      ],
    },
  ],
};

// Mock moderation scores
export const mockModerationScores = {
  google: {
    adult: 2,
    violence: 3,
    suggestive: 4,
  },
  hive: {
    adult: 0.8,
    suggestive: 0.6,
  },
};

// Mock telemetry data
export const mockTelemetryData = {
  event: 'upload_complete',
  uploadId: 'test-upload-id',
  duration: 5000,
  fileSize: 1024 * 1024 * 10, // 10MB
  success: true,
  error: null,
  metadata: {
    browser: 'Chrome',
    os: 'macOS',
  },
};

// Helper to create mock moderation results
export function createMockModerationResult(overrides = {}) {
  return {
    shouldDelete: false,
    scores: mockModerationScores,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

// Helper to create mock webhook signature
export function createMockWebhookSignature(secret = 'test-secret') {
  // This is a simplified version - in real tests you might want to generate actual signatures
  return {
    header: 't=1234567890,v1=test-signature',
    timestamp: '1234567890',
    signature: 'test-signature',
  };
}