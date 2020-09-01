import { useState, useEffect } from 'react';
import Router from 'next/router';
import * as UpChunk from '@mux/upchunk';
import useSwr from 'swr';
import Layout from './layout';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function UploadProgressFullpage ({ file }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadId, setUploadId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data, error } = useSwr(
    () => (isPreparing ? `/api/upload/${uploadId}` : null),
    fetcher,
    { refreshInterval: 5000 },
  );

  const upload = data && data.upload;

  const createUpload = async () => {
    try {
      return fetch('/api/upload', {
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

  const startUpload = (_file) => {
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
        pathname: `/asset/${upload.asset_id}`,
        scroll: false,
      });
    }
  }, [upload]);

  useEffect(() => {
    if (file) {
      startUpload(file);
    }
  }, [file]);

  return (
    <Layout>
      {
        (errorMessage || error)
          ? <div><h1>{(error && 'Error fetching API') || errorMessage}</h1></div>
          : <div className="percent"><h1>{progress ? `${progress}%` : 0}</h1></div>
      }
      <style jsx>{`
        .percent {
          flex-grow: 1;
          display: flex;
          align-items: center;
        }
      `}
      </style>
    </Layout>
  );
}
