import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Router from 'next/router';
import MuxUploader from '@mux/mux-uploader-react';
import type { MuxUploaderProps } from '@mux/mux-uploader-react';
import useSwr from 'swr';
import Button from '../components/button';
import Layout from '../components/layout';
import { breakpoints } from '../style-vars';
import { reportUploadTelemetry, UploadTelemetry, ChunkInfo } from '../lib/telemetry';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Props = null;

const Index: React.FC<Props> = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadId, setUploadId] = useState<string>('');
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [uploadAnalytics, setUploadAnalytics] = useState<Partial<UploadTelemetry> & Pick<UploadTelemetry, 'chunks'>>({ chunks: []});

  const { data } = useSwr(
    () => (isPreparing ? `/api/uploads/${uploadId}` : null),
    fetcher,
    { refreshInterval: 5000 }
  );

  const upload = data && data.upload;

  const createUpload = async () => {
    try {
      const res = await fetch('/api/uploads', { method: 'POST' });
      const { id, url } = await res.json();
      setUploadId(id);
      return url;
    } catch (e) {
      console.error('Error in createUpload', e);
      setErrorMessage('Error creating upload.');
      return e;
    }
  };

  const handleUpload: MuxUploaderProps['onUploadStart'] = ({ detail }) => {
    setIsUploading(true);

    const initialUploadAnalytics: UploadTelemetry = {
      fileSize: detail.file.size,
      chunkSize: detail.chunkSize,
      uploadStarted: Date.now(),
      dynamicChunkSize: isDynamicChunkSizeSet,
      chunks: [],
    };

    setUploadAnalytics(initialUploadAnalytics);
  };

  const handleChunkAttempt: MuxUploaderProps['onChunkAttempt'] = ({ detail }) => {
    const chunks: ChunkInfo[] = [...uploadAnalytics.chunks];
    chunks[detail.chunkNumber] = {
      size: detail.chunkSize,
      uploadStarted: Date.now(),
    };

    setUploadAnalytics({
      ...uploadAnalytics,
      chunks,
    });
  };

  const handleChunkSuccess: MuxUploaderProps['onChunkSuccess'] = ({ detail }) => {
    const chunks = [...uploadAnalytics.chunks];
    chunks[detail.chunk].uploadFinished = Date.now();
    chunks[detail.chunk].size = detail.chunkSize;

    setUploadAnalytics({
      ...uploadAnalytics,
      chunks,
    });
  };

  const handleSuccess: MuxUploaderProps['onSuccess'] = () => {
    reportUploadTelemetry({
      ...uploadAnalytics,
      uploadFinished: Date.now(),
      uploadId,
    });
    setIsPreparing(true);
  };

  const handleUploadError: MuxUploaderProps['onUploadError'] = ({ detail }) => {
    setIsUploading(false);
    reportUploadTelemetry({
      ...uploadAnalytics,
      uploadId,
      uploadFinished: Date.now(),
      uploadErrored: true,
      message: detail.message,
    });
  };


  const [isDynamicChunkSizeSet, setIsDynamicChunkSizeSet] = useState(false);
  useEffect(() => {
    const isDynamic: string = Cookies.get('dynamicChunkSize') || '';
    setIsDynamicChunkSizeSet(isDynamic === 'true');

    if (upload && upload.asset_id) {
      Router.push({
        pathname: `/assets/${upload.asset_id}`,
      });
    }
  }, [upload]);

  if (errorMessage) {
    return (
      <Layout>
        <div style={{ paddingBottom: '20px'}}><h1>{errorMessage}</h1></div>
        <div>
          <Button onClick={Router.reload}>Reset</Button>
        </div>
      </Layout>
    );
  }
 

  return (
    <Layout
      dragActive
      isUploading={isUploading}
    >
      <div className='wrapper'>
        {!isUploading ? (
          <div>
            <h1>Add a video.</h1>
            <h1>Get a shareable link to stream it.</h1>
          </div>
          ) : null}
        <div className={isUploading ? '' : 'cta'}>
          {!isUploading ? (
            <div className="drop-notice">
              <h2>↓ Drag & drop a video file anywhere</h2>
            </div>
          ) : null}
          <MuxUploader
            id="uploader"
            noDrop
            onUploadStart={handleUpload}
            onChunkAttempt={handleChunkAttempt}
            onChunkSuccess={handleChunkSuccess}
            onSuccess={handleSuccess}
            onUploadError={handleUploadError}
            dynamicChunkSize={isDynamicChunkSizeSet}
            endpoint={createUpload}
            style={{ fontSize: isUploading ? '4vw': '26px' }}
          >
            <Button className={isUploading ? 'hidden' : '' } slot="file-select">Upload video</Button>
          </MuxUploader>
        {!isUploading ? (
          <>
            <div className="cta-record">
              <Button buttonLink href="/record?source=camera">Record from camera</Button>
            </div>
            <div className="cta-record">
              <Button buttonLink href="/record?source=screen">Record my screen</Button>
            </div>
          </>
        ) : null}
        </div>
      </div>
      <style jsx>{`
        .wrapper {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          width: ${isUploading ? '100%' : 'auto'};
        }
        input {
          display: none;
        }
        .drop-notice {
          display: none;
        }

        .cta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-end;
          margin-right: 15px;
        }
        .cta .button {
          margin: 8px 0;
        }

        .cta {
          margin-top: 30px;
          display: flex;
          flex-direction: column;
        }
        .cta-text-mobile {
          display: inline-block;
        }
        .cta-text-desktop {
          display: none;
        }
        .cta-record {
          display: none;
        }

        @media only screen and (min-width: ${breakpoints.md}px) {
          .cta-record {
            display: block;
            margin-top: 15px;
          }
          .drop-notice {
            display: block;
            text-align: right;
            float: right;
            color: #fff;
            margin-bottom: 5px;
            opacity: 0.5;
            mix-blend-mode: exclusion;
          }
          .drop-notice h2 {
            margin-top: 0;
          }

          .cta-text-mobile {
            display: none;
          }
          .cta-text-desktop {
            display: inline-block;
          }
        }
      `}
      </style>
      <style jsx global>{`
        mux-uploader::part(progress-percentage) {
          align-items: flex-start;
        }
      `}
      </style>
    </Layout>
  );
};

export default Index;
