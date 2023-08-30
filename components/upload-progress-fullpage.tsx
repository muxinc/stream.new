import { useState, useEffect, useRef } from 'react';
import Router from 'next/router';
import { UpChunk } from '@mux/upchunk';
import useSwr from 'swr';
import Layout from './layout';
import Button from './button';
import Cookies from 'js-cookie';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const MAX_VIDEO_DURATION_MIN = 60;

type ChunkInfo = {
  size: number;
  uploadStarted: number;
  uploadFinished?: number;
}

type UploadTelemetry = {
  fileSize: number;
  uploadStarted: number;
  uploadFinished?: number;
  chunkSize: number;
  dynamicChunkSize: boolean;
  chunks: ChunkInfo[];
};

type Props = {
  file: File;
  resetPage: () => void;
};

const UploadProgressFullpage: React.FC<Props> = ({ file, resetPage }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadId, setUploadId] = useState('');
  const [progress, setProgress] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data, error } = useSwr(
    () => (isPreparing ? `/api/uploads/${uploadId}` : null),
    fetcher,
    { refreshInterval: 5000 }
  );

  const upload = data && data.upload;

  const createUpload = async () => {
    try {
      return fetch('/api/uploads', {
        method: 'POST',
      })
        .then((res) => res.json())
        .then(({ id, url }) => {
          setUploadId(id);
          return url;
        });
    } catch (e) {
      console.error('Error in createUpload', e); // eslint-disable-line no-console
      setErrorMessage('Error creating upload');
      return Promise.reject(e);
    }
  };

  const startUpload = (_file: File) => {
    if (isUploading) {
      return;
    }

    const dynamicChunkSize = isDynamicChunkSizeSet.current;

    setIsUploading(true);
    try {
      const upChunk = UpChunk.createUpload({
        endpoint: createUpload,
        maxFileSize: 2 ** 20, // 1GB
        file: _file,
        dynamicChunkSize,
      });

      const uploadAnalytics: UploadTelemetry = {
        fileSize: _file.size,
        chunkSize: upChunk.chunkSize,
        uploadStarted: Date.now(),
        dynamicChunkSize,
        chunks: [],
      };

      upChunk.on('attempt', ({ detail }) => {
        uploadAnalytics.chunks[detail.chunkNumber] = {
          size: detail.chunkSize,
          uploadStarted: Date.now(),
        };
      });

      upChunk.on('chunkSuccess', ({ detail }) => {
        uploadAnalytics.chunks[detail.chunk].uploadFinished = Date.now();
        // chunk size may have changed due to dynamic chunk sizes
        uploadAnalytics.chunks[detail.chunk].size = detail.chunkSize;
      });

      upChunk.on('error', (err) => {
        setErrorMessage(err.detail);
      });

      upChunk.on('progress', (progressEvt) => {
        setProgress(Math.floor(progressEvt.detail));
      });

      upChunk.on('success', () => {
        uploadAnalytics.uploadFinished = Date.now();

        fetch('/api/telemetry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'upload',
            data: uploadAnalytics,
          })
        });

        setIsPreparing(true);
      });
    } catch (err) {
      setErrorMessage((err as Error).toString());
    }
  };

  const isDynamicChunkSizeSet = useRef(false);
  useEffect(() => {
    const isDynamic: string = Cookies.get('dynamicChunkSize') || '';
    isDynamicChunkSizeSet.current = isDynamic === 'true';

    if (upload && upload.asset_id) {
      Router.push({
        pathname: `/assets/${upload.asset_id}`,
      });
    }
  }, [upload]);

  const startFileValidation = (_file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Attempt to load the file as a video element and inspect its duration
      // metadata. This is not an authoritative check of video duration, but
      // rather intended to serve as just a simple and fast sanity check.
      if (!_file.type.includes('video')) {
        console.warn(`file type (${_file.type}) does not look like video!`);
        resolve();
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = function () {
        URL.revokeObjectURL(video.src);
        if (
          video.duration !== Infinity &&
          video.duration > MAX_VIDEO_DURATION_MIN * 60
        ) {
          const dur = Math.round(video.duration * 100) / 100;
          reject(
            `file duration (${dur.toString()}s) exceeds allowed maximum (${MAX_VIDEO_DURATION_MIN}min)!`
          );
        }
        resolve();
      };
      video.onerror = function () {
        // The file has a video MIME type, but we were unable to load its
        // metadata for some reason.
        console.warn('failed to load video file metadata for validation!');
        URL.revokeObjectURL(video.src);
        resolve();
      };
      video.src = URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    if (!file) {
      return;
    }

    startFileValidation(file)
      .then(() => {
        startUpload(file);
      })
      .catch((error) => {
        setErrorMessage(error);
      });
  }, [file]);

  return (
    <Layout centered spinningLogo>
      {errorMessage || error ? (
        <div>
          <h1>Oops there was a problem uploading your file!</h1>
          <p>{(error && 'Error fetching API') || errorMessage}</p>
          <Button onClick={resetPage}>Start over</Button>
        </div>
      ) : (
        <div className="percent">
          <h1>{progress ? `${progress}` : '0'}</h1>
        </div>
      )}
      <style jsx>
        {`
          .percent {
            flex-grow: 1;
            display: flex;
            align-items: center;
          }

          .percent h1 {
            font-size: 8vw;
          }
        `}
      </style>
    </Layout>
  );
};

export default UploadProgressFullpage;
