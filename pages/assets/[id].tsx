import { useState, useEffect } from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import useSwr from 'swr';
import Layout from '../../components/layout';
import Button from '../../components/button';
import FullpageLoader from '../../components/fullpage-loader';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Props = null;

const Asset: React.FC<Props> = () => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { data, error } = useSwr(
    () => (router.query.id ? `/api/assets/${router.query.id}` : null),
    fetcher,
    { refreshInterval: 5000 },
  );

  const asset = data && data.asset;

  let errorMessage;

  if (error) {
    errorMessage = 'Error fetching api';
  }

  if (data && data.error) {
    errorMessage = data.error;
  }

  useEffect(() => {
    if (asset && asset.playback_id && asset.status === 'ready') {
      // Comment out the next line to simulate a constant 'Preparing...' state
      Router.push(`/v/${asset.playback_id}`);
    }
  }, [asset]);

  useEffect(() => {
    /*
     * We want the page to finish rendering with light mode,
     * Then after load toggle to dark mode, which does a transition animation
     */
      setTimeout(() => setIsDarkMode(true));
  }, []);

 if (asset && asset.status === 'errored') {
    const message = asset.errors && asset.errors.messages[0];
    errorMessage = {
      initial: 'Error creating this asset: Please upload a valid video file (gifs are not supported)',
      apiError: message
  }}

  if (errorMessage) {
    return (
      <Layout darkMode={false}>
        <div><h1>{errorMessage.initial}</h1></div>
        <div>
          <p>
            {errorMessage.apiError}
            </p>
          <Link href="/">
            <Button>Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout centered darkMode={isDarkMode} spinningLogo>
      <FullpageLoader text="Preparing" />
    </Layout>
  );
};

export default Asset;
