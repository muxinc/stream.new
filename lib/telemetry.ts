export type ChunkInfo = {
  size: number;
  uploadStarted: number;
  uploadFinished?: number;
};

export type UploadTelemetry = {
  uploadId?: string;
  message?: string;
  fileSize?: number;
  uploadStarted?: number;
  uploadFinished?: number;
  uploadErrored?: boolean;
  dynamicChunkSize?: boolean;
  chunkSize?: number;
  chunks: ChunkInfo[];
}

export function reportUploadTelemetry(data: UploadTelemetry) {
  fetch('/api/telemetry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'upload',
      data,
    }),
  });
}