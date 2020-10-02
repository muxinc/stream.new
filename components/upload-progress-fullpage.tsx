import { useState, useEffect } from 'react';
import Router from 'next/router';
import * as UpChunk from '@mux/upchunk';
import useSwr from 'swr';
import Layout from './layout';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Props = {
  file: File
};

const UploadProgressFullpage: React.FC<Props> = ({ file }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadId, setUploadId] = useState('');
  const [progress, setProgress] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data, error } = useSwr(
    () => (isPreparing ? `/api/uploads/${uploadId}` : null),
    fetcher,
    { refreshInterval: 5000 },
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

    setIsUploading(true);
    const upChunk = UpChunk.createUpload({
      endpoint: createUpload,
      file: _file,
    });

    upChunk.on('error', (err) => {
      setErrorMessage(err.detail);
    });

    upChunk.on('progress', (progressEvt) => {
      setProgress(Math.floor(progressEvt.detail));
    });

    upChunk.on('success', () => {
      setIsPreparing(true);
    });
  };

  useEffect(() => {
    if (upload && upload.asset_id) {
      Router.push({
        pathname: `/assets/${upload.asset_id}`,
      });
    }
  }, [upload]);

  useEffect(() => {
    if (file) {
      startUpload(file);
    }
  }, [file]);

  return (
    <Layout centered spinningLogo>
      {
        (errorMessage || error)
          ? <div><h1>{(error && 'Error fetching API') || errorMessage}</h1></div>
          : <div className="percent"><h1>{progress ? `${progress}` : '0'}</h1></div>
      }
      <style jsx>{`
        .percent {
          flex-grow: 1;
          display: flex;
          align-items: center;
        }

        h1 {
          font-size: 8vw;
        }
      `}
      </style>
    </Layout>
  );
};

export default UploadProgressFullpage;
