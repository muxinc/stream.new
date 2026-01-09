'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import useSwr from 'swr';
import Layout from '../../../components/layout';
import Button from '../../../components/button';
import FullpageLoader from '../../../components/fullpage-loader';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Asset() {
  const router = useRouter();
  const params = useParams();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { data, error } = useSwr(
    () => (params.id ? `/api/assets/${params.id}` : null),
    fetcher,
    { refreshInterval: 5000 },
  );

  const asset = data && data.asset;

  let errorMessage;
  let errorDetails;

  if (error) {
    errorMessage = 'Error fetching api';
  }

  if (data && data.error) {
    errorMessage = data.error;
  }

  useEffect(() => {
    if (asset && asset.playback_id && asset.status === 'ready') {
      // Comment out the next line to simulate a constant 'Preparing...' state
      router.push(`/v/${asset.playback_id}`);
    }
  }, [asset, router]);

  useEffect(() => {
    /*
     * We want the page to finish rendering with light mode,
     * Then after load toggle to dark mode, which does a transition animation
     */
      setTimeout(() => setIsDarkMode(true));
  }, []);

 if (asset && asset.status === 'errored') {
    errorMessage = 'Error creating this asset: Please upload a valid video file (gifs are not supported)';
    errorDetails = asset.errors && asset.errors.messages[0];
  }

  if (errorMessage) {
    return (
      <Layout darkMode={false}>
        <div><h1>{errorMessage}</h1></div>
        {errorDetails && <p>{errorDetails}</p>}
        <div>
          <Button buttonLink href="/">Home</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout centered darkMode={isDarkMode} spinningLogo>
      <FullpageLoader text="Preparing" />
    </Layout>
  );
}
