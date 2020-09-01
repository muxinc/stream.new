import { useState, useEffect } from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';
import useSwr from 'swr';
import Layout from '../../components/layout';
import Button from '../../components/button';
import { transitionDuration } from '../../style-vars';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Asset () {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { data, error } = useSwr(
    () => (router.query.id ? `/api/asset/${router.query.id}` : null),
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
      Router.push(`/v/${asset.playback_id}`);
    }
  }, [asset]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDarkMode((val) => !val);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (asset && asset.status === 'errored') {
    const message = asset.errors && asset.errors.messages[0];
    errorMessage = `Error creating this asset: ${message}`;
  }

  if (errorMessage) {
    return (
      <Layout darkMode={false}>
        <div><h1>{errorMessage}</h1></div>
        <div>
          <Link href="/">
            <Button>Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout footerLinks={[]} darkMode={isDarkMode}>
      <div className="preparing"><h1>Preparing</h1></div>
      <style jsx>{`
        .preparing {
          flex-grow: 1;
          display: flex;
          align-items: center;
          color: ${isDarkMode ? '#fff' : '#111'};
          transition: color ${transitionDuration} ease;
        }
      `}
      </style>
    </Layout>
  );
}
