import { useState, useEffect } from 'react';
import Router from 'next/router';
import MuxUploader from '@mux/mux-uploader-react';
import useSwr from 'swr';
import Layout from '../components/layout';
import HomePage from '../components/home-page';
import UploadProgressFullpage from '../components/upload-progress-fullpage'; // Also used for recording from camera and screen. Remove import. Not file. (TD).

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Props = null;

const Index: React.FC<Props> = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadId, setUploadId] = useState('');
  const [isPreparing, setIsPreparing] = useState(false);

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
      return Promise.reject(e);
    }
  };

  const handleUpload = (upload: any) => {
    setIsUploading(true);
    console.log(upload.detail);

    // TO-DO: Set initial upload analytics. (TD).
  };

  const handleSuccess = () => {
    setIsPreparing(true);
  };

  useEffect(() => {
    if (upload && upload.asset_id) {
      Router.push({
        pathname: `/assets/${upload.asset_id}`,
      });
    }
  }, [upload]);

  return (
    <Layout
      dragActive
      isUploading={false}
    >
      {/* Render with children if upload in progress. Render only children if upload not in progress. (TD).*/}
      <HomePage isUploading={false}>
          {/* TO-DO: Revisit typescript errors. Add ability to style button border and button padding. (TD). */}
          <MuxUploader 
            onUploadStart={handleUpload}
            onSuccess={handleSuccess}
            className="uploader"
            style={{ 
              '--button-border-radius': '50px',
              '--button-hover-background': '#222', 
              fontSize: '26px',
              fontFamily: 'Akkurat',
              lineHeight: '33px',
            }} 
            id="uploader" endpoint={createUpload} type="bar" status />
          <style>{`
            [upload-in-progress] {
              width: 100%;
            }
          `}
          </style>
      </HomePage>
    </Layout>
  );
};

export default Index;
